// useSortableData.js
import { useState, useMemo } from 'react';
import { Link, Table, Tabs } from '@radix-ui/themes';

type Column = {
  key: string;
  name: string;
}

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
}


type SortableTableProps = {
  sortedItems: any[],
  requestSort: Function,
  sortConfig: SortConfig,
  columns: Column[],
  tableValue: string,
  pkey: string,
  pkey_url: string,
  rowFormatters?: RowFormatters;
};

type RowFormatters = {
  [key: string]: (rowData: any) => JSX.Element;
};

type SortableTableComponentProps = {
  columns: Column[];
  data: any[];
  defaultSortKey: string;
  tableValue: string;
  pkey: string;
  pkey_url: string;
  rowFormatters?: RowFormatters;
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

const useSortableData = (items, defaultSortKey) => {
  if (!Array.isArray(items)) {
    console.error('Invalid type for items. Expected array, received', items);
    throw new Error(`Invalid type for items. Expected array, received ${Object.prototype.toString.call(items)}`);
  }

  let initialDirection = 'ascending';
  let initialKey = defaultSortKey;
  if (defaultSortKey.endsWith('|desc')) {
    initialDirection = 'descending';
    initialKey = defaultSortKey.slice(0, -5); 
  }
  
  const [sortConfig, setSortConfig] = useState({ key: initialKey, direction: initialDirection });

  const sortedItems = useMemo(() => {
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
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { sortedItems, requestSort, sortConfig };
};

function TableHeader({ columns, requestSort, sortConfig }) {
  return (
    <Table.Header>
      <Table.Row>
        {columns.map((column) => (
          <Table.ColumnHeaderCell onClick={() => requestSort(column.key)}>
            {column.name} {sortConfig && sortConfig.key === column.key ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
}

function TableBody({ sortedItems, columns, tableValue, pkey, pkey_url, rowFormatters }) {
  return (
    <Table.Body>
      {sortedItems.map((provider, index) => {
        let key = getNestedProperty(provider, pkey);
        if (pkey.endsWith(",counter")) {
            key = key.replace(",counter", "") + `_${index}`;
        }
        const table_row_key = `${tableValue}_${key}`;
        if (getNestedProperty(provider, pkey)) {
          return (
            <Table.Row key={table_row_key}>
              {columns.some(column => column.key === pkey)
                ? <Table.RowHeaderCell>
                  {rowFormatters && rowFormatters[pkey]
                    ? rowFormatters[pkey](provider)
                    : <Link href={`/${pkey_url}/${getNestedProperty(provider, pkey)}`}>{getNestedProperty(provider, pkey)}</Link>}
                </Table.RowHeaderCell>
                : null
              }
              {columns.map((column) => (
                column.key && column.key !== pkey
                  ? <Table.RowHeaderCell>
                    {rowFormatters && rowFormatters[column.key]
                      ? rowFormatters[column.key](provider)
                      : getNestedProperty(provider, column.key)}
                  </Table.RowHeaderCell>
                  : null
              ))}
            </Table.Row>
          )
        }
      })}
    </Table.Body>
  );
}

function SortableTable(props: SortableTableProps) {
  if (!Array.isArray(props.columns)) {
    throw new Error(`Invalid type for columns. Expected array, received ${typeof props.columns}`);
  }

  return (
    <Tabs.Content value={props.tableValue}>
      <Table.Root>
        <TableHeader columns={props.columns} requestSort={props.requestSort} sortConfig={props.sortConfig} />
        <TableBody {...props} />
      </Table.Root>
    </Tabs.Content>
  );
}

export function SortableTableComponent({
  columns,
  data,
  defaultSortKey,
  tableValue,
  pkey,
  pkey_url,
  rowFormatters
}: SortableTableComponentProps) {

  // Check if data is an array
  if (!Array.isArray(data)) {
    throw new Error("Data is not an array");
  }

  if (data.length > 0) {
    // Check if the first item in the array is an object
    if (typeof data[0] !== 'object') {
      console.error("First item in the data array is not an object:", data);
      throw new Error("First item in the data array is not an object");
    }

    // Check if the second item in the array is an object
    if (data.length > 1 && typeof data[1] !== 'object') {
      throw new Error("Second item in the data array is not an object");
    }

    // Check if the first and second items have the same keys
    if (data.length > 1) {
      const firstItemKeys = Object.keys(data[0]).sort();
      const secondItemKeys = Object.keys(data[1]).sort();

      if (JSON.stringify(firstItemKeys) !== JSON.stringify(secondItemKeys)) {
        throw new Error("First and second items in the data array do not have the same keys");
      }
    }
  }

  if (!columns || !Array.isArray(columns)) {
    console.error("Invalid type for columns:", columns);
    throw new Error(`Invalid type for columns. Expected array, received ${columns}`);
  }

  if (typeof defaultSortKey !== 'string') {
    throw new Error(`Invalid type for defaultSortKey. Expected string, received ${defaultSortKey}`);
  }

  if (typeof tableValue !== 'string') {
    throw new Error(`Invalid type for tableValue. Expected string, received ${tableValue}`);
  }

  if (typeof pkey !== 'string') {
    throw new Error(`Invalid type for pkey. Expected string, received ${pkey}`);
  }

  if (typeof pkey_url !== 'string') {
    throw new Error(`Invalid type for pkey_url. Expected string, received ${typeof pkey_url}`);
  }

  const { sortedItems, requestSort, sortConfig }: { sortedItems: any[], requestSort: Function, sortConfig: SortConfig } = useSortableData(data, defaultSortKey);

  return (
    <SortableTable
      sortedItems={sortedItems}
      requestSort={requestSort}
      sortConfig={sortConfig}
      columns={[...columns]}
      tableValue={tableValue}
      pkey={pkey}
      pkey_url={pkey_url}
      rowFormatters={rowFormatters}
    />
  );
}