'use client';

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';

export default function BackendStatusBanner() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkBackend = async () => {
    setChecking(true);
    try {
      await api.get('/products', { timeout: 3000 });
      setIsBackendOnline(true);
    } catch (err: unknown) {
      const error = err as { code?: string; response?: unknown };
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
        setIsBackendOnline(false);
      } else {
        // If there's an HTTP response (even 401 or 404), backend is alive
        setIsBackendOnline(true);
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  if (isBackendOnline === null || isBackendOnline === true) {
    return null; // Silent when backend is running smoothly
  }

  return (
    <div
      style={{
        background: 'rgba(239, 68, 68, 0.12)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '0.65rem 1rem',
        fontSize: '0.85rem',
        color: '#fca5a5',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} color="#ef4444" />
          <span>
            <strong>Koneksi API:</strong> Backend NestJS di{' '}
            <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</code> belum
            terdeteksi aktif. Pastikan server backend Anda sudah berjalan.
          </span>
        </div>
        <button
          onClick={checkBackend}
          disabled={checking}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
        >
          <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
          <span>{checking ? 'Memeriksa...' : 'Cek Ulang'}</span>
        </button>
      </div>
    </div>
  );
}
