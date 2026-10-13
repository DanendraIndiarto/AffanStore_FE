'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { formatRupiah, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Eye,
  QrCode,
  RotateCcw,
} from 'lucide-react';

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');

  // Cancel order modal state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // View detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch orders', err);
      showToast('Gagal memuat riwayat pesanan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderToCancel.id);
      showToast(
        `Pesanan #${orderToCancel.id} berhasil dibatalkan. Stok barang otomatis direstock kembali!`,
        'success'
      );
      setOrderToCancel(null);
      fetchOrders();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal membatalkan pesanan.';
      showToast(msg, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge badge-paid">
            <CheckCircle2 size={13} /> Selesai / Dibayar
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-cancelled">
            <XCircle size={13} /> Dibatalkan (Restocked)
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="badge badge-pending">
            <Clock size={13} /> Menunggu Pembayaran
          </span>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memeriksa sesi akun Anda...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShoppingBag size={22} color="#3b82f6" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Pesanan Saya</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Pantau dan kelola seluruh transaksi belanja Anda di AffanStore
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.85rem',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Semua ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`btn btn-sm ${activeTab === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Menunggu ({orders.filter((o) => o.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('PAID')}
          className={`btn btn-sm ${activeTab === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Selesai / Dibayar ({orders.filter((o) => o.status === 'PAID').length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`btn btn-sm ${activeTab === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Dibatalkan ({orders.filter((o) => o.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '4.5rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
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
              margin: '0 auto 1.25rem',
              color: 'var(--text-dim)',
            }}
          >
            <Package size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Belum Ada Pesanan</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Belum ada riwayat pesanan pada kategori ini. Yuk temukan berbagai produk menarik di katalog kami!
          </p>
          <Link href="/" className="btn btn-orange">
            <ShoppingBag size={16} />
            <span>Mulai Berbelanja</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '1rem',
                  marginBottom: '1.15rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <span className="badge-official">Affan Store</span>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>
                    Pesanan #{order.id}
                  </span>
                  {renderStatusBadge(order.status)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span
                    className="badge badge-payment"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {order.paymentMethod === 'QRIS' ? <QrCode size={13} color="#3b82f6" /> : <Truck size={13} color="#10b981" />}
                    <span>{order.paymentMethod}</span>
                  </span>
                  <span className="badge badge-payment">
                    Kurir: {order.shippingType}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#0c121e',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid var(--border)',
                          }}
                        >
                          <img
                            src={getImageUrl(item.product?.imageUrl)}
                            alt={item.product?.name || 'Produk'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <Link
                            href={item.productId ? `/products/${item.productId}` : '#'}
                            style={{
                              fontWeight: 700,
                              fontSize: '0.96rem',
                              color: '#fff',
                              display: 'inline-block',
                            }}
                          >
                            {item.product?.name || `Produk #${item.productId}`}
                          </Link>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.quantity} barang x {formatRupiah(item.price)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', textAlign: 'right' }}>
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Item pesanan siap diproses oleh sistem.
                  </div>
                )}
              </div>

              {/* Order Footer & Actions */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginRight: '0.5rem' }}>
                    Total Belanja:
                  </span>
                  <span
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    <Eye size={14} />
                    <span>Detail Transaksi</span>
                  </button>

                  {/* Cancel Button ONLY if status is PENDING */}
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => setOrderToCancel(order)}
                      className="btn btn-danger btn-sm"
                      style={{ gap: '0.4rem' }}
                    >
                      <RotateCcw size={14} />
                      <span>Batalkan &amp; Restock</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <Modal
          isOpen={true}
          onClose={() => setOrderToCancel(null)}
          title="Konfirmasi Pembatalan Pesanan"
          footer={
            <>
              <button
                onClick={() => setOrderToCancel(null)}
                className="btn btn-secondary"
                disabled={isCancelling}
              >
                Kembali
              </button>
              <button
                onClick={handleCancelOrder}
                className="btn btn-danger"
                disabled={isCancelling}
              >
                {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
              </button>
            </>
          }
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={30} />
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>
              Batalkan Pesanan #{orderToCancel.id}?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Apakah Anda yakin ingin membatalkan pesanan ini? Stok produk akan{' '}
              <strong style={{ color: '#fff' }}>seketika dikembalikan</strong> ke database secara atomic.
            </p>
          </div>
        </Modal>
      )}

      {/* Detail Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Rincian Pesanan #${selectedOrder.id}`}
          footer={
            <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
              Tutup
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Status Transaksi</div>
                <div style={{ marginTop: '0.25rem' }}>{renderStatusBadge(selectedOrder.status)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>ID Pelanggan</div>
                <div style={{ fontWeight: 700 }}>#{selectedOrder.userId}</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Pembayaran:</span>
                <strong>{selectedOrder.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tipe Pengiriman:</span>
                <strong>{selectedOrder.shippingType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Biaya Pengiriman:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Rp 0 (Bebas Ongkir)</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.65rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Pembayaran:</span>
                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
                  {formatRupiah(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
