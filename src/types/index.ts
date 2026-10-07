// AffanStore API Data Models & Enums based on API Specification PDF

export type Role = 'USER' | 'ADMIN';
export type PaymentMethod = 'CASH' | 'QRIS';
export type ShippingType = 'COD' | 'NON_COD';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    imageUrl?: string;
    category?: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingType: ShippingType;
  status: OrderStatus;
  orderItems: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateOrderDto {
  productId: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  shippingType: ShippingType;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}
