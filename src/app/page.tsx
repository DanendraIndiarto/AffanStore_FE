'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { formatRupiah, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import {
  Search,
  Sparkles,
  Truck,
  QrCode,
  ShieldCheck,
  PackageOpen,
  ArrowRight,
  Zap,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowUpDown,
  Tag,
  Clock,
  Flame,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'STOCK'>('POPULAR');

  // Hero Banner Slider state
  const [currentBanner, setCurrentBanner] = useState(0);

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

  // Auto-cycle hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 3);
    }, 6500);
    return () => clearInterval(timer);
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
      showToast('Silakan masuk terlebih dahulu untuk melakukan checkout belanja', 'warning');
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

      showToast('Pesanan berhasil dibuat! Stok langsung berkurang secara atomic.', 'success');
      setQuickBuyProduct(null);
      // Refresh products to show updated stock immediately
      fetchProducts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal membuat pesanan. Pastikan backend aktif.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Extract unique categories with count
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'Umum';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const list = Object.keys(categoryStats);
    return ['ALL', ...list];
  }, [categoryStats]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const result = products.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'STOCK') {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Banner slides data
  const banners = [
    {
      badge: '🔥 PROMO MEGA GAJIAN 2026',
      badgeColor: '#ef4444',
      title: 'Diskon Spesial Gadget & Lifestyle Pilihan',
      desc: 'Dapatkan cashback tambahan dengan bayar via QRIS atau pilih Bayar di Tempat (COD) bebas was-was!',
      ctaText: 'Belanja Sekarang',
      highlight: 'Cashback 20% + Bebas Ongkir',
    },
    {
      badge: '🚚 BAYAR DI TEMPAT (COD) NYAMAN',
      badgeColor: '#10b981',
      title: 'Pesan Hari Ini, Bayar Tunai ke Kurir Saat Tiba',
      desc: 'Nikmati kemudahan transaksi Cash on Delivery (COD) langsung di depan pintu rumah Anda tanpa ribet transfer.',
      ctaText: 'Cari Produk COD',
      highlight: 'Garansi Pengiriman Cepat',
    },
    {
      badge: '🛡️ 100% PRODUK ASLI & BERGARANSI',
      badgeColor: '#3b82f6',
      title: 'Koleksi Terkurasi dengan Proteksi Stok Real-Time',
      desc: 'Sistem transaksi terjamin aman. Stok terpotong otomatis saat checkout dan kembali instan bila pesanan batal.',
      ctaText: 'Eksplorasi Katalog',
      highlight: 'Jaminan Original 100%',
    },
  ];

  return (
    <div>
      {/* Dynamic E-Commerce Hero Showcase */}
      <section style={{ padding: '1.5rem 0 2rem' }}>
        <div className="container">
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #111a2e 0%, #0d1322 50%, #090e18 100%)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
            }}
          >
            {/* Ambient visual background glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-20%',
                left: '20%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                alignItems: 'center',
                gap: '2.5rem',
              }}
            >
              {/* Left Column: Banner Content */}
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '1.25rem',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Flame size={14} color={banners[currentBanner].badgeColor} />
                  <span>{banners[currentBanner].badge}</span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(1.9rem, 4vw, 3rem)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: '1rem',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {banners[currentBanner].title}
                </h1>

                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                    maxWidth: '560px',
                  }}
                >
                  {banners[currentBanner].desc}
                </p>

                {/* Call to Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <a
                    href="#catalog-section"
                    className="btn btn-orange btn-lg"
                    style={{ gap: '0.5rem' }}
                  >
                    <ShoppingBag size={18} />
                    <span>{banners[currentBanner].ctaText}</span>
                  </a>
                  <a
                    href="#catalog-section"
                    className="btn btn-secondary btn-lg"
                    style={{ gap: '0.5rem' }}
                  >
                    <span>Jelajahi Promo</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: E-Commerce Feature Callout Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  className="glass-panel"
                  style={{
                    padding: '1.75rem',
                    maxWidth: '380px',
                    width: '100%',
                    background: 'rgba(15, 22, 35, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={18} color="#f97316" />
                      <strong style={{ fontSize: '0.92rem' }}>Pilihan Metode Transaksi</strong>
                    </div>
                    <span className="badge-official">Resmi</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(37, 99, 235, 0.1)',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        <QrCode size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>QRIS Non-Tunai</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          BCA, GoPay, OVO • Kirim Express (NON_COD)
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        <Truck size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Bayar di Tempat (COD)</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Bayar Tunai saat kurir tiba di alamat tujuan
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>Sistem transaksi terlindungi &amp; pembatalan pesanan otomatis kembalikan stok.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Dots */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '2rem',
              }}
            >
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  style={{
                    width: currentBanner === idx ? '28px' : '9px',
                    height: '9px',
                    borderRadius: 'var(--radius-full)',
                    background: currentBanner === idx ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Retail Guarantees Bar */}
      <section style={{ padding: '0 0 2rem' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              className="glass-panel"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Bebas Biaya Ongkir</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Promo ongkir se-Indonesia
                </div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>100% Produk Original</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Garansi uang kembali penuh
                </div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(249, 115, 22, 0.12)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fb923c',
                  flexShrink: 0,
                }}
              >
                <QrCode size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>QRIS &amp; Bayar COD</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Fleksibel, instan, &amp; aman
                </div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                  flexShrink: 0,
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Restock Otomatis</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Stok terproteksi saat batal
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Shopping Section */}
      <section id="catalog-section" style={{ padding: '1.5rem 0 4rem' }}>
        <div className="container">
          {/* Section Header & Search / Sort Bar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShoppingBag size={22} color="#3b82f6" />
                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Katalog Produk</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Menampilkan <strong>{filteredProducts.length}</strong> produk pilihan siap dikirim
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  flexWrap: 'wrap',
                  flex: '1',
                  maxWidth: '560px',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Search Input */}
                <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                  <Search
                    size={17}
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
                    placeholder="Cari produk impian Anda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '42px', fontSize: '0.88rem' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div style={{ position: 'relative', minWidth: '170px' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="form-control"
                    style={{ fontSize: '0.86rem', padding: '0.8rem 0.85rem' }}
                  >
                    <option value="POPULAR">Urutan: Rekomendasi</option>
                    <option value="PRICE_LOW">Harga: Terendah</option>
                    <option value="PRICE_HIGH">Harga: Tertinggi</option>
                    <option value="STOCK">Stok: Terbanyak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === 'ALL' ? products.length : categoryStats[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '0.45rem 1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      flexShrink: 0,
                    }}
                  >
                    <span>{cat === 'ALL' ? 'Semua Produk' : cat}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{
                    height: '380px',
                    borderRadius: 'var(--radius-lg)',
                  }}
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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
                padding: '4.5rem 2rem',
                textAlign: 'center',
                maxWidth: '620px',
                margin: '2rem auto',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                <PackageOpen size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                Tidak Ada Produk yang Sesuai
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem',
                  marginBottom: '1.75rem',
                  lineHeight: 1.6,
                }}
              >
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Kombinasi pencarian atau kategori ini belum memiliki produk. Silakan reset filter pencarian Anda.'
                  : 'Belum ada produk aktif di katalog saat ini. Silakan kunjungi panel admin untuk menambahkan produk baru.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {(searchQuery || selectedCategory !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="btn btn-secondary"
                  >
                    Reset Filter
                  </button>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="btn btn-primary">
                    <Layers size={16} />
                    <span>Tambah Produk di Admin</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Buy Instant Checkout Modal */}
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
                className="btn btn-orange"
                disabled={isSubmittingOrder}
                style={{ gap: '0.5rem' }}
              >
                <Zap size={16} />
                <span>
                  {isSubmittingOrder
                    ? 'Memproses...'
                    : `Bayar Sekarang (${formatRupiah(quickBuyProduct.price * quantity)})`}
                </span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Product Summary Snapshot */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={getImageUrl(quickBuyProduct.imageUrl)}
                alt={quickBuyProduct.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  {quickBuyProduct.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Kategori: {quickBuyProduct.category || 'Umum'} • Tersedia: {quickBuyProduct.stock} unit
                </div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#fff',
                    marginTop: '0.2rem',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {formatRupiah(quickBuyProduct.price)}
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tentukan Kuantitas Pesanan</label>
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
                  disabled={quantity <= 1}
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '34px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuantity((q) => Math.min(quickBuyProduct.stock, q + 1))}
                  disabled={quantity >= quickBuyProduct.stock}
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  +
                </button>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Subtotal Produk</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                    {formatRupiah(quickBuyProduct.price * quantity)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Strict sync with shipping type) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Metode Pembayaran Resmi</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* QRIS Card */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.95rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'QRIS' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background: paymentMethod === 'QRIS' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => handlePaymentMethodChange('QRIS')}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <QrCode size={16} color="var(--primary-light)" />
                      <strong style={{ fontSize: '0.92rem' }}>QRIS Non-Tunai</strong>
                      <span className="badge-official" style={{ marginLeft: 'auto' }}>
                        Instan
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Scan barcode via BCA, Mandiri, GoPay, OVO, Dana • Dikirim via <strong>NON_COD</strong> (Express)
                    </div>
                  </div>
                </label>

                {/* CASH Card */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.95rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary-light)' : 'var(--border)'}`,
                    background: paymentMethod === 'CASH' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => handlePaymentMethodChange('CASH')}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <Truck size={16} color="#10b981" />
                      <strong style={{ fontSize: '0.92rem' }}>Bayar Tunai di Tempat (COD)</strong>
                      <span className="badge-free-shipping" style={{ marginLeft: 'auto' }}>
                        Bayar saat tiba
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Bayar tunai langsung ke kurir • Pengiriman otomatis: <strong>COD</strong>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Price & Guarantee Note */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Ongkos Kirim</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Rp 0 (Promo Bebas Ongkir)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Pengiriman Sesuai Pembayaran</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{shippingType}</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.4rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#fff',
                }}
              >
                <span>Total Tagihan</span>
                <span style={{ color: '#f97316' }}>{formatRupiah(quickBuyProduct.price * quantity)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
