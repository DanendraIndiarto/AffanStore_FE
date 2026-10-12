'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { formatRupiah, getImageUrl } from '../services/api';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickBuy?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickBuy }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(getImageUrl(product.imageUrl));
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          backgroundColor: '#0c121e',
          overflow: 'hidden',
        }}
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Category Pill */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(12, 15, 23, 0.85)',
            padding: '3px 9px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          {product.category || 'Umum'}
        </div>

        {/* Stock Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
          }}
        >
          {isOutOfStock ? (
            <span className="badge badge-cancelled">Habis</span>
          ) : product.stock < 5 ? (
            <span className="badge badge-pending">Sisa {product.stock}</span>
          ) : (
            <span className="badge badge-paid">Stok {product.stock}</span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Link href={`/products/${product.id}`}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: '0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {product.description}
          </p>
        )}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Harga</div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {formatRupiah(product.price)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Link
              href={`/products/${product.id}`}
              className="btn btn-secondary btn-sm"
              title="Lihat Detail"
              style={{ padding: '0.5rem 0.65rem' }}
            >
              <Eye size={16} />
            </Link>

            {onQuickBuy ? (
              <button
                onClick={() => onQuickBuy(product)}
                disabled={isOutOfStock}
                className="btn btn-primary btn-sm"
                title="Beli Sekarang"
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <ShoppingCart size={16} />
                <span>Beli</span>
              </button>
            ) : (
              <Link
                href={`/checkout?productId=${product.id}`}
                className={`btn btn-primary btn-sm ${isOutOfStock ? 'btn-disabled' : ''}`}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <ShoppingCart size={16} />
                <span>Beli</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
