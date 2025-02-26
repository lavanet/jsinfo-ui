"use client";

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Table, Tabs } from '@radix-ui/themes';
import { useJsinfobeFetch } from '@jsinfo/fetching/jsinfobe/hooks/useJsinfobeFetch';
import LoadingIndicator from '@jsinfo/components/modern/LoadingIndicator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@jsinfo/components/shadcn/ui2/Pagination";
import ModernTooltip from '@jsinfo/components/modern/ModernTooltip';

export interface DataKeySortableTableComponentProps {
  columns: Array<{
    key: string;
    name: string;
    tooltip?: string;
    altKey?: string;
    style?: React.CSSProperties;
  }>;
  defaultSortKey: string;
  tableAndTabName: string;
  pkey: string;
  pkeyUrl?: string;
  firstColumn: string;
  dataKey: string;
  className?: string;
  csvButton?: React.ReactNode;
  csvButtonMargin?: string;
  rowFormatters?: Record<string, (data: any) => React.ReactNode>;
  leftAlignNoWrap?: boolean;
}

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

export const DataKeySortableTableComponent: React.FC<DataKeySortableTableComponentProps> = ({
  columns,
  defaultSortKey,
  tableAndTabName,
  pkey,
  pkeyUrl,
  firstColumn,
  dataKey,
  className,
  csvButton,
  csvButtonMargin,
  rowFormatters,
  leftAlignNoWrap = false,
}) => {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(defaultSortKey.split('|')[0]);
  const [sortDirection, setSortDirection] = useState<'a' | 'd'>(
    defaultSortKey.includes('|desc') ? 'd' : 'a'
  );

  const { data, totalItems, isLoading, error } = usePaginatedData(
    dataKey,
    page,
    sortKey,
    sortDirection
  );

  // Process data for special sorting cases if needed
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Apply special sorting for certain columns with "-" and "0" values
    const specialSortColumns = ['rewardsULAVA', 'rewardsUSD']; // Add your columns that need special sorting

    if (specialSortColumns.includes(sortKey)) {
      return [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        // Handle special cases
        const aIsDash = aVal === "-";
        const bIsDash = bVal === "-";
        const aIsZero = aVal === "0" || aVal === 0;
        const bIsZero = bVal === "0" || bVal === 0;

        if ((aIsDash || aIsZero) && (bIsDash || bIsZero)) {
          if (aIsDash && bIsZero) return sortDirection === 'a' ? 1 : -1;
          if (aIsZero && bIsDash) return sortDirection === 'a' ? -1 : 1;
          return 0;
        }

        if (aIsDash || aIsZero) return 1; // Always put these at the end
        if (bIsDash || bIsZero) return -1;

        return 0; // Let server sorting handle the rest
      });
    }

    return data;
  }, [data, sortKey, sortDirection]);

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

  const cellStyle: React.CSSProperties = leftAlignNoWrap ? {
    whiteSpace: 'nowrap',
    textAlign: 'left' as const,
    verticalAlign: 'top'
  } : {};

  const headerCellStyle: React.CSSProperties = leftAlignNoWrap ? {
    whiteSpace: 'nowrap',
    textAlign: 'left' as const,
    verticalAlign: 'top'
  } : {};

  return (
    <div className={className} data-table-name={tableAndTabName}>
      {/* CSV Button positioned at the top right of the table */}
      {csvButton && (
        <div style={{
          position: 'absolute',
          top: '-30px',      // Move it above the table instead of at the top
          right: '0',        // Align with right edge
          zIndex: 10
        }}>
          {csvButton}
        </div>
      )}

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        )}
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          <Table.Root style={{
            tableLayout: 'fixed',
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <Table.Header>
              <Table.Row>
                {columns.map((column) => (
                  <Table.ColumnHeaderCell
                    key={column.key}
                    style={{
                      ...headerCellStyle,
                      ...(column.style || {}),
                      position: 'relative',
                      padding: '10px 12px 6px 6px',
                      minHeight: '36px',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      paddingRight: '20px',
                      width: '100%'
                    }}>
                      {column.tooltip ? (
                        <ModernTooltip title={column.tooltip}>
                          <span style={{ cursor: 'help', whiteSpace: 'nowrap' }}>
                            {column.name}
                          </span>
                        </ModernTooltip>
                      ) : (
                        <span style={{ whiteSpace: 'nowrap' }}>{column.name}</span>
                      )}

                      <div style={{
                        width: '20px',
                        height: '16px',
                        display: 'inline-block',
                        position: 'absolute',
                        right: '8px',
                        top: '47%',
                        transform: 'translateY(-50%)',
                        lineHeight: '1'
                      }}>
                        {sortKey === column.key && column.key !== "rank" && (
                          sortDirection === 'a' ? ' ↑' : ' ↓'
                        )}
                      </div>
                    </div>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {processedData.map((row, index) => (
                <Table.Row key={row[pkey] || index}>
                  {columns.map(column => (
                    <Table.Cell
                      key={column.key}
                      style={{
                        ...cellStyle,
                        ...(column.style || {}),
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'clip',
                        padding: '6px'
                      }}
                    >
                      {column.key === pkey && pkeyUrl ? (
                        <Link className='orangelinks' href={`/${pkeyUrl}/${row[pkey]}`}>
                          {row[pkey]}
                        </Link>
                      ) : rowFormatters?.[column.key] ? (
                        rowFormatters[column.key](row)
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
