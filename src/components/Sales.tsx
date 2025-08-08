import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Product, Sale } from '../types';
import { salesAPI } from '../services/api';

interface SalesProps {
  products: Product[];
  sales: Sale[];
  onSalesChange: (sales: Sale[]) => void;
  onProductsChange: (products: Product[]) => void;
}

const Sales: React.FC<SalesProps> = ({ products, sales, onSalesChange, onProductsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    customerName: '',
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      customerName: '',
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const product = products.find(p => p.id === formData.productId);
      if (!product) {
        alert('Product not found');
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (quantity > product.stock) {
        alert('Insufficient stock');
        return;
      }

      const saleData = {
        productId: formData.productId,
        quantity,
        customerName: formData.customerName || undefined,
      };

      const response = await salesAPI.create(saleData);
      
      // Update local state
      onSalesChange([...sales, response.data]);
      
      // Update product stock locally
      const updatedProducts = products.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - quantity } : p
      );
      onProductsChange(updatedProducts);
      
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error recording sale');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales</h2>
          <p className="text-slate-600">Record and track your sales transactions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Sale
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <span className="text-white font-bold">$</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Profit</p>
              <p className="text-2xl font-bold text-blue-600">${totalProfit.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <span className="text-white font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Record New Sale</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a product</option>
                {products
                  .filter(p => p.stock > 0)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.sellingPrice} (Stock: {product.stock})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Recording...' : 'Record Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    No sales recorded yet. Click "Record Sale" to get started.
                  </td>
                </tr>
              ) : (
                [...sales].reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{sale.productName}</div>
                      <div className="text-sm text-slate-500">${sale.sellingPrice}/unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {sale.customerName || 'Walk-in'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-600 font-medium">
                        ${sale.totalRevenue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 font-medium">
                        ${sale.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;