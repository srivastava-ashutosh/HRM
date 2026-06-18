import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const ImportButton = ({ onImport, columns, label = 'Import' }) => {
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const fileRef = useRef();
  const toast = useToast();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return toast.warning('CSV must have at least a header row and one data row');
      const heads = parseLine(lines[0]);
      setHeaders(heads);
      const data = lines.slice(1, 6).map(l => parseLine(l));
      setPreview(data);
      const autoMap = {};
      heads.forEach(h => {
        const found = columns.find(c => c.key.toLowerCase() === h.toLowerCase().replace(/\s/g, ''));
        if (found) autoMap[h] = found.key;
      });
      setMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    if (!fileRef.current?.files[0]) return;
    const text = await fileRef.current.files[0].text();
    const lines = text.split('\n').filter(l => l.trim());
    const heads = parseLine(lines[0]);
    const rows = lines.slice(1).map(l => {
      const vals = parseLine(l);
      const row = {};
      heads.forEach((h, i) => {
        const key = mapping[h];
        if (key) row[key] = vals[i];
      });
      return row;
    }).filter(r => Object.keys(r).length > 0);
    try {
      const result = await onImport(rows);
      toast.success(`Imported ${result?.count || rows.length} records`);
      setShowModal(false);
      setPreview([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
  };

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => setShowModal(true)} title="Import CSV">
        <FiUpload /> {label}
      </button>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h3>Import from CSV</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <div className="modal-body">
              <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} style={{ marginBottom: 12 }} />
              {headers.length > 0 && (
                <>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>Column Mapping</h4>
                  {headers.map(h => (
                    <div key={h} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ width: 120, fontWeight: 600 }}>{h}</span>
                      <span>→</span>
                      <select value={mapping[h] || ''} onChange={e => setMapping({...mapping, [h]: e.target.value})} style={{ flex: 1 }}>
                        <option value="">— Skip —</option>
                        {columns.filter(c => c.key !== '_actions').map(c => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <h4 style={{ fontSize: 14, margin: '12px 0 8px' }}>Preview (first {preview.length} rows)</h4>
                  <div className="table-container" style={{ maxHeight: 200 }}>
                    <table>
                      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {preview.map((row, ri) => (
                          <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleImport} disabled={preview.length === 0}>Import</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportButton;
