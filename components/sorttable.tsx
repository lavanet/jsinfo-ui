// jsinfo-ui/components/sorttable.tsx

import { useState, useMemo } from 'react';
import { Link, Table, Tabs } from '@radix-ui/themes';
import React from 'react';

type Column = {
  key: string;
  name: string;
}

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
}

type RowFormatters = {
  [key: string]: (rowData: any) => JSX.Element;
};

let seenStrings = new Set();

function assureUnique(str) {
  let baseStr = str;
  let suffix = 0;

  while (seenStrings.has(str)) {
    str = `${baseStr}${++suffix}`;
  }

  seenStrings.add(str);
  return str;
}

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
  columns: Column[];
  requestSort: (key: string) => void;
  sortConfig: SortConfig | null;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = (props) => {
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
    <Table.Header key={assureUnique("TableHeader")}>
      <Table.Row key={assureUnique("TableHeaderRaw")}>
        {props.columns.map((column) => (
          <Table.ColumnHeaderCell key={assureUnique(`TableHeaderCol_${column.key}`)} onClick={() => props.requestSort(column.key)}>
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
    <Table.Cell key={`${props.tableRowKey}_${props.columnName}_cell`}>
      {cellContent}
    </Table.Cell>
  );

}

interface SortableTableRowProps {
  rowData: any;
  index: number;
  pkey: string;
  pkeyUrl: string | null;
  tableName: string;
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
  if (typeof props.tableName !== 'string') {
    throw new Error(`Invalid prop: tableName should be a string, but received type ${typeof props.tableName} with value ${props.tableName}`);
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
  if (props.pkey.endsWith(",counter")) {
    key = key.replace(",counter", "") + `_${props.index}`;
  }
  const tableRowKey = assureUnique(`${props.tableName}_${key}`);

  // dont show rows that have an empty pkey
  if (!getNestedProperty(props.rowData, props.pkey)) return null;

  return (
    <Table.Row key={`${tableRowKey}_row`}>
      {props.firstColumn && 
        <SortableTableRowCell columnName={props.firstColumn} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl} />}
      {props.columns.some(column => column.key === props.pkey) && 
        <SortableTableRowCell columnName={props.pkey} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl}/>}
      {props.columns.map((column) => (
        column.key && column.key !== props.pkey && column.key !== props.firstColumn && 
          <SortableTableRowCell columnName={column.key} tableRowKey={tableRowKey} rowData={props.rowData} rowFormatters={props.rowFormatters ?? null} pkey={props.pkey} pkeyUrl={props.pkeyUrl}/>
      ))}
    </Table.Row>
  );
}
interface SortableTableBodyProps {
  tableData: any[];
  columns: Column[];
  tableName: string;
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
  if (typeof props.tableName !== 'string') {
    throw new Error('Invalid prop: tableName should be a string');
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
    <Table.Body>
      {props.tableData.map((rowData, index) => (
        <SortableTableRow 
          rowData={rowData} 
          index={index} 
          pkey={props.pkey} 
          pkeyUrl={props.pkeyUrl ?? null} 
          tableName={props.tableName} 
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
  tableName: string,
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
  if (typeof props.tableName !== 'string') {
    throw new Error(`Invalid prop: tableName should be a string, but received type ${typeof props.tableName} with value ${props.tableName}`);
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
    <Tabs.Content value={props.tableName}>
      <Table.Root>
        <SortableTableHeader columns={props.columns} requestSort={props.requestSort} sortConfig={props.sortConfig} />
        <SortableTableBody {...props} />
      </Table.Root>
    </Tabs.Content>
  );
}

type SortableTableComponentProps = {
  columns: Column[];
  data: any[];
  defaultSortKey: string;
  tableName: string;
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

  if (typeof props.tableName !== 'string') {
    throw new Error(`Invalid type for tableName. Expected string, received ${props.tableName}`);
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

  const { tableData, requestSort, sortConfig }: SortableData = useSortableData(props.data, props.defaultSortKey);

  return (
    <SortableTableContent
      tableData={tableData}
      requestSort={requestSort}
      sortConfig={sortConfig}
      columns={[...props.columns]}
      tableName={props.tableName}
      pkey={props.pkey}
      pkeyUrl={props.pkeyUrl}
      rowFormatters={props.rowFormatters}
      firstColumn={props.firstColumn}
    />
  );
}