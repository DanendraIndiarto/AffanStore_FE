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
        `Pesanan #${orderToCancel.id} berhasil dibatalkan. Stok barang otomatis direstock!`,
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
            <XCircle size={13} /> Dibatalkan
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
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memeriksa sesi pengguna...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Riwayat Pesanan</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Pantau dan kelola seluruh transaksi belanja Anda di AffanStore
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
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
          Dibayar ({orders.filter((o) => o.status === 'PAID').length})
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
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Memuat riwayat pesanan...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--text-dim)',
            }}
          >
            <Package size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Belum Ada Pesanan</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Anda belum memiliki riwayat transaksi dengan kategori filter ini.
          </p>
          <Link href="/" className="btn btn-primary">
            <ShoppingBag size={16} />
            <span>Mulai Berbelanja</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    Order #{order.id}
                  </span>
                  {renderStatusBadge(order.status)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-payment">
                    <CreditCard size={12} /> {order.paymentMethod}
                  </span>
                  <span className="badge badge-payment">
                    <Truck size={12} /> {order.shippingType}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            background: '#0c121e',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={getImageUrl(item.product?.imageUrl)}
                            alt={item.product?.name || 'Produk'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {item.product?.name || `Produk #${item.productId}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.quantity} x {formatRupiah(item.price)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Item pesanan siap diproses.
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
                    Total Pesanan:
                  </span>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-secondary btn-sm"
                  >
                    Detail Transaksi
                  </button>

                  {/* Cancel Button ONLY if status is PENDING */}
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => setOrderToCancel(order)}
                      className="btn btn-danger btn-sm"
                    >
                      Batalkan Pesanan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal to Cancel Order */}
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
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              Batalkan Pesanan #{orderToCancel.id}?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Apakah Anda yakin ingin membatalkan pesanan ini? Sesuai aturan bisnis AffanStore, stok
              produk akan <strong>langsung direstock kembali</strong> ke database secara otomatis.
            </p>
          </div>
        </Modal>
      )}

      {/* Detail Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Detail Pesanan #${selectedOrder.id}`}
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
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Status Saat Ini</div>
                <div style={{ marginTop: '0.25rem' }}>{renderStatusBadge(selectedOrder.status)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>ID Pelanggan</div>
                <div style={{ fontWeight: 600 }}>#{selectedOrder.userId}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Pembayaran:</span>
                <strong>{selectedOrder.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tipe Pengiriman:</span>
                <strong>{selectedOrder.shippingType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Pembayaran:</span>
                <strong style={{ color: '#fff' }}>
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
