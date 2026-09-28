import React from 'react';
import { Inbox, Loader2 } from 'lucide-react';

export function EmptyState({ title = 'No Data Found', message = 'There are no records to display.', actionBtn }) {
  return (
    <div className="glass-card flex flex-col items-center justify-between" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
        <Inbox size={36} color="var(--text-muted)" />
      </div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, marginBottom: actionBtn ? '1.5rem' : 0 }}>
        {message}
      </p>
      {actionBtn}
    </div>
  );
}

export function LoadingSpinner({ message = 'Loading details...' }) {
  return (
    <div className="flex flex-col items-center justify-between" style={{ padding: '3rem 1rem' }}>
      <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ marginTop: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
