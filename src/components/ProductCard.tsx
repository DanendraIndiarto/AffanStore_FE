'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { formatRupiah, getImageUrl } from '../services/api';
import { ShoppingBag, Eye, Star, Zap, Truck, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickBuy?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickBuy }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(getImageUrl(product.imageUrl));
  const isOutOfStock = product.stock <= 0;

  // Realistic e-commerce promo price simulation (for display aesthetics)
  const strikePrice = Math.round((product.price * 1.18) / 1000) * 1000;
  const ratingScore = '4.9';
  const soldCount = (product.id * 17 + 23) % 250 + 15;

  return (
    <div className="product-card-wrap">
      {/* Product Image Area */}
      <div className="product-img-box">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 2,
          }}
        >
          <span className="badge-official">Official Store</span>
          {product.price > 100000 && (
            <span className="badge-flash">
              <Zap size={10} style={{ display: 'inline', marginRight: '2px' }} />
              Hot Deal
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
          }}
        >
          {isOutOfStock ? (
            <span className="badge badge-cancelled">Stok Habis</span>
          ) : product.stock < 5 ? (
            <span className="badge badge-pending">Sisa {product.stock}</span>
          ) : (
            <span className="badge badge-paid">Stok {product.stock}</span>
          )}
        </div>

        {/* Free Shipping Badge floating over bottom image */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            zIndex: 2,
          }}
        >
          <span className="badge-free-shipping">
            <Truck size={11} style={{ display: 'inline', marginRight: '3px' }} />
            Bebas Ongkir
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div
        style={{
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Category & Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.4rem',
            fontSize: '0.76rem',
            color: 'var(--text-dim)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
            {product.category || 'Umum'}
          </span>
          <span>📍 Jakarta Pusat</span>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              lineHeight: 1.4,
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating and Sold Social Proof */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--star-color)' }}>
            <Star size={13} fill="currentColor" />
            <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{ratingScore}</strong>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>{soldCount}+ terjual</span>
        </div>

        {/* Pricing Section */}
        <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-dim)',
                textDecoration: 'line-through',
              }}
            >
              {formatRupiah(strikePrice)}
            </span>
            <span className="badge-discount">-18%</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatRupiah(product.price)}
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
            {onQuickBuy ? (
              <button
                onClick={() => onQuickBuy(product)}
                disabled={isOutOfStock}
                className="btn btn-orange btn-sm"
                title="Beli Langsung Sekarang"
                style={{ width: '100%', gap: '0.4rem' }}
              >
                <Zap size={14} />
                <span>{isOutOfStock ? 'Habis' : 'Beli Langsung'}</span>
              </button>
            ) : (
              <Link
                href={`/checkout?productId=${product.id}`}
                className={`btn btn-orange btn-sm ${isOutOfStock ? 'btn-disabled' : ''}`}
                style={{ width: '100%', gap: '0.4rem' }}
              >
                <Zap size={14} />
                <span>{isOutOfStock ? 'Habis' : 'Beli Langsung'}</span>
              </Link>
            )}

            <Link
              href={`/products/${product.id}`}
              className="btn btn-secondary btn-sm"
              title="Lihat Detail Produk"
              style={{ padding: '0.45rem 0.65rem' }}
            >
              <Eye size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
