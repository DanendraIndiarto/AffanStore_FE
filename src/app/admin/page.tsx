'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, Order, User, OrderStatus } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { formatRupiah, getImageUrl } from '../../services/api';
import Modal from '../../components/Modal';
import {
  ShieldAlert,
  Layers,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'ORDERS' | 'USERS'>(
    'OVERVIEW'
  );

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Delete Product confirmation
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Order Status Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('PENDING');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [prods, ords, usrs] = await Promise.allSettled([
        productService.getProducts(),
        orderService.getAllOrdersAdmin(),
        userService.getAllUsers(),
      ]);

      if (prods.status === 'fulfilled') setProducts(prods.value || []);
      if (ords.status === 'fulfilled') setOrders(ords.value || []);
      if (usrs.status === 'fulfilled') setUsers(usrs.value || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
      showToast('Gagal memuat sebagian data admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user && !isAdmin) {
      // User is logged in but not admin
    } else if (isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, authLoading, router]);

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: '', stock: '', description: '' });
    setProductImageFile(null);
    setProductImagePreview('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price.toString(),
      category: prod.category || '',
      stock: prod.stock.toString(),
      description: prod.description || '',
    });
    setProductImageFile(null);
    setProductImagePreview(getImageUrl(prod.imageUrl));
    setIsProductModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock) {
      showToast('Harap lengkapi kolom wajib produk', 'warning');
      return;
    }

    setIsSavingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      if (productForm.description) formData.append('description', productForm.description);
      if (productImageFile) formData.append('image', productImageFile);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        showToast(`Produk "${productForm.name}" berhasil diperbarui`, 'success');
      } else {
        await productService.createProduct(formData);
        showToast(`Produk "${productForm.name}" berhasil ditambahkan`, 'success');
      }
      setIsProductModalOpen(false);
      loadAdminData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal menyimpan produk';
      showToast(msg, 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      await productService.deleteProduct(deletingProductId);
      showToast('Produk berhasil dihapus dari katalog', 'success');
      setDeletingProductId(null);
      loadAdminData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal menghapus produk';
      showToast(msg, 'error');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async () => {
    if (!editingOrder) return;
    setIsUpdatingOrder(true);
    try {
      await orderService.updateOrderStatusAdmin(editingOrder.id, newOrderStatus);
      showToast(`Status Order #${editingOrder.id} diubah ke ${newOrderStatus}`, 'success');
      setEditingOrder(null);
      loadAdminData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal mengubah status pesanan';
      showToast(msg, 'error');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // User Actions
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'USER' });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      if (editingUser) {
        const payload: { name?: string; email?: string; password?: string; role?: 'USER' | 'ADMIN' } = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        };
        if (userForm.password) payload.password = userForm.password;
        await userService.updateUser(editingUser.id, payload);
        showToast('Data pengguna berhasil diperbarui', 'success');
      } else {
        if (!userForm.password || userForm.password.length < 6) {
          showToast('Kata sandi minimal 6 karakter', 'warning');
          setIsSavingUser(false);
          return;
        }
        await userService.createUser(userForm);
        showToast('Pengguna baru berhasil dibuat', 'success');
      }
      setIsUserModalOpen(false);
      loadAdminData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal menyimpan data pengguna';
      showToast(msg, 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await userService.deleteUser(deletingUserId);
      showToast('Pengguna berhasil dihapus', 'success');
      setDeletingUserId(null);
      loadAdminData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Gagal menghapus pengguna';
      showToast(msg, 'error');
    }
  };

  // Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  if (authLoading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memeriksa hak akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ marginBottom: '0.75rem' }}>Akses Ditolak (Khusus Admin)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Halaman ini hanya dapat diakses oleh akun dengan Role <strong>ADMIN</strong>. Silakan masuk
          dengan akun administrator Anda.
        </p>
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda Toko
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Admin Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
            <span className="badge badge-role-admin">Super Admin</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Kelola produk, transaksi pesanan, dan manajemen akun pengguna AffanStore
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Admin Tabs */}
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
          onClick={() => setActiveTab('OVERVIEW')}
          className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Layers size={14} />
          <span>Ringkasan Toko</span>
        </button>
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`btn btn-sm ${activeTab === 'PRODUCTS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <ShoppingBag size={14} />
          <span>Katalog Produk ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`btn btn-sm ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Package size={14} />
          <span>Seluruh Pesanan ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`btn btn-sm ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Users size={14} />
          <span>Pengguna ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div>
          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Pendapatan (PAID)</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {formatRupiah(totalRevenue)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Pesanan Masuk</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                  <Package size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {orders.length} Transaksi
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jumlah Produk Toko</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: '#171d2b', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {products.length} Item
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pengguna Terdaftar</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {users.length} Akun
              </div>
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Operasional Cepat</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button onClick={handleOpenAddProduct} className="btn btn-primary">
                <Plus size={16} />
                <span>Tambah Produk Baru</span>
              </button>
              <button onClick={() => setActiveTab('ORDERS')} className="btn btn-secondary">
                <Package size={16} />
                <span>Verifikasi Status Pesanan</span>
              </button>
              <button onClick={handleOpenAddUser} className="btn btn-secondary">
                <Users size={16} />
                <span>Buat Akun Pengguna</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'PRODUCTS' && (
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ position: 'relative', width: '320px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="text"
                placeholder="Cari nama atau kategori..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', paddingBlock: '0.55rem' }}
              />
            </div>

            <button onClick={handleOpenAddProduct} className="btn btn-primary">
              <Plus size={16} />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foto & Nama</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((prod) => (
                    <tr key={prod.id}>
                      <td>#{prod.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={getImageUrl(prod.imageUrl)}
                            alt={prod.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{prod.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-payment">{prod.category}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(prod.price)}</td>
                      <td>
                        {prod.stock <= 0 ? (
                          <span className="badge badge-cancelled">Habis</span>
                        ) : (
                          <span className="badge badge-paid">{prod.stock}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Produk"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(prod.id)}
                            className="btn btn-danger btn-sm"
                            title="Hapus Produk"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'ORDERS' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Seluruh Pesanan Toko</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Melihat semua pesanan customer dan perbarui status transaksi (PAID / CANCELLED / PENDING)
            </p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer (User)</th>
                  <th>Produk / Item</th>
                  <th>Metode & Pengiriman</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi Admin</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {order.user?.name || `User #${order.userId}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {order.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem' }}>
                            {item.quantity}x {item.product?.name || `Produk #${item.productId}`}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className="badge badge-payment" style={{ width: 'fit-content' }}>
                          {order.paymentMethod}
                        </span>
                        <span className="badge badge-payment" style={{ width: 'fit-content' }}>
                          {order.shippingType}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {formatRupiah(order.totalAmount)}
                    </td>
                    <td>
                      {order.status === 'PAID' ? (
                        <span className="badge badge-paid">PAID</span>
                      ) : order.status === 'CANCELLED' ? (
                        <span className="badge badge-cancelled">CANCELLED</span>
                      ) : (
                        <span className="badge badge-pending">PENDING</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setNewOrderStatus(order.status);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Ubah Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS */}
      {activeTab === 'USERS' && (
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Manajemen Pengguna</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Daftar semua pengguna terdaftar dan hak akses (USER / ADMIN)
              </p>
            </div>

            <button onClick={handleOpenAddUser} className="btn btn-primary">
              <Plus size={16} />
              <span>Tambah User Baru</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${u.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-user'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="btn btn-secondary btn-sm"
                          title="Edit User"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingUserId(u.id)}
                          className="btn btn-danger btn-sm"
                          title="Hapus User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Produk */}
      {isProductModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsProductModalOpen(false)}
          title={editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSavingProduct}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="btn btn-primary"
                disabled={isSavingProduct}
              >
                {isSavingProduct ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </>
          }
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Produk (Wajib)</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Contoh: Sepatu Running Adidas"
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga (Rp - Wajib)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="650000"
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stok (Wajib)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="15"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kategori (Wajib)</label>
              <input
                type="text"
                required
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="Contoh: Sepatu, Tas, Elektronik"
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Deskripsi (Opsional)</label>
              <textarea
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Deskripsi bahan, ukuran, spesifikasi..."
                className="form-control"
              />
            </div>

            {/* Multipart Form File Upload */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unggah Foto Produk (Multipart/Form-Data)</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                className="form-control"
              />
              {productImagePreview && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <img
                    src={productImagePreview}
                    alt="Preview"
                    style={{
                      maxHeight: '120px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Konfirmasi Hapus Produk */}
      {deletingProductId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingProductId(null)}
          title="Hapus Produk"
          footer={
            <>
              <button onClick={() => setDeletingProductId(null)} className="btn btn-secondary">
                Batal
              </button>
              <button onClick={handleDeleteProduct} className="btn btn-danger">
                Hapus Permanen
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Apakah Anda yakin ingin menghapus produk ini? Produk yang dihapus tidak akan muncul lagi di
            katalog toko pelanggan.
          </p>
        </Modal>
      )}

      {/* Modal: Ubah Status Order */}
      {editingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          title={`Ubah Status Order #${editingOrder.id}`}
          footer={
            <>
              <button
                onClick={() => setEditingOrder(null)}
                className="btn btn-secondary"
                disabled={isUpdatingOrder}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateOrderStatus}
                className="btn btn-primary"
                disabled={isUpdatingOrder}
              >
                {isUpdatingOrder ? 'Menyimpan...' : 'Perbarui Status'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Pilih status baru untuk pesanan ini. Jika diubah menjadi <strong>CANCELLED</strong>,
              sistem backend akan otomatis mengembalikan kuantitas stok produk.
            </p>

            <div className="form-group">
              <label className="form-label">Status Transaksi</label>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                className="form-control"
              >
                <option value="PENDING">PENDING (Menunggu)</option>
                <option value="PAID">PAID (Terbayar & Terverifikasi)</option>
                <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Tambah / Edit Pengguna */}
      {isUserModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsUserModalOpen(false)}
          title={editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="btn btn-secondary"
                disabled={isSavingUser}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                className="btn btn-primary"
                disabled={isSavingUser}
              >
                {isSavingUser ? 'Menyimpan...' : 'Simpan User'}
              </button>
            </>
          }
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Kata Sandi {editingUser ? '(Kosongkan jika tak diubah)' : '(Min. 6 Karakter)'}
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role Akses Akun</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'USER' | 'ADMIN' })}
                className="form-control"
              >
                <option value="USER">USER (Customer Biasa)</option>
                <option value="ADMIN">ADMIN (Super Administrator)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Konfirmasi Hapus User */}
      {deletingUserId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUserId(null)}
          title="Hapus Akun Pengguna"
          footer={
            <>
              <button onClick={() => setDeletingUserId(null)} className="btn btn-secondary">
                Batal
              </button>
              <button onClick={handleDeleteUser} className="btn btn-danger">
                Hapus Akun
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Apakah Anda yakin ingin menghapus akun pengguna #{deletingUserId}? Pengguna ini tidak akan
            dapat masuk lagi ke sistem.
          </p>
        </Modal>
      )}
    </div>
  );
}
