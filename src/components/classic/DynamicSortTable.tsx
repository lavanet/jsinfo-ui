"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Table, Tabs } from '@radix-ui/themes';
import { Column, RowFormatters } from '@jsinfo/lib/types';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import LoadingIndicator from '../modern/LoadingIndicator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@jsinfo/components/shadcn/ui2/Pagination";
import type { CSSProperties } from 'react';
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';

type DataKeySortableTableComponentProps = {
  columns: Column[];
  dataKey: string;
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string | null;
  rowFormatters?: RowFormatters;
  tableDescription?: React.ReactNode;
  firstColumn?: string;
  csvButton?: React.ReactNode;
  csvButtonMargin?: string;
};

function usePaginatedData(dataKey: string, page: number, sortKey: string, sortDirection: 'a' | 'd') {
  const { data: countData } = useJsinfobeFetch<{ itemCount: number }>(
    `item-count/${dataKey}`
  );

  const { data, error, isLoading } = useJsinfobeFetch<{ data: any[] }>(
    `${dataKey}?pagination=${sortKey},${sortDirection},${page},20`
  );

  const isEmptyResponse = data?.data &&
    data.data.length === 1 &&
    data.data[0] &&
    (Object.values(data.data[0]).every(value => value === "") ||
      (data.data[0].date === "" && data.data[0].spec === "" && data.data[0].error === ""));

  return {
    data: isEmptyResponse ? [] : (data?.data || []),
    totalItems: countData?.itemCount || 0,
    isLoading,
    error
  };
}

export const DataKeySortableTableComponent: React.FC<DataKeySortableTableComponentProps> = (props) => {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(props.defaultSortKey.split('|')[0]);
  const [sortDirection, setSortDirection] = useState<'a' | 'd'>(
    props.defaultSortKey.includes('|desc') ? 'd' : 'a'
  );

  const { data, totalItems, isLoading, error } = usePaginatedData(
    props.dataKey,
    page,
    sortKey,
    sortDirection
  );

  const totalPages = Math.ceil(totalItems / 20);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection(current => current === 'a' ? 'd' : 'a');
    } else {
      setSortKey(key);
      setSortDirection('a');
    }
    setPage(1);
  };

  const renderPaginationItems = () => {
    const ellipsisThreshold = 2;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return pageNumbers.map((number) => {
      if (
        number === 1 ||
        number === totalPages ||
        (number >= page - ellipsisThreshold && number <= page + ellipsisThreshold)
      ) {
        return (
          <PaginationItem key={number}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(number);
              }}
              isActive={number === page}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (number === page - ellipsisThreshold - 1 && number > 1) ||
        (number === page + ellipsisThreshold + 1 && number < totalPages)
      ) {
        return (
          <PaginationItem key={number}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return null;
    });
  };

  if (error) {
    console.error('Failed to fetch data:', error);
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <p>Failed to load data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        )}
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          {props.tableDescription && (
            <div style={{
              color: 'var(--gray-11)',
              margin: '16px 0 16px 16px',
              fontSize: '15px',
              lineHeight: '1.6',
              fontWeight: 500,
              paddingTop: '8px'
            } as CSSProperties}>
              {props.tableDescription}
            </div>
          )}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {props.columns.map((column, index) => (
                  <Table.ColumnHeaderCell
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    style={{
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '16px 16px 20px',
                      height: '56px',
                      verticalAlign: 'top'
                    } as CSSProperties}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      height: '100%',
                      paddingTop: '4px'
                    }}>
                      {column.tooltip ? (
                        <ModernTooltip title={column.tooltip}>
                          <span style={{ cursor: 'help' }}>
                            {column.name}
                          </span>
                        </ModernTooltip>
                      ) : (
                        column.name
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        {sortKey === column.key && (
                          <span>{sortDirection === 'a' ? ' ↑' : ' ↓'}</span>
                        )}
                        {props.csvButton && index === props.columns.length - 1 && (
                          <span style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: props.csvButtonMargin || '0px'
                          } as CSSProperties}>
                            {props.csvButton}
                          </span>
                        )}
                      </div>
                    </div>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((row, index) => (
                <Table.Row key={row[props.pkey] || index}>
                  {props.columns.map(column => (
                    <Table.Cell key={column.key} style={{ textAlign: 'left' }}>
                      {column.key === props.pkey && props.pkeyUrl ? (
                        <Link className='orangelinks' href={`/${props.pkeyUrl}/${row[props.pkey]}`}>
                          {row[props.pkey]}
                        </Link>
                      ) : props.rowFormatters?.[column.key] ? (
                        props.rowFormatters[column.key](row)
                      ) : (
                        row[column.key]
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.max(1, page - 1));
                    }}
                  />
                </PaginationItem>
              )}
              {renderPaginationItems()}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.min(totalPages, page + 1));
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export const DataKeySortableTableInATabComponent: React.FC<DataKeySortableTableComponentProps> = (props) => (
  <Tabs.Content value={props.tableAndTabName}>
    <DataKeySortableTableComponent {...props} />
  </Tabs.Content>
);
