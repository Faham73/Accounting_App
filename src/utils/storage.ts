import { Product, Sale, Purchase } from '../types';
import { Payment } from '../types';

const STORAGE_KEYS = {
  products: 'ecommerce_products',
  sales: 'ecommerce_sales',
  purchases: 'ecommerce_purchases',
  payments: 'ecommerce_payments',
};

export const storage = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.products);
    return data ? JSON.parse(data) : [];
  },

  setProducts: (products: Product[]): void => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  },

  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.sales);
    return data ? JSON.parse(data) : [];
  },

  setSales: (sales: Sale[]): void => {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
  },

  getPurchases: (): Purchase[] => {
    const data = localStorage.getItem(STORAGE_KEYS.purchases);
    return data ? JSON.parse(data) : [];
  },

  setPurchases: (purchases: Purchase[]): void => {
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));
  },

  getPayments: (): Payment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.payments);
    return data ? JSON.parse(data) : [];
  },

  setPayments: (payments: Payment[]): void => {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};