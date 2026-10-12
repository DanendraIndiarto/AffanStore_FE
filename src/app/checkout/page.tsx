'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { formatRupiah, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  QrCode,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Package,
} from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('QRIS');
  const [shippingType, setShippingType] = useState<'COD' | 'NON_COD'>('NON_COD');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load checkout product', err);
        showToast('Gagal memuat produk checkout', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, showToast]);

  const handlePaymentMethodChange = (method: 'CASH' | 'QRIS') => {
    setPaymentMethod(method);
    if (method === 'CASH') {
      setShippingType('COD'); // Wajib COD jika CASH
    } else {
      setShippingType('NON_COD'); // Wajib NON_COD jika QRIS
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk checkout', 'warning');
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?productId=${productId}`)}`);
      return;
    }

    if (!product) {
      showToast('Produk tidak ditemukan', 'error');
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      showToast(`Jumlah pesanan tidak valid (Stok tersedia: ${product.stock})`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        productId: product.id,
        quantity,
        paymentMethod,
        shippingType,
      });

      showToast(`Pesanan #${order.id} berhasil dibuat!`, 'success');
      router.push('/orders');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg =
        error.response?.data?.message ||
        'Gagal menyelesaikan checkout. Periksa koneksi backend NestJS.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memuat halaman checkout...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <Package size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Tidak Ada Produk untuk Checkout</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Silakan pilih produk terlebih dahulu dari katalog toko kami.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href={`/products/${product.id}`}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Detail Produk</span>
        </Link>
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Selesaikan <span style={{ color: 'var(--primary)' }}>Pesanan Anda</span>
      </h1>

      <form onSubmit={handleCheckout}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Order Options & Payment Method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Detail Item */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>1. Ringkasan Produk</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{product.name}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Kategori: {product.category} • Stok: {product.stock}
                  </div>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '0.3rem' }}>
                    {formatRupiah(product.price)} / unit
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Tentukan Kuantitas</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Business Logic Payment & Shipping Sync */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                2. Metode Pembayaran & Pengiriman
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Sesuai aturan backend API AffanStore, metode pembayaran tersinkronisasi ketat dengan
                metode pengiriman.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* QRIS + NON_COD Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--primary)' : 'var(--border)'}`,
                    background:
                      paymentMethod === 'QRIS' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => handlePaymentMethodChange('QRIS')}
                    style={{ marginTop: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <QrCode size={18} color="var(--primary)" />
                      <strong style={{ fontSize: '1rem' }}>QRIS (Non-Tunai) + Kirim NON_COD</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Bayar instan melalui BCA, GoPay, OVO, Dana, ShopeePay. Pengiriman langsung dikirim
                      via ekspedisi Express.
                    </div>
                  </div>
                </label>

                {/* CASH + COD Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border)'}`,
                    background:
                      paymentMethod === 'CASH' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => handlePaymentMethodChange('CASH')}
                    style={{ marginTop: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Truck size={18} color="var(--success)" />
                      <strong style={{ fontSize: '1rem' }}>CASH (Tunai) + Kirim COD</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Bayar tunai di tempat langsung ke kurir saat paket pesanan Anda tiba di alamat
                      tujuan.
                    </div>
                  </div>
                </label>
              </div>

              {/* QRIS Visual Preview */}
              {paymentMethod === 'QRIS' && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Simulasi Pembayaran QRIS AffanStore
                  </div>
                  <div
                    style={{
                      width: '130px',
                      height: '130px',
                      background: '#fff',
                      margin: '0 auto 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                    }}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=AFFANSTORE-PAY-${product.id}-${totalPrice}`}
                      alt="QRIS Code"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Scan QRIS ini dengan aplikasi E-Wallet atau M-Banking apapun.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Invoice & Confirm */}
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Rincian Tagihan</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Harga Satuan</span>
                <span>{formatRupiah(product.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Jumlah Unit</span>
                <span>x {quantity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
                <span className="badge badge-payment">{paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tipe Pengiriman</span>
                <span className="badge badge-payment">{shippingType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ongkos Kirim</span>
                <span style={{ color: 'var(--success)' }}>Gratis (Promo)</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Total Pembayaran</div>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatRupiah(totalPrice)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || product.stock <= 0}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? 'Memproses Pesanan...' : 'Bayar & Buat Pesanan'}</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={14} color="#10b981" />
              <span>Database Atomic Transaction Protected</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
