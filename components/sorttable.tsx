// jsinfo-ui/components/sorttable.tsx

import { useState, useMemo, useEffect } from 'react';
import { Link, Table, Tabs } from '@radix-ui/themes';
import React from 'react';
import { useCachedFetch } from '../src/hooks/useCachedFetch';
import Loading from './loading';

type Column = {
  key: string;
  name: string;
  altKey?: string;
}

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
}

type RowFormatters = {
  [key: string]: (rowData: any) => JSX.Element;
};

function getNestedProperty(obj, key) {
  if (key.includes(',')) {
    return key.split(',').map(k => getNestedProperty(obj, k.trim())).join('_');
  }

  return key.split('.').reduce((o, i) => {
    if (o === null || o === undefined || !o.hasOwnProperty(i)) {
      return "";
    }
    return o[i];
  }, obj);
}

interface SortableData {
  tableData: any[];
  requestSort: (key: string) => void;
  sortConfig: SortConfig;
}

const useSortableData = (items: any[], defaultSortKey: string): SortableData => {
  if (!Array.isArray(items)) {
    console.error('Invalid type for items. Expected array, received', items);
    throw new Error(`Invalid type for items. Expected array, received ${Object.prototype.toString.call(items)}`);
  }

  let initialDirection: "ascending" | "descending" = 'ascending';
  let initialKey = defaultSortKey;
  if (defaultSortKey.endsWith('|desc')) {
    initialDirection = 'descending';
    initialKey = defaultSortKey.slice(0, -5);
  }

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: initialKey, direction: initialDirection });

  const tableData = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = getNestedProperty(a, sortConfig.key);
        let bValue = getNestedProperty(b, sortConfig.key);

        // Handle null or undefined values
        if (aValue === null || aValue === undefined) {
          aValue = '';
        }
        if (bValue === null || bValue === undefined) {
          bValue = '';
        }

        // If both values are numbers or can be converted to numbers, compare as numbers
        let aValueNumber = Number(aValue);
        let bValueNumber = Number(bValue);
        if (!isNaN(aValueNumber) && !isNaN(bValueNumber)) {
          return (aValueNumber - bValueNumber) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }

        // Convert numbers to strings for comparison
        if (typeof aValue === 'number') {
          aValue = aValue.toString();
        }
        if (typeof bValue === 'number') {
          bValue = bValue.toString();
        }

        return aValue.localeCompare(bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = key => {
    let direction: "ascending" | "descending" = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { tableData, requestSort, sortConfig };
};
interface SortableTableHeaderProps {
  tableAndTabName: string;
  columns: Column[];
  requestSort: (key: string) => void;
  sortConfig: SortConfig | null;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = (props) => {
  if (typeof props.tableAndTabName !== 'string') {
    throw new Error(`Invalid prop: tableAndTabName should be a string, but received type ${typeof props.tableAndTabName} with value ${props.tableAndTabName}`);
  }
  if (!Array.isArray(props.columns)) {
    throw new Error('Invalid prop: columns should be an array');
  }
  if (typeof props.requestSort !== 'function') {
    throw new Error('Invalid prop: requestSort should be a function');
  }
  if (props.sortConfig !== null && typeof props.sortConfig !== 'object') {
    throw new Error('Invalid prop: sortConfig should be an object or null');
  }

  return (
    <Table.Header key={`SortatableHeader_${props.tableAndTabName}`}>
      <Table.Row key={`SortatableHeaderColRow_${props.tableAndTabName}`}>
        {props.columns.map((column) => (
          <Table.ColumnHeaderCell key={`SortatableHeaderCol_${props.tableAndTabName}_${column.key}`} onClick={() => props.requestSort(column.key)}>
            {column.name} {props.sortConfig && props.sortConfig.key === column.key ? (props.sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
}

interface SortableTableRowCellProps {
  columnName: string;
  rowData: Record<any, any>;
  rowFormatters: RowFormatters | null;
  tableRowKey: string;
  pkey: string;
  pkeyUrl: string | null;
}

const SortableTableRowCell: React.FC<SortableTableRowCellProps> = (props) => {

  if (typeof props.columnName !== 'string') {
    throw new Error(`Invalid prop: key should be a string, but received type ${typeof props.columnName} with value ${props.columnName}`);
  }
  if (typeof props.rowData !== 'object') {
    throw new Error(`Invalid prop: rowData should be an object, but received type ${typeof props.rowData} with value ${JSON.stringify(props.rowData)}`);
  }
  if (props.rowFormatters && typeof props.rowFormatters !== 'object') {
    throw new Error(`Invalid prop: rowFormatters should be an object or null, but received type ${typeof props.rowFormatters} with value ${JSON.stringify(props.rowFormatters)}`);
  }
  if (typeof props.tableRowKey !== 'string') {
    throw new Error(`Invalid prop: tableRowKey should be a string, but received type ${typeof props.tableRowKey} with value ${props.tableRowKey}`);
  }
  if (typeof props.pkey !== 'string') {
    throw new Error(`Invalid prop: pkey should be a string, but received type ${typeof props.pkey} with value ${props.pkey}`);
  }
  if (props.pkeyUrl && typeof props.pkeyUrl !== 'string') {
    throw new Error(`Invalid prop: pkeyUrl should be a string, but received type ${typeof props.pkeyUrl} with value ${props.pkeyUrl}`);
  }

  let cellContent;

  if (props.rowFormatters && props.rowFormatters[props.columnName]) {
    cellContent = props.rowFormatters[props.columnName](props.rowData);
  } else if (props.columnName === props.pkey && props.pkeyUrl) {
    cellContent = <Link href={`/${props.pkeyUrl}/${getNestedProperty(props.rowData, props.pkey)}`}>{getNestedProperty(props.rowData, props.pkey)}</Link>;
  } else {
    cellContent = getNestedProperty(props.rowData, props.columnName);
  }

  return (
    <Table.Cell key={`SortatableCell_${props.tableRowKey}_${props.columnName}`}>
      {cellContent}
    </Table.Cell>
  );

}

interface SortableTableRowProps {
  rowData: any;
  index: number;
  pkey: string;
  pkeyUrl: string | null;
  tableAndTabName: string;
  firstColumn: string | null;
  columns: any[];
  rowFormatters?: RowFormatters | null;
}

const SortableTableRow: React.FC<SortableTableRowProps> = (props) => {
  if (typeof props.rowData !== 'object') {
    throw new Error(`Invalid prop: rowData should be an object, but received type ${typeof props.rowData} with value ${props.rowData}`);
  }
  if (typeof props.index !== 'number') {
    throw new Error(`Invalid prop: index should be a number, but received type ${typeof props.index} with value ${props.index}`);
  }
  if (typeof props.pkey !== 'string') {
    throw new Error(`Invalid prop: pkey should be a string, but received type ${typeof props.pkey} with value ${props.pkey}`);
  }
  if (typeof props.tableAndTabName !== 'string') {
    throw new Error(`Invalid prop: tableAndTabName should be a string, but received type ${typeof props.tableAndTabName} with value ${props.tableAndTabName}`);
  }
  if (props.firstColumn && typeof props.firstColumn !== 'string') {
    throw new Error(`Invalid prop: firstColumn should be a string or null, but received type ${typeof props.firstColumn} with value ${props.firstColumn}`);
  }
  if (!Array.isArray(props.columns)) {
    throw new Error(`Invalid prop: columns should be an array, but received type ${typeof props.columns} with value ${props.columns}`);
  }
  if (props.rowFormatters && typeof props.rowFormatters !== 'object') {
    throw new Error(`Invalid prop: rowFormatters should be an object or null, but received type ${typeof props.rowFormatters} with value ${props.rowFormatters}`);
  }

  let key = getNestedProperty(props.rowData, props.pkey);
  const tableRowKey = `SorttableRow_${props.tableAndTabName}_${props.tableAndTabName}_${props.index}_${key}`;

  // console.log("Print 40000", props.tableAndTabName, "props", props, "getNestedProperty", getNestedProperty(props.rowData, props.pkey))

  // dont show rows that have an empty pkey
  if (!getNestedProperty(props.rowData, props.pkey)) return null;


  return (
    <Table.Row key={`${tableRowKey}_row`}>
      {props.firstColumn &&
        <SortableTableRowCell key={`${tableRowKey}_row_1`} columnName={props.firstColumn} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl} />}
      {props.columns.some(column => column.key === props.pkey) &&
        <SortableTableRowCell key={`${tableRowKey}_row_2`} columnName={props.pkey} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl} />}
      {props.columns.map((column) => (
        column.key && column.key !== props.pkey && column.key !== props.firstColumn &&
        <SortableTableRowCell key={`${tableRowKey}_row_1_${column.key}`} columnName={column.key} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl} />
      ))}
    </Table.Row>
  );
}
interface SortableTableBodyProps {
  tableData: any[];
  columns: Column[];
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters | null;
  firstColumn?: string | null;
}

const SortableTableBody: React.FC<SortableTableBodyProps> = (props) => {

  if (!Array.isArray(props.tableData)) {
    throw new Error('Invalid prop: tableData should be an array');
  }
  if (!Array.isArray(props.columns)) {
    throw new Error('Invalid prop: columns should be an array');
  }
  if (typeof props.tableAndTabName !== 'string') {
    throw new Error('Invalid prop: tableAndTabName should be a string');
  }
  if (typeof props.pkey !== 'string') {
    throw new Error('Invalid prop: pkey should be a string');
  }
  if (props.pkeyUrl && typeof props.pkeyUrl !== 'string') {
    throw new Error('Invalid prop: pkeyUrl should be a string or null');
  }
  if (props.rowFormatters && typeof props.rowFormatters !== 'object') {
    throw new Error('Invalid prop: rowFormatters should be an object or null');
  }
  if (props.firstColumn && typeof props.firstColumn !== 'string') {
    throw new Error('Invalid prop: firstColumn should be a string or null');
  }

  return (
    <Table.Body key={`SortatableTableBody_${props.tableAndTabName}`}>
      {props.tableData.map((rowData, index) => (
        <SortableTableRow
          key={`SortableTableRow_${props.tableAndTabName}_${index}`}
          rowData={rowData}
          index={index}
          pkey={props.pkey}
          pkeyUrl={props.pkeyUrl ?? null}
          tableAndTabName={props.tableAndTabName}
          firstColumn={props.firstColumn ?? null}
          columns={props.columns}
          rowFormatters={props.rowFormatters ?? null}
        />
      ))}
    </Table.Body>
  );
}

type SortableTableProps = {
  tableData: any[],
  requestSort: (key: string) => void,
  sortConfig: SortConfig,
  columns: Column[],
  tableAndTabName: string,
  pkey: string,
  pkeyUrl?: string | null,
  rowFormatters?: RowFormatters;
  firstColumn?: string;
};


const SortableTableContent: React.FC<SortableTableProps> = (props) => {
  if (!Array.isArray(props.tableData)) {
    throw new Error(`Invalid prop: tableData should be an array, but received type ${typeof props.tableData} with value ${props.tableData}`);
  }
  if (!Array.isArray(props.columns)) {
    throw new Error(`Invalid prop: columns should be an array, but received type ${typeof props.columns} with value ${props.columns}`);
  }
  if (typeof props.tableAndTabName !== 'string') {
    throw new Error(`Invalid prop: tableAndTabName should be a string, but received type ${typeof props.tableAndTabName} with value ${props.tableAndTabName}`);
  }
  if (typeof props.pkey !== 'string') {
    throw new Error(`Invalid prop: pkey should be a string, but received type ${typeof props.pkey} with value ${props.pkey}`);
  }
  if (props.pkeyUrl && typeof props.pkeyUrl !== 'string') {
    throw new Error(`Invalid prop: pkeyUrl should be a string or null, but received type ${typeof props.pkeyUrl} with value ${props.pkeyUrl}`);
  }
  if (props.rowFormatters && typeof props.rowFormatters !== 'object') {
    throw new Error(`Invalid prop: rowFormatters should be an object or null, but received type ${typeof props.rowFormatters} with value ${props.rowFormatters}`);
  }
  if (props.firstColumn && typeof props.firstColumn !== 'string') {
    throw new Error(`Invalid prop: firstColumn should be a string or null, but received type ${typeof props.firstColumn} with value ${props.firstColumn}`);
  }

  return (
    <Table.Root>
      <SortableTableHeader tableAndTabName={props.tableAndTabName} columns={props.columns} requestSort={props.requestSort} sortConfig={props.sortConfig} />
      <SortableTableBody {...props} />
    </Table.Root>
  );
}

type SortableTableComponentProps = {
  columns: Column[];
  data: any[];
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters;
  firstColumn?: string;
};

export const SortableTableComponent: React.FC<SortableTableComponentProps> = (props) => {
  // Check if data is an array
  if (!Array.isArray(props.data)) {
    throw new Error("Data is not an array");
  }

  if (props.data.length > 0) {
    // Check if the first item in the array is an object
    if (typeof props.data[0] !== 'object') {
      console.error("First item in the data array is not an object:", props.data);
      throw new Error("First item in the data array is not an object");
    }

    // Check if the second item in the array is an object
    if (props.data.length > 1 && typeof props.data[1] !== 'object') {
      throw new Error("Second item in the data array is not an object");
    }

    // Check if the first and second items have the same keys
    if (props.data.length > 1) {
      const firstItemKeys = Object.keys(props.data[0]).sort();
      const secondItemKeys = Object.keys(props.data[1]).sort();

      if (JSON.stringify(firstItemKeys) !== JSON.stringify(secondItemKeys)) {
        throw new Error("First and second items in the data array do not have the same keys");
      }
    }
  }

  if (!props.columns || !Array.isArray(props.columns)) {
    console.error("Invalid type for columns:", props.columns);
    throw new Error(`Invalid type for columns. Expected array, received ${props.columns}`);
  }

  if (typeof props.defaultSortKey !== 'string') {
    throw new Error(`Invalid type for defaultSortKey. Expected string, received ${props.defaultSortKey}`);
  }

  if (typeof props.tableAndTabName !== 'string') {
    throw new Error(`Invalid type for tableAndTabName. Expected string, received ${props.tableAndTabName}`);
  }

  if (typeof props.pkey !== 'string') {
    throw new Error(`Invalid type for pkey. Expected string, received ${props.pkey}`);
  }

  if (props.pkeyUrl && typeof props.pkeyUrl !== 'string') {
    throw new Error(`Invalid type for pkeyUrl. Expected string, received ${typeof props.pkeyUrl}`);
  }

  if (props.firstColumn && typeof props.firstColumn !== 'string') {
    throw new Error(`Invalid type for firstColumn. Expected string?, received ${typeof props.pkeyUrl}`);
  }

  if (props.firstColumn && !props.columns.some(column => column.key === props.firstColumn)) {
    throw new Error(`firstColumn "${props.firstColumn}" is not included in columns`);
  }

  if (props.data && props.data.length > 0) {
    const firstEntry = props.data[0];
    for (let column of props.columns) {
      // skip the keys the go deep
      if (column.key.includes('.')) {
        continue
      }
      if (!(column.key in firstEntry)) {
        if (column.altKey && column.altKey in firstEntry) {
          column.key = column.altKey;
        } else {
          throw new Error(`Column is not present in the first entry of data. Column object: ${JSON.stringify(column)}. First entry: ${JSON.stringify(props.data[0])} of type "${typeof props.data[0]}"`);
        }
      }
    }
  }

  const { tableData, requestSort, sortConfig }: SortableData = useSortableData(props.data, props.defaultSortKey);

  return (
    <SortableTableContent
      tableData={tableData}
      requestSort={requestSort}
      sortConfig={sortConfig}
      columns={[...props.columns]}
      tableAndTabName={props.tableAndTabName}
      pkey={props.pkey}
      pkeyUrl={props.pkeyUrl}
      rowFormatters={props.rowFormatters}
      firstColumn={props.firstColumn}
    />
  );
}

type SortableTableInATabComponentProps = {
  columns: Column[];
  data: any[];
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters;
  firstColumn?: string;
};

export const SortableTableInATabComponent: React.FC<SortableTableInATabComponentProps> = (props) => {
  return (
    <Tabs.Content value={props.tableAndTabName}>
      <SortableTableComponent
        columns={props.columns}
        data={props.data}
        defaultSortKey={props.defaultSortKey}
        tableAndTabName={props.tableAndTabName}
        pkey={props.pkey}
        pkeyUrl={props.pkeyUrl}
        rowFormatters={props.rowFormatters}
        firstColumn={props.firstColumn}
      />
    </Tabs.Content>
  );
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div>
          <p>Boundary Error: {this.state.error.message}</p>
        </div>
      );
    }

    return (
      <>{this.props.children}</>
    );
  }
}

type DataKeySortableTableComponentProps = {
  columns: Column[];
  dataKey: string;
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters;
  firstColumn?: string;
};

export const DataKeySortableTableComponent: React.FC<DataKeySortableTableComponentProps> = (props) => {
  const { data, loading, error } = useCachedFetch({ dataKey: props.dataKey, useLastUrlPathInKey: true });

  const [componentData, setComponentData] = useState(<div>{`Loading ${props.tableAndTabName} table`}</div>);

  useEffect(() => {
    if (loading) {
      setComponentData(<Loading loadingText={`Loading ${props.tableAndTabName} page`} />);
    } else if (error) {
      setComponentData(<div>Error: {error}</div>);
    } else if (data) {
      setComponentData(
        <ErrorBoundary>
          <SortableTableComponent
            columns={props.columns}
            data={data}
            defaultSortKey={props.defaultSortKey}
            tableAndTabName={props.tableAndTabName}
            pkey={props.pkey}
            pkeyUrl={props.pkeyUrl}
            rowFormatters={props.rowFormatters}
            firstColumn={props.firstColumn}
          />
        </ErrorBoundary>
      );
    }
  }, [loading, error, data]);

  // console.log("!!!!! DataKeySortableTableInATabComponent - dataKey:", props.dataKey, "loading:", loading, "error:", error, "timestamp:", new Date().toISOString());

  return componentData;
}

type DataKeySortableTableInATabComponentProps = {
  columns: Column[];
  dataKey: string;
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters;
  firstColumn?: string;
};

export const DataKeySortableTableInATabComponent: React.FC<DataKeySortableTableInATabComponentProps> = (props) => {
  return (
    <Tabs.Content value={props.tableAndTabName}>
      <DataKeySortableTableComponent
        columns={props.columns}
        dataKey={props.dataKey}
        defaultSortKey={props.defaultSortKey}
        tableAndTabName={props.tableAndTabName}
        pkey={props.pkey}
        pkeyUrl={props.pkeyUrl}
        rowFormatters={props.rowFormatters}
        firstColumn={props.firstColumn}
      />
    </Tabs.Content>
  );
}