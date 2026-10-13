'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, Headphones, ExternalLink, QrCode } from 'lucide-react';
import { BASE_URL } from '../services/api';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Main Footer Links & Information */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info & Vision */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <ShoppingBag size={20} />
              </div>
              <span>
                Affan<span style={{ color: 'var(--primary-light)' }}>Store</span>
              </span>
            </div>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              Marketplace online terpercaya untuk produk pilihan berkualitas tinggi. Nikmati belanja
              bebas cemas dengan jaminan produk 100% original, proteksi transaksi real-time, dan pengiriman kilat.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              <Headphones size={15} color="#3b82f6" />
              <span>Customer Care: <strong>Senin - Minggu (24 Jam)</strong></span>
            </div>
          </div>

          {/* Quick Commerce Nav */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#fff',
                marginBottom: '1.15rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Layanan Belanja
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Katalog Produk Terbaru
              </Link>
              <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Lacak Status Pesanan
              </Link>
              <Link href="/profile" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Pengaturan Akun Pembeli
              </Link>
              <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Dashboard Penjual &amp; Admin
              </Link>
            </div>
          </div>

          {/* Payment Badges & Security */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#fff',
                marginBottom: '1.15rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Metode Pembayaran
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.84rem',
                }}
              >
                <QrCode size={16} color="#3b82f6" />
                <span><strong>QRIS Instan:</strong> BCA, Mandiri, GoPay, OVO, Dana</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.84rem',
                }}
              >
                <Truck size={16} color="#10b981" />
                <span><strong>Cash On Delivery (COD):</strong> Bayar Tunai di Tempat</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                🔒 Terproteksi enkripsi SSL 256-Bit &amp; Verifikasi Pembayaran Otomatis
              </div>
            </div>
          </div>

          {/* Delivery & Customer Assurance */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#fff',
                marginBottom: '1.15rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Jaminan Pelanggan
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>100% Produk Original</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Jaminan keaslian barang atau uang kembali penuh.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Truck size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Bebas Biaya Pengiriman</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Klaim promo bebas ongkir ke seluruh pelosok Nusantara.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Discreet Dev Link */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>© {new Date().getFullYear()} AffanStore Official Marketplace. Hak Cipta Dilindungi.</div>

          {/* Discreet Developer / Swagger Link for inspection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span>Sistem Operasional Normal</span>
            </span>
            <a
              href={`${BASE_URL}/api`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--text-dim)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.76rem',
              }}
              title="Akses Dokumentasi API Backend"
            >
              <span>Swagger API</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
