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
  MapPin,
  Lock,
  Zap,
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
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memuat halaman checkout belanja...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <Package size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Tidak Ada Produk untuk Checkout</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Silakan pilih produk terlebih dahulu dari katalog toko kami.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog Belanja</span>
        </Link>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href={`/products/${product.id}`}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Detail Produk</span>
        </Link>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
        Konfirmasi &amp; <span style={{ color: 'var(--primary-light)' }}>Pembayaran Pesanan</span>
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
          {/* Left Column: Product & Shipping & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Item Summary */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                1. Ringkasan Barang Belanja
              </h3>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                }}
              >
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge-official">Official Store</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {product.category || 'Umum'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>{product.name}</h4>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                    {formatRupiah(product.price)} / unit
                  </div>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Tentukan Kuantitas Pesanan</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    style={{ width: '34px', height: '34px', padding: 0 }}
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
                    style={{ width: '34px', height: '34px', padding: 0 }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                    (Stok tersedia: {product.stock} unit)
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Payment & Delivery Method Sync */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                2. Metode Pembayaran &amp; Kurir Pengiriman
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Pilih metode pembayaran yang Anda inginkan. Kurir pengiriman otomatis disesuaikan secara ketat.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* QRIS */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background:
                      paymentMethod === 'QRIS' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
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
                      <QrCode size={18} color="var(--primary-light)" />
                      <strong style={{ fontSize: '1rem' }}>QRIS Non-Tunai (Cashless)</strong>
                      <span className="badge-official" style={{ marginLeft: 'auto' }}>Kirim NON_COD</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Bayar instan menggunakan M-Banking (BCA, Mandiri, BRI) atau E-Wallet (GoPay, OVO, Dana).
                      Paket langsung diproses via Kurir Express.
                    </div>
                  </div>
                </label>

                {/* CASH (COD) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background:
                      paymentMethod === 'CASH' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
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
                      <Truck size={18} color="#10b981" />
                      <strong style={{ fontSize: '1rem' }}>Cash On Delivery (COD)</strong>
                      <span className="badge-free-shipping" style={{ marginLeft: 'auto' }}>Kirim COD</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Bayar tunai di tempat langsung ke kurir saat paket pesanan Anda tiba di alamat penerima.
                    </div>
                  </div>
                </label>
              </div>

              {/* QRIS Code Preview Simulator */}
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
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.6rem' }}>
                    Simulasi Kode QRIS Pembayaran
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
                      alt="QRIS Barcode"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Scan QRIS ini dengan aplikasi M-Banking atau E-Wallet apapun di Indonesia.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Invoice & Checkout Button */}
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>Rincian Tagihan Belanja</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Harga Satuan</span>
                <span>{formatRupiah(product.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Jumlah Pembelian</span>
                <span style={{ fontWeight: 600 }}>x {quantity} unit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
                <span className="badge badge-payment">{paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pengiriman</span>
                <span className="badge badge-payment">{shippingType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ongkos Kirim</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Gratis (Promo Bebas Ongkir)</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1.1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Total Pembayaran</div>
                  <div
                    style={{
                      fontSize: '1.65rem',
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
              className="btn btn-orange btn-lg"
              style={{ width: '100%', marginBottom: '1rem', gap: '0.5rem' }}
            >
              <Zap size={18} />
              <span>{submitting ? 'Memproses Pesanan...' : 'Bayar Sekarang'}</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={15} color="#10b981" />
              <span>Proteksi Transaksi &amp; Pengurangan Stok Otomatis</span>
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
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
