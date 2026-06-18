import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PaginationBar = ({ page, limit = 10, totalPages, total, onPageChange, onLimitChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-bar">
      <span className="pagination-info">{total} records</span>
      <div className="pagination-controls">
        <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <FiChevronLeft />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span> : (
            <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          )
        )}
        <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <FiChevronRight />
        </button>
      </div>
      <div className="pagination-limit">
        <select value={limit} onChange={e => { if (onLimitChange) onLimitChange(parseInt(e.target.value)); }}>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>
    </div>
  );
};

export default PaginationBar;
