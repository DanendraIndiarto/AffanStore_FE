import api from './api';
import { CreateOrderDto, Order, OrderStatus } from '../types';

export const orderService = {
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: number | string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: number | string): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/cancel`);
    return response.data;
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders/admin/all');
    return response.data;
  },

  async updateOrderStatusAdmin(id: number | string, status: OrderStatus): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};
