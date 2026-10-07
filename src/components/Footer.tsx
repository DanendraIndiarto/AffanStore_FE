'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, ExternalLink, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(8, 12, 20, 0.95)',
        padding: '3rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <ShoppingBag size={18} />
              </div>
              <span>
                Affan<span style={{ color: 'var(--primary)' }}>Store</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Platform e-commerce modern dengan sinkronisasi checkout strict, atomic database
              transactions, serta integrasi NestJS + Prisma ORM + JWT Auth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>
              Navigasi Cepat
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Katalog Produk
              </Link>
              <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Riwayat Pesanan
              </Link>
              <Link href="/profile" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Profil Pengguna
              </Link>
              <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Dashboard Admin
              </Link>
            </div>
          </div>

          {/* Integration Specs */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>
              Spesifikasi Backend API
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a
                href="http://localhost:3000/api"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary)',
                  fontSize: '0.88rem',
                }}
              >
                <Code2 size={16} />
                <span>Swagger Documentation (Port 3000)</span>
                <ExternalLink size={13} />
              </a>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Base URL: <code>http://localhost:3000</code>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Metode Pembayaran: CASH (COD) & QRIS (NON_COD)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>© {new Date().getFullYear()} AffanStore. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Sistem Transaksi Terverifikasi & Atomic Restock</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
