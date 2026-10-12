'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { formatRupiah } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  QrCode,
  ShieldCheck,
  PackageOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Quick Buy Modal State
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('QRIS');
  const [shippingType, setShippingType] = useState<'COD' | 'NON_COD'>('NON_COD');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Strict business logic sync when payment method changes in quick buy
  const handlePaymentMethodChange = (method: 'CASH' | 'QRIS') => {
    setPaymentMethod(method);
    if (method === 'CASH') {
      setShippingType('COD'); // Wajib COD jika CASH
    } else {
      setShippingType('NON_COD'); // Wajib NON_COD jika QRIS
    }
  };

  const handleOpenQuickBuy = (product: Product) => {
    if (!user) {
      showToast('Silakan masuk terlebih dahulu untuk melakukan checkout', 'warning');
      router.push('/login');
      return;
    }
    setQuickBuyProduct(product);
    setQuantity(1);
    setPaymentMethod('QRIS');
    setShippingType('NON_COD');
  };

  const handleConfirmQuickBuy = async () => {
    if (!quickBuyProduct) return;
    if (quantity < 1 || quantity > quickBuyProduct.stock) {
      showToast(`Jumlah pesanan harus antara 1 dan ${quickBuyProduct.stock}`, 'error');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      await orderService.createOrder({
        productId: quickBuyProduct.id,
        quantity,
        paymentMethod,
        shippingType,
      });

      showToast('Pesanan berhasil dibuat! Stok otomatis terpotong.', 'success');
      setQuickBuyProduct(null);
      // Refresh products to show updated stock
      fetchProducts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal membuat pesanan. Pastikan backend aktif.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 0 3.5rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#131824',
                border: '1px solid var(--border)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginBottom: '1.25rem',
              }}
            >
              <span>Platform Belanja Online Terpercaya</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              Koleksi Produk Pilihan dengan{' '}
              <span style={{ color: 'var(--primary)' }}>Transaksi Aman & Cepat</span>
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              Pilihan produk terverifikasi dengan metode bayar fleksibel:{' '}
              <strong style={{ color: '#fff' }}>QRIS Non-COD</strong> atau{' '}
              <strong style={{ color: '#fff' }}>Cash on Delivery (COD)</strong>. Pengurangan dan
              pengembalian stok terproteksi otomatis.
            </p>

            {/* Feature Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                textAlign: 'left',
                marginTop: '1.5rem',
              }}
            >
              <div
                className="glass-panel"
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#171d2b',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <QrCode size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Bayar QRIS</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Pengiriman Non-COD
                  </div>
                </div>
              </div>

              <div
                className="glass-panel"
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#171d2b',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Bayar Tunai (CASH)</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Pengiriman COD
                  </div>
                </div>
              </div>

              <div
                className="glass-panel"
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#171d2b',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Auto Restock</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Stok kembali saat batal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Bar */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Katalog Produk</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Menampilkan {filteredProducts.length} produk siap diorder
              </p>
            </div>

            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                minWidth: '280px',
                flex: '1',
                maxWidth: '420px',
              }}
            >
              <Search
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
                type="text"
                placeholder="Cari produk atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm ${
                    selectedCategory === cat ? 'btn-primary' : 'btn-secondary'
                  }`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="glass-panel"
                  style={{
                    height: '340px',
                    animation: 'pulse 1.5s infinite',
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickBuy={handleOpenQuickBuy}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div
              className="glass-panel"
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '2rem auto',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                <PackageOpen size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                Tidak Ada Produk yang Ditemukan
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem',
                  marginBottom: '1.5rem',
                }}
              >
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Coba ganti kata kunci pencarian atau reset filter kategori Anda.'
                  : 'Belum ada produk aktif di toko saat ini. Jika Anda admin, silakan tambahkan produk baru di Dashboard Admin.'}
              </p>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="btn btn-primary">
                  <Layers size={16} />
                  <span>Buka Admin Panel & Tambah Produk</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick Buy Modal */}
      {quickBuyProduct && (
        <Modal
          isOpen={true}
          onClose={() => setQuickBuyProduct(null)}
          title="Beli Produk Sekarang"
          footer={
            <>
              <button
                onClick={() => setQuickBuyProduct(null)}
                className="btn btn-secondary"
                disabled={isSubmittingOrder}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmQuickBuy}
                className="btn btn-primary"
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Product Summary */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {quickBuyProduct.name}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Kategori: {quickBuyProduct.category} • Stok: {quickBuyProduct.stock}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#fff',
                    marginTop: '0.25rem',
                  }}
                >
                  {formatRupiah(quickBuyProduct.price)}
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Jumlah Pembelian</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity((q) => Math.min(quickBuyProduct.stock, q + 1))}
                  disabled={quantity >= quickBuyProduct.stock}
                >
                  +
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  Total: <strong style={{ color: '#fff' }}>{formatRupiah(quickBuyProduct.price * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Business Logic Rule: Payment Method & Shipping Synchronized */}
            <div className="form-group">
              <label className="form-label">Metode Pembayaran (Sesuai Aturan Transaksi)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* QRIS option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentMethod === 'QRIS' ? 'var(--primary)' : 'var(--border)'}`,
                    background: paymentMethod === 'QRIS' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => handlePaymentMethodChange('QRIS')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      QRIS (Non-Tunai)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Wajib Pengiriman: <strong>NON_COD</strong> (Kurir Express)
                    </div>
                  </div>
                </label>

                {/* CASH option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border)'}`,
                    background: paymentMethod === 'CASH' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => handlePaymentMethodChange('CASH')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      CASH (Bayar Tunai)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Wajib Pengiriman: <strong>COD</strong> (Bayar di Tempat)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Locked Shipping Type indicator */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#171d2b',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                Tipe Pengiriman Terkunci: {shippingType}
              </div>
              <div>
                Tipe pengiriman otomatis disesuaikan dengan metode pembayaran guna memenuhi validasi
                strict backend API.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
