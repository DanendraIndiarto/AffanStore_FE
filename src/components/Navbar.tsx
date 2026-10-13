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
  Truck,
  Sparkles,
  Zap,
  HelpCircle,
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
    <>
      {/* Top Marketplace Announcement Bar */}
      <div className="top-ticker">
        <div className="top-ticker-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            >
              PROMO
            </span>
            <span style={{ fontSize: '0.78rem' }}>
              Flash Sale Diskon s/d 40% &amp; Bebas Ongkir se-Indonesia! Bayar mudah via QRIS &amp; COD.
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
            }}
            className="top-ticker-links"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={13} color="#10b981" />
              <span>Garansi Tiba Tepat Waktu</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} color="#3b82f6" />
              <span>100% Produk Terverifikasi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="navbar-wrap">
        <div className="container">
          <div className="navbar">
            {/* Brand Logo */}
            <Link href="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
              <div className="brand-icon">
                <ShoppingBag size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Affan</span>
                  <span style={{ color: 'var(--primary-light)' }}>Store</span>
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontWeight: 700,
                  }}
                >
                  Official Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="nav-links">
              <Link
                href="/"
                className={`nav-link ${pathname === '/' ? 'active' : ''}`}
              >
                <span>Katalog Produk</span>
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
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Desktop User Account Actions */}
            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    href="/profile"
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span
                      className={`badge ${user.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-user'}`}
                      style={{ fontSize: '0.64rem', padding: '0.12rem 0.45rem' }}
                    >
                      {user.role}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    title="Keluar Akun"
                    style={{ color: 'var(--danger)', padding: '0.5rem' }}
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

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-secondary btn-sm nav-mobile-toggle"
                style={{ display: 'inline-flex', padding: '8px' }}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Dropdown */}
          {mobileMenuOpen && (
            <div
              style={{
                padding: '1.25rem 0 1.5rem',
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
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
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
    </>
  );
}
