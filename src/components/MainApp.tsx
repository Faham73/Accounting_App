import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import Products from './Products';
import Sales from './Sales';
import Purchases from './Purchases';
import Reports from './Reports';
import Liabilities from './Liabilities';
import { Product, Sale, Purchase, Payment } from '../types';
import { productsAPI, salesAPI, purchasesAPI, paymentsAPI } from '../services/api';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, salesRes, purchasesRes, paymentsRes] = await Promise.all([
          productsAPI.getAll(),
          salesAPI.getAll(),
          purchasesAPI.getAll(),
          paymentsAPI.getAll(),
        ]);

        setProducts(productsRes.data);
        setSales(salesRes.data);
        setPurchases(purchasesRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductsChange = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const handleSalesChange = (newSales: Sale[]) => {
    setSales(newSales);
  };

  const handlePurchasesChange = (newPurchases: Purchase[]) => {
    setPurchases(newPurchases);
  };

  const handlePaymentsChange = (newPayments: Payment[]) => {
    setPayments(newPayments);
  };

  const renderActiveComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard products={products} sales={sales} purchases={purchases} />;
      case 'products':
        return <Products products={products} onProductsChange={handleProductsChange} />;
      case 'sales':
        return (
          <Sales 
            products={products} 
            sales={sales} 
            onSalesChange={handleSalesChange}
            onProductsChange={handleProductsChange}
          />
        );
      case 'purchases':
        return (
          <Purchases 
            products={products} 
            purchases={purchases} 
            onPurchasesChange={handlePurchasesChange}
            onProductsChange={handleProductsChange}
          />
        );
      case 'liabilities':
        return (
          <Liabilities 
            purchases={purchases} 
            payments={payments}
            onPurchasesChange={handlePurchasesChange}
            onPaymentsChange={handlePaymentsChange}
          />
        );
      case 'reports':
        return <Reports products={products} sales={sales} purchases={purchases} />;
      default:
        return <Dashboard products={products} sales={sales} purchases={purchases} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default MainApp;