import React from 'react';

export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}><div className="skeleton skeleton-cell" /></td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <table>
    <thead>
      <tr>
        {Array.from({ length: cols }).map((_, i) => (
          <th key={i}><div className="skeleton skeleton-cell" style={{ height: 12 }} /></th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  </table>
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-avatar" />
    <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto' }} />
    <div className="skeleton skeleton-text" style={{ width: '40%', margin: '4px auto' }} />
    <div className="skeleton skeleton-text" style={{ width: '30%', margin: '0 auto' }} />
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="employee-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-icon" />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: 24 }} />
      <div className="skeleton skeleton-text" style={{ width: '60%', height: 12, marginTop: 6 }} />
    </div>
  </div>
);

export const SkeletonStatsRow = ({ count = 4 }) => (
  <div className="stats-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonStat key={i} />)}
  </div>
);

export default SkeletonTable;
