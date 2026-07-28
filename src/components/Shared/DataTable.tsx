import { useState, useMemo, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';

export type ColumnAlign = 'left' | 'center' | 'right';

export interface Column<T> {
  key: string;
  label: string;
  align?: ColumnAlign;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  width?: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string | number;
  sortable?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  filterKeys?: string[];
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T, index: number) => string;
  containerClassName?: string;
  headerClassName?: string;
  initialSort?: { key: string; direction: SortDirection };
}

type SortDirection = 'asc' | 'desc';

const alignClass: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  sortable = false,
  filterable = false,
  filterPlaceholder = 'Search...',
  filterKeys,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'No records found',
  emptyIcon,
  onRowClick,
  rowClassName,
  containerClassName = '',
  headerClassName = '',
  initialSort,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>(initialSort?.direction ?? 'asc');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const searchableKeys = useMemo(() => {
    if (filterKeys && filterKeys.length > 0) return filterKeys;
    return columns.map(c => c.key);
  }, [columns, filterKeys]);

  const filteredData = useMemo(() => {
    if (!filterable || !search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter(row =>
      searchableKeys.some(key => {
        const val = row[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, filterable, searchableKeys]);

  const sortedData = useMemo(() => {
    if (!sortable || !sortKey) return filteredData;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return filteredData;

    const accessor = col.sortAccessor || ((row: T) => row[sortKey]);
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredData, sortKey, sortDir, sortable, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = safeCurrentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, safeCurrentPage, pageSize]);

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      const col = columns.find(c => c.key === key);
      if (col?.sortable === false) return;

      if (sortKey === key) {
        setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortable, sortKey, columns]
  );

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(0);
  }, []);

  const alignPadding = 'px-6 py-4';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs flex flex-col ${containerClassName}`}
    >
      {(filterable || sortable) && (
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
          {filterable && (
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={filterPlaceholder}
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
            </div>
          )}
          {sortable && sortKey && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">
              Sorted by {columns.find(c => c.key === sortKey)?.label} ({sortDir})
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`bg-slate-50/50 dark:bg-slate-950/20 ${headerClassName}`}>
              {columns.map(col => {
                const isSortable = sortable && col.sortable !== false;
                const isActiveSort = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => isSortable && handleSort(col.key)}
                    className={`${alignPadding} text-[10px] font-black text-slate-400 uppercase tracking-widest ${alignClass[col.align || 'left']} ${col.headerClassName || col.className || ''} ${isSortable ? 'cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors' : ''}`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <span className={`inline-flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}>
                      {col.label}
                      {isSortable && (
                        isActiveSort ? (
                          sortDir === 'asc'
                            ? <ChevronUp size={12} className="text-indigo-500" />
                            : <ChevronDown size={12} className="text-indigo-500" />
                        ) : (
                          <ChevronsUpDown size={12} className="text-slate-300 dark:text-slate-600" />
                        )
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    {emptyIcon || <Inbox size={32} className="text-slate-300 dark:text-slate-700" />}
                    <p className="text-xs uppercase font-bold tracking-widest">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = safeCurrentPage * pageSize + index;
                const key = rowKey ? rowKey(row, globalIndex) : globalIndex;
                const extraClass = rowClassName ? rowClassName(row, globalIndex) : '';
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${extraClass}`}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`${alignPadding} ${alignClass[col.align || 'left']} ${col.className || ''}`}
                      >
                        {col.render ? col.render(row, globalIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && sortedData.length > pageSize && (
        <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {safeCurrentPage * pageSize + 1}–{Math.min((safeCurrentPage + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={safeCurrentPage === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tabular-nums">
              {safeCurrentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safeCurrentPage >= totalPages - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
