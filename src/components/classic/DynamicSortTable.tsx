// src/components/SortTable.tsx
"use client";

import Link from 'next/link'
import { useState, useEffect, useRef, ReactNode } from 'react';
import { Table, Tabs } from '@radix-ui/themes';
import React from 'react';
import { PaginationState, useApiPaginationFetch } from '@jsinfo/hooks/useApiPaginationFetch';
import LoadingIndicator from '../modern/LoadingIndicator';
import { Column, RowFormatters, SortAndPaginationConfig } from '@jsinfo/lib/types';
import { GetNestedProperty } from '@jsinfo/lib/utils';
import { AddSpacesBeforeCapsAndCapitalize } from '@jsinfo/lib/formatting';
import { ErrorBoundary } from '@jsinfo/components/modern/ErrorBoundary';
import PaginationControl from './PaginationControl';
import { ErrorDisplay } from '../modern/ErrorDisplay';

const JSINFO_QUERY_DEFAULT_ITEMS_PER_PAGE = 20

interface SortableTableHeaderWithPaginationSateProps {
  tableAndTabName: string;
  columns: Column[];
  requestSort: (key: string) => void;
  paginationState: PaginationState;
  columnLengthPercentages: { [key: string]: number } | null;
  csvButton?: ReactNode | null;
}

