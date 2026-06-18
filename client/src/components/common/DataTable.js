import React, { useState, useMemo } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronsUp, FiPlus } from 'react-icons/fi';
import { SkeletonTable } from './Skeleton';
import PaginationBar from './PaginationBar';
import ColumnSettings from './ColumnSettings';
import ExportButton from './ExportButton';
import DebouncedInput from './DebouncedInput';

const SortIcon = ({ active, direction }) => {
  if (!active) return <FiChevronsUp size={12} style={{ opacity: 0.25, marginLeft: 4 }} />;
  return direction === 'asc'
    ? <FiChevronUp size={12} style={{ marginLeft: 4 }} />
    : <FiChevronDown size={12} style={{ marginLeft: 4 }} />;
};

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  total,
  page,
  totalPages,
  onPageChange,
  limit = 10,
  onLimitChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  storageKey,
  emptyMessage = 'No records found',
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  onSort,
  toolbar,
  toolbarRight,
  addLabel,
  onAdd,
  keyExtractor = (row) => row._id,
}) => {
  const saved = useMemo(() => {
    if (!storageKey) return null;
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
  }, [storageKey]);

  const [localVisible, setLocalVisible] = useState(
    saved || columns.map(c => c.key)
  );

  const visibleColumns = externalSortBy !== undefined
    ? columns
    : columns;

  const visibleKeys = storageKey
    ? localVisible
    : columns.map(c => c.key);

  const handleColumnChange = (keys) => {
    setLocalVisible(keys);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(keys));
  };

  const displayColumns = columns.filter(c => visibleKeys.includes(c.key));

  const handleSort = (key) => {
    if (!onSort) return;
    if (externalSortBy === key) {
      onSort(key, externalSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const hasActions = actions && actions.length > 0;

  if (loading) {
    return <SkeletonTable rows={8} cols={displayColumns.length + (hasActions ? 1 : 0)} />;
  }

  return (
    <div className="data-table-wrapper">
      <div className="toolbar">
        <div className="toolbar-left">
          {onSearchChange && (
            <DebouncedInput
              value={search || ''}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          )}
          {toolbar}
        </div>
        <div className="toolbar-right">
          {toolbarRight}
          {storageKey && (
            <ColumnSettings
              columns={columns}
              visibleColumns={visibleKeys}
              onChange={handleColumnChange}
            />
          )}
          {data.length > 0 && (
            <ExportButton
              data={data}
              columns={columns}
              filename={storageKey || 'export'}
              visibleColumns={visibleKeys}
            />
          )}
          {onAdd && (
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              <FiPlus /> {addLabel || 'Add'}
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {displayColumns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable-header' : ''}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      active={externalSortBy === col.key}
                      direction={externalSortOrder}
                    />
                  )}
                </th>
              ))}
              {hasActions && <th style={{ width: 1 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length + (hasActions ? 1 : 0)} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={keyExtractor(row)}>
                  {displayColumns.map(col => (
                    <td key={col.key} style={col.width ? { width: col.width } : undefined}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td>
                      <div className="action-buttons">
                        {actions.map((action, i) => {
                          if (action.hide?.(row)) return null;
                          const Icon = action.icon;
                          return (
                            <button
                              key={i}
                              className={`action-btn ${action.className || ''}`}
                              title={action.label}
                              onClick={() => action.onClick(row)}
                            >
                              {Icon && <Icon size={15} />}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <PaginationBar
          page={page}
          limit={limit}
          totalPages={totalPages}
          total={total}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};

export default DataTable;
