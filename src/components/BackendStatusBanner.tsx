'use client';

import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../services/api';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

export default function BackendStatusBanner() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCheckBackend = async () => {
    setChecking(true);
    setErrorMessage('');
    try {
      await api.get('/', { timeout: 6000 });
      setIsBackendOnline(true);
    } catch (err: unknown) {
      const error = err as { code?: string; response?: { status?: number; data?: unknown } };
      const status = error.response?.status;

      if (status === 502 || status === 503 || status === 504) {
        setIsBackendOnline(false);
        setErrorMessage(`Server Railway mengembalikan HTTP ${status} (Application failed to respond).`);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
        setIsBackendOnline(false);
        setErrorMessage('Tidak dapat terhubung ke server (Network Error / Connection Timeout).');
      } else {
        setIsBackendOnline(true);
      }
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get('/', { timeout: 6000 })
      .then(() => {
        if (isMounted) {
          setIsBackendOnline(true);
          setChecking(false);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const error = err as { code?: string; response?: { status?: number; data?: unknown } };
        const status = error.response?.status;

        if (status === 502 || status === 503 || status === 504) {
          setIsBackendOnline(false);
          setErrorMessage(`Server Railway mengembalikan HTTP ${status} (Application failed to respond).`);
        } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
          setIsBackendOnline(false);
          setErrorMessage('Tidak dapat terhubung ke server (Network Error / Connection Timeout).');
        } else {
          setIsBackendOnline(true);
        }
        setChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isBackendOnline === null || isBackendOnline === true) {
    return null; // Sembunyikan banner jika backend aktif dan normal
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
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '280px' }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <span>
              <strong>Koneksi Backend API Terputus:</strong> Backend di{' '}
              <a
                href={BASE_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#fff',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {BASE_URL}
              </a>{' '}
              belum terdeteksi aktif.
            </span>
            {errorMessage && (
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#f87171', marginTop: '0.15rem' }}>
                Detail: {errorMessage}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href={`${BASE_URL}/api`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', textDecoration: 'none' }}
          >
            <ExternalLink size={12} />
            <span>Swagger API</span>
          </a>
          <button
            onClick={handleCheckBackend}
            disabled={checking}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Memeriksa...' : 'Cek Ulang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
