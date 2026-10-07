'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Berhasil keluar dari akun', 'info');
    router.push('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrap">
      <div className="container">
        <div className="navbar">
          {/* Brand Logo */}
          <Link href="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-icon">
              <ShoppingBag size={20} />
            </div>
            <span>
              Affan<span style={{ color: 'var(--primary)' }}>Store</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <Link
              href="/"
              className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            >
              Katalog
            </Link>

            {user && (
              <Link
                href="/orders"
                className={`nav-link ${pathname.startsWith('/orders') ? 'active' : ''}`}
              >
                <PackageCheck size={16} />
                <span>Pesanan Saya</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                style={{
                  background: '#171d2b',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                }}
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  href="/profile"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <UserIcon size={15} />
                  <span>{user.name.split(' ')[0]}</span>
                  <span
                    className={`badge ${user.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-user'}`}
                    style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                  >
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link href="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={15} />
                  <span>Masuk</span>
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={15} />
                  <span>Daftar</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm nav-mobile-toggle"
              style={{ display: 'inline-flex', padding: '8px' }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '1rem 0 1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              href="/"
              className={`nav-link ${pathname === '/' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Katalog Produk
            </Link>

            {user && (
              <Link
                href="/orders"
                className={`nav-link ${pathname.startsWith('/orders') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <PackageCheck size={16} />
                <span>Pesanan Saya</span>
              </Link>
            )}

            {user && (
              <Link
                href="/profile"
                className={`nav-link ${pathname.startsWith('/profile') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon size={16} />
                <span>Profil Akun ({user.name})</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: '#171d2b',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                }}
              >
                <ShieldCheck size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}
              >
                <LogOut size={16} />
                <span>Keluar Akun ({user.email})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
