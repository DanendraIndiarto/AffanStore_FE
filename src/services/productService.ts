import api from './api';
import { Product } from '../types';

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  async getProductById(id: number | string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(formData: FormData): Promise<Product> {
    const response = await api.post<Product>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProduct(id: number | string, formData: FormData): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProduct(id: number | string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
