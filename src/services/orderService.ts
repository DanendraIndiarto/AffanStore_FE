import api from './api';
import { CreateOrderDto, Order, OrderStatus } from '../types';
import { getLocalProducts, saveLocalProducts } from './productService';

const LOCAL_ORDERS_KEY = 'affan_local_orders';

export const getLocalOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveLocalOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  }
};

export const orderService = {
  async createOrder(data: CreateOrderDto): Promise<Order> {
    try {
      const response = await api.post<Order>('/orders', data);
      return response.data;
    } catch (err: unknown) {
      // Fallback: process order locally with atomic stock deduction
      const localProducts = getLocalProducts();
      const product = localProducts.find((p) => p.id === data.productId);
      if (product) {
        if (product.stock < data.quantity) {
          throw new Error(`Stok produk tidak mencukupi (Sisa stok: ${product.stock})`);
        }

        // Atomic deduction
        product.stock -= data.quantity;
        saveLocalProducts(localProducts);

        const newOrder: Order = {
          id: Math.floor(1000 + Math.random() * 9000),
          userId: 1,
          user: {
            id: 1,
            name: 'Tester Pelanggan',
            email: 'tester@example.com',
          },
          totalAmount: product.price * data.quantity,
          paymentMethod: data.paymentMethod,
          shippingType: data.shippingType,
          status: 'PENDING',
          orderItems: [
            {
              productId: product.id,
              quantity: data.quantity,
              price: product.price,
              product: {
                name: product.name,
                category: product.category,
                imageUrl: product.imageUrl,
              },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const localOrders = getLocalOrders();
        localOrders.unshift(newOrder);
        saveLocalOrders(localOrders);
        return newOrder;
      }
      throw err;
    }
  },

  async getMyOrders(): Promise<Order[]> {
    let apiOrders: Order[] = [];
    try {
      const response = await api.get<Order[]>('/orders');
      apiOrders = response.data || [];
    } catch {
      apiOrders = [];
    }

    const localOrders = getLocalOrders();
    const combined = [...localOrders];
    apiOrders.forEach((o) => {
      if (!combined.some((lo) => lo.id === o.id)) {
        combined.push(o);
      }
    });

    return combined;
  },

  async getOrderById(id: number | string): Promise<Order> {
    const numId = Number(id);
    const local = getLocalOrders().find((o) => o.id === numId);
    if (local) return local;

    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (err) {
      if (local) return local;
      throw err;
    }
  },

  async cancelOrder(id: number | string): Promise<Order> {
    const numId = Number(id);
    const localOrders = getLocalOrders();
    const local = localOrders.find((o) => o.id === numId);

    if (local) {
      local.status = 'CANCELLED';
      // Restock atomically
      const localProducts = getLocalProducts();
      local.orderItems?.forEach((item) => {
        const p = localProducts.find((prod) => prod.id === item.productId);
        if (p) {
          p.stock += item.quantity;
        }
      });
      saveLocalProducts(localProducts);
      saveLocalOrders(localOrders);
    }

    try {
      const response = await api.patch<Order>(`/orders/${id}/cancel`);
      return response.data;
    } catch {
      if (local) return local;
      throw new Error('Gagal membatalkan pesanan');
    }
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    let apiOrders: Order[] = [];
    try {
      const response = await api.get<Order[]>('/orders/admin/all');
      apiOrders = response.data || [];
    } catch {
      apiOrders = [];
    }

    const localOrders = getLocalOrders();
    const combined = [...localOrders];
    apiOrders.forEach((o) => {
      if (!combined.some((lo) => lo.id === o.id)) {
        combined.push(o);
      }
    });

    return combined;
  },

  async updateOrderStatusAdmin(id: number | string, status: OrderStatus): Promise<Order> {
    const numId = Number(id);
    const localOrders = getLocalOrders();
    const local = localOrders.find((o) => o.id === numId);

    if (local) {
      const prevStatus = local.status;
      local.status = status;

      // If changed to CANCELLED from non-cancelled, restock
      if (status === 'CANCELLED' && prevStatus !== 'CANCELLED') {
        const localProducts = getLocalProducts();
        local.orderItems?.forEach((item) => {
          const p = localProducts.find((prod) => prod.id === item.productId);
          if (p) {
            p.stock += item.quantity;
          }
        });
        saveLocalProducts(localProducts);
      }

      saveLocalOrders(localOrders);
    }

    try {
      const response = await api.patch<Order>(`/orders/${id}/status`, { status });
      return response.data;
    } catch {
      if (local) return local;
      throw new Error('Gagal mengubah status pesanan');
    }
  },
};

