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
  Truck,
  QrCode,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Tag,
  Share2,
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

      showToast('Pesanan berhasil dibuat! Stok langsung berkurang secara otomatis.', 'success');
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
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', margin: '0 auto 1.5rem' }} className="skeleton" />
        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Memuat detail produk pilihan...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Produk Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Produk dengan ID #{id} tidak ditemukan atau mungkin telah dinonaktifkan.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog Belanja</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const strikePrice = Math.round((product.price * 1.18) / 1000) * 1000;
  const soldCount = (product.id * 17 + 23) % 250 + 20;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={14} />
          <span>Katalog</span>
        </Link>
        <span>/</span>
        <span>{product.category || 'Umum'}</span>
        <span>/</span>
        <span style={{ color: '#fff', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Product Visuals & Assurances */}
        <div>
          <div
            className="glass-panel"
            style={{
              overflow: 'hidden',
              padding: '1.25rem',
              backgroundColor: '#0c121e',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '85%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#070a10',
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
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <span className="badge-official">Official Store</span>
                <span className="badge-free-shipping">Bebas Ongkir</span>
              </div>
            </div>
          </div>

          {/* Guarantee Badges Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
            }}
          >
            <div
              className="glass-panel"
              style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
            >
              <ShieldCheck size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>100% Asli</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Garansi Original</div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
            >
              <Truck size={20} color="#3b82f6" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Bebas Ongkir</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ke Seluruh Wilayah</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, & Purchase Form */}
        <div>
          {/* Top badges */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              {product.category || 'Umum'}
            </span>

            {isOutOfStock ? (
              <span className="badge badge-cancelled">Stok Habis</span>
            ) : product.stock < 5 ? (
              <span className="badge badge-pending">Sisa {product.stock} Unit Cepat Habis!</span>
            ) : (
              <span className="badge badge-paid">Tersedia {product.stock} Unit</span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.25, marginBottom: '0.85rem' }}>
            {product.name}
          </h1>

          {/* Rating, Sold, & Store Feedback */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--star-color)' }}>
              <Star size={16} fill="currentColor" />
              <strong style={{ color: '#fff', fontSize: '0.92rem' }}>4.9</strong>
            </div>
            <span>•</span>
            <span>{soldCount}+ Terjual</span>
            <span>•</span>
            <span style={{ color: '#10b981' }}>98% Pembeli Puas</span>
          </div>

          {/* Pricing Box */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
              background: 'rgba(15, 22, 35, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                {formatRupiah(strikePrice)}
              </span>
              <span className="badge-discount">-18% PROMO</span>
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatRupiah(product.price)}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: '#10b981',
                marginTop: '0.5rem',
              }}
            >
              <Truck size={14} />
              <span>Gratis Ongkir s/d Rp 40.000 dengan metode bayar apapun</span>
            </div>
          </div>

          {/* Description Section */}
          <div
            className="glass-panel"
            style={{ padding: '1.35rem', marginBottom: '1.75rem', fontSize: '0.94rem' }}
          >
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.65rem', color: '#fff', fontWeight: 700 }}>
              Deskripsi Produk Lengkap
            </h4>
            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
              {product.description || 'Tidak ada deskripsi detail produk.'}
            </p>
          </div>

          {/* Interactive Order & Checkout Box */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
              Form Pembelian &amp; Checkout Cepat
            </h3>

            {/* Quantity Stepper */}
            <div className="form-group">
              <label className="form-label">Tentukan Jumlah Pesanan</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
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
                  disabled={quantity >= product.stock || isOutOfStock}
                  style={{ width: '34px', height: '34px', padding: 0 }}
                >
                  +
                </button>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Subtotal</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {formatRupiah(product.price * quantity)}
                  </div>
                </div>
              </div>
            </div>

            {/* Synchronized Payment & Delivery Method Selector */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Pilih Metode Pembayaran</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* QRIS */}
                <div
                  onClick={() => handlePaymentMethodChange('QRIS')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background: paymentMethod === 'QRIS' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <QrCode size={18} color={paymentMethod === 'QRIS' ? 'var(--primary-light)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>QRIS Non-Tunai</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Pengiriman: <strong>NON_COD</strong> (Express)
                  </div>
                </div>

                {/* CASH */}
                <div
                  onClick={() => handlePaymentMethodChange('CASH')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background: paymentMethod === 'CASH' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <Truck size={18} color={paymentMethod === 'CASH' ? '#10b981' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>CASH (COD)</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Pengiriman: <strong>COD</strong> (Bayar di Tempat)
                  </div>
                </div>
              </div>
            </div>

            {/* Restock & Business Note */}
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Transaksi otomatis memotong stok. Jika pesanan dibatalkan, stok dikembalikan seketika.</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleOrder}
              disabled={isOutOfStock || isSubmitting}
              className="btn btn-orange btn-lg"
              style={{ width: '100%', marginTop: '1.25rem', gap: '0.6rem' }}
            >
              <Zap size={20} />
              <span>
                {isOutOfStock
                  ? 'Stok Barang Habis'
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
