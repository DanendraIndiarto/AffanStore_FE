'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const payload: { name?: string; email?: string; password?: string } = {
        name,
        email,
      };
      if (password.trim().length > 0) {
        if (password.length < 6) {
          showToast('Kata sandi baru minimal 6 karakter', 'warning');
          setSaving(false);
          return;
        }
        payload.password = password;
      }

      await userService.updateUser(user.id, payload);
      await refreshUser();
      showToast('Profil akun berhasil diperbarui!', 'success');
      setPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal memperbarui profil pengguna';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Profil Akun</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Informasi akun dan pengaturan autentikasi Anda
            </p>
          </div>

          <span
            className={`badge ${user.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-user'}`}
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
          >
            Hak Akses: {user.role}
          </span>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Pengguna</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Terdaftar</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
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
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ganti Kata Sandi (Opsional)</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div>
              ID Pengguna: <strong>#{user.id}</strong>
            </div>
            {user.createdAt && (
              <div>
                Terdaftar Sejak: <strong>{new Date(user.createdAt).toLocaleDateString('id-ID')}</strong>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Save size={18} />
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
