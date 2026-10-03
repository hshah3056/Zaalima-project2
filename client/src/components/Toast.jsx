import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0.75rem 1.1rem',
      borderRadius: '10px',
      background: isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : '#EEF2FF',
      border: `1px solid ${isError ? '#FCA5A5' : isSuccess ? '#6EE7B7' : '#C7D2FE'}`,
      color: isError ? '#991B1B' : isSuccess ? '#065F46' : '#3730A3',
      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
      fontSize: '0.82rem',
      fontWeight: 600,
      maxWidth: '380px',
      animation: 'slideUp 0.25s ease-out'
    }}>
      {isError ? (
        <AlertCircle size={18} color="#DC2626" />
      ) : isSuccess ? (
        <CheckCircle2 size={18} color="#059669" />
      ) : (
        <Info size={18} color="#4F46E5" />
      )}
      
      <span style={{ flex: 1 }}>{toast.message}</span>
      
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: isError ? '#991B1B' : isSuccess ? '#065F46' : '#3730A3',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
