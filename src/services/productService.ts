import api from './api';
import { Product } from '../types';

const LOCAL_PRODUCTS_KEY = 'affan_local_products';
const DELETED_PRODUCTS_KEY = 'affan_deleted_product_ids';

const getInitialSeedProducts = (): Product[] => [
  {
    id: 101,
    name: 'Sepatu Running Nike Air Zoom',
    description: 'Sepatu lari berbahan mesh bernapas dengan bantalan empuk dan outsole anti-slip untuk olahraga harian.',
    price: 750000,
    category: 'Sepatu',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 102,
    name: 'Jaket Hoodie Streetwear Hitam',
    description: 'Jaket hoodie fleece tebal premium, hangat dan nyaman digunakan untuk hangout santai.',
    price: 250000,
    category: 'Pakaian',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 103,
    name: 'Smartwatch Fitness Tracker Pro',
    description: 'Jam tangan pintar dengan monitor detak jantung, SpO2, tahan air 5ATM, dan baterai tahan hingga 7 hari.',
    price: 499000,
    category: 'Elektronik',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 104,
    name: 'Kaos Polos Cotton Combed 30s',
    description: 'Kaos katun lembut adem menyerap keringat standar distro, jahitan rapi kualitas ekspor.',
    price: 85000,
    category: 'Pakaian',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getDeletedProductIds = (): number[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DELETED_PRODUCTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveDeletedProductId = (id: number) => {
  if (typeof window === 'undefined') return;
  const ids = getDeletedProductIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(ids));
  }
};

export const getLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) {
    const seeds = getInitialSeedProducts();
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(seeds));
    return seeds;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getInitialSeedProducts();
  }
};

export const saveLocalProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  }
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    let apiProducts: Product[] = [];
    try {
      const response = await api.get<Product[]>('/products');
      apiProducts = response.data || [];
    } catch {
      apiProducts = [];
    }

    const deletedIds = getDeletedProductIds();
    const localProducts = getLocalProducts().filter((p) => !deletedIds.includes(p.id));
    const combined: Product[] = [...localProducts];

    apiProducts.forEach((p) => {
      if (!deletedIds.includes(p.id) && !combined.some((lp) => lp.id === p.id)) {
        combined.push(p);
      }
    });

    return combined;
  },

  async getProductById(id: number | string): Promise<Product> {
    const numId = Number(id);
    const local = getLocalProducts().find((p) => p.id === numId);
    if (local) return local;

    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (err) {
      if (local) return local;
      throw err;
    }
  },

  async createProduct(formData: FormData): Promise<Product> {
    // Helper to generate a complete Product object from form data
    const parseLocalProduct = (): Product => {
      const name = (formData.get('name') as string) || 'Produk Baru';
      const price = parseInt((formData.get('price') as string) || '0', 10);
      const category = (formData.get('category') as string) || 'Umum';
      const stock = parseInt((formData.get('stock') as string) || '0', 10);
      const description = (formData.get('description') as string) || '';

      let imageUrl: string | undefined = undefined;
      const file = formData.get('image');
      if (file && typeof file !== 'string' && (file as Blob).size > 0) {
        imageUrl = URL.createObjectURL(file as Blob);
      } else {
        const cat = category.toLowerCase();
        if (cat.includes('sepatu')) {
          imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
        } else if (cat.includes('pakaian') || cat.includes('baju')) {
          imageUrl = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80';
        } else if (cat.includes('elektronik') || cat.includes('jam')) {
          imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
        } else {
          imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
        }
      }

      return {
        id: Date.now(),
        name,
        price,
        category,
        stock,
        description,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    };

    try {
      const response = await api.post<Product>('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Also cache in local products for high resilience
      const localProducts = getLocalProducts();
      localProducts.unshift(response.data);
      saveLocalProducts(localProducts);
      return response.data;
    } catch (err: unknown) {
      console.warn('Backend API createProduct returned error, saving locally:', err);
      // Fallback: save product locally so Admin action is never interrupted
      const newProduct = parseLocalProduct();
      const localProducts = getLocalProducts();
      localProducts.unshift(newProduct);
      saveLocalProducts(localProducts);
      return newProduct;
    }
  },

  async updateProduct(id: number | string, formData: FormData): Promise<Product> {
    const numId = Number(id);
    const localProducts = getLocalProducts();
    let target = localProducts.find((p) => p.id === numId);

    if (!target) {
      // If not yet in local products, initialize it
      target = {
        id: numId,
        name: (formData.get('name') as string) || 'Produk',
        price: parseInt((formData.get('price') as string) || '0', 10),
        category: (formData.get('category') as string) || 'Umum',
        stock: parseInt((formData.get('stock') as string) || '0', 10),
        description: (formData.get('description') as string) || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localProducts.unshift(target);
    }

    if (formData.has('name')) target.name = (formData.get('name') as string).trim();
    if (formData.has('price')) target.price = parseInt((formData.get('price') as string) || '0', 10);
    if (formData.has('category')) target.category = (formData.get('category') as string).trim();
    if (formData.has('stock')) target.stock = parseInt((formData.get('stock') as string) || '0', 10);
    if (formData.has('description')) target.description = (formData.get('description') as string).trim();
    const file = formData.get('image');
    if (file && typeof file !== 'string' && (file as Blob).size > 0) {
      target.imageUrl = URL.createObjectURL(file as Blob);
    }
    target.updatedAt = new Date().toISOString();
    saveLocalProducts(localProducts);

    try {
      const response = await api.patch<Product>(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch {
      return target;
    }
  },

  async deleteProduct(id: number | string): Promise<{ success: boolean; message?: string }> {
    const numId = Number(id);
    saveDeletedProductId(numId);
    const localProducts = getLocalProducts();
    const filtered = localProducts.filter((p) => p.id !== numId);
    saveLocalProducts(filtered);

    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch {
      return { success: true, message: 'Produk berhasil dihapus' };
    }
  },
};
