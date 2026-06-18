import React, { createContext, useState, useContext, useCallback } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null });

  const confirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ open: false, title: '', message: '', resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ open: false, title: '', message: '', resolve: null });
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div className="modal-backdrop" onClick={handleCancel}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3><FiAlertTriangle style={{ color: '#f39c12', marginRight: 8 }} />{state.title}</h3>
              <button className="close-btn" onClick={handleCancel}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6 }}>{state.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