const SortableTableHeaderWithPaginationSate: React.FC<SortableTableHeaderWithPaginationSateProps> = (props: SortableTableHeaderWithPaginationSateProps) => {
  if (typeof props.tableAndTabName !== 'string') {
    throw new Error(`Invalid prop: tableAndTabName should be a string, but received type ${typeof props.tableAndTabName} with value ${props.tableAndTabName}`);
  }
  if (!Array.isArray(props.columns)) {
    throw new Error('Invalid prop: columns should be an array');
  }

  if (typeof props.requestSort !== 'function') {
    throw new Error(`Invalid prop: requestSort should be a function, but got type ${typeof props.requestSort} with value ${(props.requestSort + "").substring(0, 1000)}`);
  }

  if (props.columnLengthPercentages !== null && typeof props.columnLengthPercentages !== 'object') {
    throw new Error('Invalid prop: columnLengthPercentages should be an object or null');
  }

  const [sortAndPaginationConfig, setSortAndPaginationConfig] = useState<SortAndPaginationConfig>(props.paginationState.GetSortAndPaginationConfig());
  props.paginationState.RegisterUpdateCallback(setSortAndPaginationConfig);

  return (
    <Table.Header key={`SortableHeader_${props.tableAndTabName}`}>
      <Table.Row key={`SortableHeaderColRow_${props.tableAndTabName}`}>
        {props.columns.map((column: Column, index: number) => {
          const hasSortIndicator = sortAndPaginationConfig && sortAndPaginationConfig.sortKey && sortAndPaginationConfig.sortKey === column.key;
          return (
            <Table.ColumnHeaderCell
              key={`SortableHeaderCol_${props.tableAndTabName}_${column.key}`}
              onClick={() => props.requestSort(column.key)}
              style={{
                width: "auto"
              }}
            >
              <div
                style={{
                  display: 'block',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  width: 'auto'
                }}
              >
                {column.name}
                {hasSortIndicator ? (sortAndPaginationConfig.direction === 'ascending' ? '↑' : '↓') : <span style={{ color: 'transparent' }}>↓</span>}
                {props.csvButton && index === props.columns.length - 1 && props.csvButton}
              </div>
            </Table.ColumnHeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
};

interface SortableTableRowCellProps {
  columnName: string;
  rowData: Record<any, any>;
  rowFormatters: RowFormatters | null;
  tableRowKey: string;
  pkey: string;
  pkeyUrl: string | null;
}

const SortableTableRowCell: React.FC<SortableTableRowCellProps> = (props: SortableTableRowCellProps) => {

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
    cellContent = <Link className='orangelinks' href={`/${props.pkeyUrl}/${GetNestedProperty(props.rowData, props.pkey)}`}>{GetNestedProperty(props.rowData, props.pkey)}</Link>;
  } else {
    cellContent = GetNestedProperty(props.rowData, props.columnName);
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

const SortableTableRow: React.FC<SortableTableRowProps> = (props: SortableTableRowProps) => {
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

  let key = GetNestedProperty(props.rowData, props.pkey);

  const tableRowKey = `SorttableRow_${props.tableAndTabName}_${props.tableAndTabName}_${props.index}_${key}`;

  // dont show rows that have an empty pkey
  if (!key) return null;

  return (
    <Table.Row key={`${tableRowKey}_row`} className='transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
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

const SortableTableBody: React.FC<SortableTableBodyProps> = (props: SortableTableBodyProps) => {

  if (!Array.isArray(props.tableData)) {
    console.error('Invalid prop: tableData should be an array', props);
    throw new Error('Invalid prop: tableData should be an array');
  }
  if (!Array.isArray(props.columns)) {
    console.error('Invalid prop: columns should be an array', props);
    throw new Error('Invalid prop: columns should be an array');
  }
  if (typeof props.tableAndTabName !== 'string') {
    console.error('Invalid prop: tableAndTabName should be a string', props);
    throw new Error('Invalid prop: tableAndTabName should be a string');
  }
  if (typeof props.pkey !== 'string') {
    console.error('Invalid prop: pkey should be a string', props);
    throw new Error('Invalid prop: pkey should be a string');
  }
  if (props.pkeyUrl && typeof props.pkeyUrl !== 'string') {
    console.error('Invalid prop: pkeyUrl should be a string or null', props);
    throw new Error('Invalid prop: pkeyUrl should be a string or null');
  }
  if (props.rowFormatters && typeof props.rowFormatters !== 'object') {
    console.error('Invalid prop: rowFormatters should be an object or null', props);
    throw new Error('Invalid prop: rowFormatters should be an object or null');
  }
  if (props.firstColumn && typeof props.firstColumn !== 'string') {
    console.error('Invalid prop: firstColumn should be a string or null', props);
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
  requestSort: (key: string) => void;
  paginationState: PaginationState;
  columns: Column[],
  tableAndTabName: string,
  pkey: string,
  pkeyUrl?: string | null,
  rowFormatters?: RowFormatters;
  firstColumn?: string;
  csvButton?: ReactNode | null;
};

const SortableTableContent: React.FC<SortableTableProps> = (props: SortableTableProps) => {

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

  const columnLengthPercentagesRef = useRef<{ [key: string]: number } | null>(null);

  useEffect(() => {
    if (props.tableData.length > 3 && columnLengthPercentagesRef.current === null) {
      let maxColumnLengths: { [key: string]: number } = {};

      // TODO: better logic for this
      for (const row of props.tableData) {
        for (let columnIndex = 0; columnIndex < props.columns.length; columnIndex++) {
          const column = props.columns[columnIndex];
          let columnValue = row[column.key] + "";
          const lowerCaseKey = column.key.toLowerCase();
          if (!columnValue) continue;

          if (lowerCaseKey.includes("date") || lowerCaseKey.includes("time")) {
            columnValue = "abcdefghij";
          } else if (lowerCaseKey.includes("spec") || lowerCaseKey.includes("chain")) {
            columnValue = "abcdefghij";
          } else if (lowerCaseKey.includes("message")) {
            columnValue = "abcdefghijklmnopqrstuvwxyz1234567890abcdefghij"; // 50 chars
          } else {
            columnValue = columnValue.toString().replace(/\<.*?\>/g, '');

            const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
            if (iso8601Pattern.test(columnValue)) {
              columnValue = "abcdefghij";
            }
          }

          // last column has the csv button
          if (columnIndex === props.columns.length - 1) {
            columnValue += "abcdefghijabcdefghijabcdefghij"; // Append 30 characters
          }

          if (columnValue.length <= 10) columnValue = "abcdefghij"

          if (columnValue.length > (maxColumnLengths[column.key] || 0)) {
            maxColumnLengths[column.key] = columnValue.length;
          }
        }
      }

      const totalLength = Object.values(maxColumnLengths).reduce((a, b) => a + b, 0);
      const columnLengthPercentages: { [key: string]: number } = {};
      let remainingPercentage = 100;
      const minPercentage = 5;

      for (const column in maxColumnLengths) {
        const calculatedPercentage = (maxColumnLengths[column] / totalLength) * 100;
        const finalPercentage = Math.max(calculatedPercentage, minPercentage);
        columnLengthPercentages[column] = finalPercentage;
        remainingPercentage -= finalPercentage;
      }

      // Distribute remaining percentage equally among all columns
      const remainingPercentagePerColumn = remainingPercentage / props.columns.length;
      for (const column in columnLengthPercentages) {
        columnLengthPercentages[column] += remainingPercentagePerColumn;
      }

      columnLengthPercentagesRef.current = columnLengthPercentages;
    }
  }, [props.tableData, props.columns]);

  return (
    <Table.Root>
      dasd
      <SortableTableHeaderWithPaginationSate
        tableAndTabName={props.tableAndTabName} columns={props.columns}
        requestSort={props.requestSort}
        paginationState={props.paginationState}
        columnLengthPercentages={columnLengthPercentagesRef.current}
        csvButton={props.csvButton} />
      <SortableTableBody {...props} />
    </Table.Root>
  );

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
  csvButton?: ReactNode | null;
  tableDescription?: string | null | ReactNode;
};

export const DataKeySortableTableComponent: React.FC<DataKeySortableTableComponentProps> = (props: DataKeySortableTableComponentProps) => {

  if (!props.columns || !Array.isArray(props.columns)) {
    console.error("Invalid type for columns:", props.columns);
    throw new Error(`Invalid type for columns. Expected array, received ${props.columns}`);
  }

  if (typeof props.dataKey !== 'string') {
    throw new Error(`Invalid type for dataKey. Expected string, received ${props.dataKey}`);
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

  const { data, loading, error, requestSort, setPage, paginationState } = useApiPaginationFetch({
    dataKey: props.dataKey,
    paginationString: props.defaultSortKey + ",1," + JSINFO_QUERY_DEFAULT_ITEMS_PER_PAGE,
  });

  const [sortAndPaginationConfig, setSortAndPaginationConfig] = useState<SortAndPaginationConfig>(paginationState.GetSortAndPaginationConfig());
  paginationState.RegisterUpdateCallback(setSortAndPaginationConfig)

  const [componentData, setComponentData] = useState(<div></div>);
  const [loadingTimeout, setLoadingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadingRef = useRef(loading);

  loadingRef.current = loading;

  useEffect(() => {
    if (error) {
      setComponentData(
        <div style={{ margin: '5px' }}>
          <ErrorDisplay message={error} />
        </div>
      );
      return
    }

    if (loading) {
      if (!loadingTimeout) {
        setLoadingTimeout(setTimeout(() => {
          if (loadingRef.current) {
            setComponentData(<LoadingIndicator loadingText={`Loading ${AddSpacesBeforeCapsAndCapitalize(props.tableAndTabName)} data`} greyText={`${AddSpacesBeforeCapsAndCapitalize(props.tableAndTabName)}`} />);
          }
        }, 200));
      }
      return
    }

    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    if (!data || !sortAndPaginationConfig) {
      setComponentData(<div></div>)
      return
    }

    let dataObject = data;
    if (typeof data === 'object' && Object.keys(data).length === 1 && 'data' in data) {
      dataObject = data.data;
    }

    if (dataObject.length === 0) {
      if (dataObject.length === 0) {
        setComponentData(
          <div style={{ padding: '1em', textAlign: 'center' }}>
            <h2>No <span style={{ fontWeight: 'bold', color: 'grey' }}>{AddSpacesBeforeCapsAndCapitalize(props.tableAndTabName)}</span> data available</h2>
          </div>
        );
        return;
      }
    }

    setComponentData(
      <ErrorBoundary>
        {props.tableDescription && <div style={{ color: 'grey', margin: '5px', marginLeft: '13px' }}>{props.tableDescription}</div>}
        <SortableTableContent
          tableData={dataObject}
          requestSort={requestSort}
          paginationState={paginationState}
          columns={[...props.columns]}
          tableAndTabName={props.tableAndTabName}
          pkey={props.pkey}
          pkeyUrl={props.pkeyUrl}
          rowFormatters={props.rowFormatters}
          firstColumn={props.firstColumn}
          csvButton={props.csvButton}
        />
        <PaginationControl
          paginationState={paginationState}
          setPage={setPage}
        />
      </ErrorBoundary>
    );
  }, [loading, error, data, sortAndPaginationConfig]);

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
  csvButton?: ReactNode | null;
  tableDescription?: string | null | ReactNode;
};

export const DataKeySortableTableInATabComponent: React.FC<DataKeySortableTableInATabComponentProps> = (props: DataKeySortableTableInATabComponentProps) => {
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
        csvButton={props.csvButton}
        tableDescription={props.tableDescription}
      />
    </Tabs.Content>
  );
}