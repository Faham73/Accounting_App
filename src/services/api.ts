import axios from 'axios';
import { Product, Sale, Purchase, Payment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: () => api.get<Product[]>('/products'),
  create: (product: Omit<Product, 'id' | 'createdAt'>) => api.post<Product>('/products', product),
  update: (id: string, product: Omit<Product, 'id' | 'createdAt'>) => 
    api.put<Product>(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get<Sale[]>('/sales'),
  create: (sale: { productId: string; quantity: number; customerName?: string }) => 
    api.post<Sale>('/sales', sale),
};

// Purchases API
export const purchasesAPI = {
  getAll: () => api.get<Purchase[]>('/purchases'),
  create: (purchase: {
    productId: string;
    quantity: number;
    costPrice: number;
    supplierName: string;
    amountPaid?: number;
    dueDate?: string;
  }) => api.post<Purchase>('/purchases', purchase),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get<Payment[]>('/payments'),
  create: (payment: {
    purchaseId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => api.post<Payment>('/payments', payment),
};

export default api;