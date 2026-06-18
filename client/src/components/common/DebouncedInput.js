import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { FiSearch, FiX } from 'react-icons/fi';

const DebouncedInput = ({ value: externalValue, onChange, placeholder = 'Search...', delay = 400, ...props }) => {
  const [localValue, setLocalValue] = useState(externalValue || '');
  const debouncedValue = useDebounce(localValue, delay);

  useEffect(() => {
    setLocalValue(externalValue || '');
  }, [externalValue]);

  useEffect(() => {
    if (debouncedValue !== externalValue) {
      onChange?.(debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <div className="search-box" style={{ maxWidth: props.style?.maxWidth || 320 }}>
      <FiSearch size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {localValue && (
        <button
          className="search-clear"
          onClick={() => { setLocalValue(''); onChange?.(''); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
};

export default DebouncedInput;
