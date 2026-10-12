'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../../types';
import { productService } from '../../../services/productService';
import { formatRupiah, getImageUrl } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { orderService } from '../../../services/orderService';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Truck,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Package,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('QRIS');
  const [shippingType, setShippingType] = useState<'COD' | 'NON_COD'>('NON_COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product detail', err);
        showToast('Produk tidak ditemukan atau backend belum aktif', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, showToast]);

  const handlePaymentMethodChange = (method: 'CASH' | 'QRIS') => {
    setPaymentMethod(method);
    if (method === 'CASH') {
      setShippingType('COD');
    } else {
      setShippingType('NON_COD');
    }
  };

  const handleOrder = async () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk memesan produk', 'warning');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product?.id || id}`)}`);
      return;
    }
    if (!product) return;
    if (quantity < 1 || quantity > product.stock) {
      showToast(`Jumlah pesanan harus antara 1 dan ${product.stock}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        productId: product.id,
        quantity,
        paymentMethod,
        shippingType,
      });

      showToast('Pesanan berhasil dibuat! Stok langsung berkurang.', 'success');
      router.push('/orders');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal membuat pesanan';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Memuat detail produk...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Produk Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Produk dengan ID #{id} tidak ada atau telah dihapus.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Breadcrumb / Back button */}
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Product Image Column */}
        <div
          className="glass-panel"
          style={{
            overflow: 'hidden',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: '#0c121e',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '80%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* Product Info & Purchase Form */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              {product.category || 'Umum'}
            </span>

            {isOutOfStock ? (
              <span className="badge badge-cancelled">Stok Habis</span>
            ) : product.stock < 5 ? (
              <span className="badge badge-pending">Sisa {product.stock} Unit</span>
            ) : (
              <span className="badge badge-paid">Tersedia {product.stock} Unit</span>
            )}
          </div>

          <h1 style={{ fontSize: '2.2rem', lineHeight: 1.25, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-heading)',
              marginBottom: '1.5rem',
            }}
          >
            {formatRupiah(product.price)}
          </div>

          <div
            className="glass-panel"
            style={{ padding: '1.25rem', marginBottom: '2rem', fontSize: '0.95rem' }}
          >
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Deskripsi Produk
            </h4>
            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
              {product.description || 'Tidak ada deskripsi produk.'}
            </p>
          </div>

          {/* Checkout Configuration Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
              Form Pemesanan & Pembayaran
            </h3>

            {/* Quantity Stepper */}
            <div className="form-group">
              <label className="form-label">Kuantitas Pesanan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
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
                  disabled={quantity >= product.stock || isOutOfStock}
                >
                  +
                </button>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Subtotal</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {formatRupiah(product.price * quantity)}
                  </div>
                </div>
              </div>
            </div>

            {/* Synchronized Payment and Shipping Selection */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Metode Pembayaran & Pengiriman</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* QRIS */}
                <div
                  onClick={() => handlePaymentMethodChange('QRIS')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--primary)' : 'var(--border)'}`,
                    background: paymentMethod === 'QRIS' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <QrCode size={18} color={paymentMethod === 'QRIS' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 700 }}>QRIS</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Kirim: <strong>NON_COD</strong> (Express)
                  </div>
                </div>

                {/* CASH */}
                <div
                  onClick={() => handlePaymentMethodChange('CASH')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border)'}`,
                    background: paymentMethod === 'CASH' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <Truck size={18} color={paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 700 }}>CASH (COD)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Kirim: <strong>COD</strong> (Bayar di Tempat)
                  </div>
                </div>
              </div>
            </div>

            {/* Business Rule Warning Note */}
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              ⚡ <strong>Aturan Transaksi:</strong> Stok dipotong seketika secara atomic saat checkout.
              Bila Anda membatalkan pesanan (status PENDING), stok otomatis kembali.
            </div>

            {/* Submit Button */}
            <button
              onClick={handleOrder}
              disabled={isOutOfStock || isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              <ShoppingCart size={20} />
              <span>
                {isOutOfStock
                  ? 'Stok Tidak Tersedia'
                  : isSubmitting
                  ? 'Memproses Transaksi...'
                  : `Beli Sekarang (${formatRupiah(product.price * quantity)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
