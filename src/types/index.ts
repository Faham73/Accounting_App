export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  category: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  date: string;
  customerName?: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
  supplierName: string;
  date: string;
  amountPaid: number;
  amountDue: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  dueDate?: string;
}

export interface Payment {
  id: string;
  purchaseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
}