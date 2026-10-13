'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, LogIn, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Harap isi email dan kata sandi', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      showToast('Berhasil masuk! Selamat berbelanja di AffanStore.', 'success');
      router.push(redirect);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg =
        error.response?.data?.message ||
        'Gagal masuk. Periksa email/password atau pastikan backend NestJS aktif.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem 5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 1.15rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Masuk Akun</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Akses katalog belanja, promo eksklusif, dan pesanan Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="form-control"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}</span>
          </button>
        </form>

        {/* Demo Fast Fill Card */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-light)',
            fontSize: '0.82rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginBottom: '0.65rem',
            }}
          >
            <Sparkles size={14} color="#f97316" />
            <span>Akun Percobaan Cepat (Klik untuk Isi):</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              onClick={() => handleUseDemo('tester@example.com', 'password123')}
              style={{
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition)',
              }}
            >
              <div>
                <strong style={{ color: '#fff' }}>Pembeli (USER):</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>tester@example.com</span>
              </div>
              <span style={{ color: 'var(--primary-light)', fontSize: '0.76rem', fontWeight: 700 }}>
                Pilih
              </span>
            </div>

            <div
              onClick={() => handleUseDemo('admin@affanstore.com', 'adminpassword123')}
              style={{
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition)',
              }}
            >
              <div>
                <strong style={{ color: '#fff' }}>Pengelola (ADMIN):</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>admin@affanstore.com</span>
              </div>
              <span style={{ color: 'var(--primary-light)', fontSize: '0.76rem', fontWeight: 700 }}>
                Pilih
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
          }}
        >
          Belum memiliki akun?{' '}
          <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat form masuk akun...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
