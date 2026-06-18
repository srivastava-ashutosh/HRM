import React, { useState, useRef, useEffect } from 'react';
import { FiSettings } from 'react-icons/fi';

const ColumnSettings = ({ columns, visibleColumns, onChange, storageKey }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key) => {
    const next = visibleColumns.includes(key)
      ? visibleColumns.filter(k => k !== key)
      : [...visibleColumns, key];
    onChange(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div className="column-settings" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(!open)} title="Column Settings">
        <FiSettings /> Columns
      </button>
      {open && (
        <div className="column-settings-dropdown">
          {columns.map(col => (
            col.key !== '_actions' && (
              <label key={col.key} className="column-settings-item">
                <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={() => toggle(col.key)} />
                <span>{col.label}</span>
              </label>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnSettings;
