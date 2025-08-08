import React, { useState } from 'react';
import { Plus, TruckIcon } from 'lucide-react';
import { Product, Purchase } from '../types';
import { purchasesAPI } from '../services/api';

interface PurchasesProps {
  products: Product[];
  purchases: Purchase[];
  onPurchasesChange: (purchases: Purchase[]) => void;
  onProductsChange: (products: Product[]) => void;
}

const Purchases: React.FC<PurchasesProps> = ({ 
  products, 
  purchases, 
  onPurchasesChange, 
  onProductsChange 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    costPrice: '',
    supplierName: '',
    amountPaid: '',
    dueDate: '',
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      costPrice: '',
      supplierName: '',
      amountPaid: '',
      dueDate: '',
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

      const purchaseData = {
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice),
        supplierName: formData.supplierName,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        dueDate: formData.dueDate || undefined,
      };

      const response = await purchasesAPI.create(purchaseData);
      
      // Update local state
      onPurchasesChange([...purchases, response.data]);
      
      // Update product stock and cost price locally
      const updatedProducts = products.map(p =>
        p.id === product.id 
          ? { ...p, stock: p.stock + purchaseData.quantity, costPrice: purchaseData.costPrice }
          : p
      );
      onProductsChange(updatedProducts);
      
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error recording purchase');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Purchases</h2>
          <p className="text-slate-600">Track your inventory purchases and costs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Purchase
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Purchases</p>
              <p className="text-2xl font-bold text-slate-900">{purchases.length}</p>
            </div>
            <TruckIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <span className="text-white font-bold">$</span>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Record New Purchase</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Current stock: {product.stock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                Cost Price per Unit ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount Paid ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
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
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Recording...' : 'Record Purchase'}
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cost per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <TruckIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    No purchases recorded yet. Click "Record Purchase" to get started.
                  </td>
                </tr>
              ) : (
                [...purchases].reverse().map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{purchase.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {purchase.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                      ${purchase.costPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-purple-600 font-medium">
                        ${purchase.totalCost.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        purchase.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : purchase.paymentStatus === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.paymentStatus === 'paid' ? 'Paid' : 
                         purchase.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        Due: ${purchase.amountDue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(purchase.date).toLocaleDateString()}
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

export default Purchases;