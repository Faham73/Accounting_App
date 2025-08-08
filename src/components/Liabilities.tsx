import React, { useState } from 'react';
import { CreditCard, DollarSign, AlertCircle, Plus, Check } from 'lucide-react';
import { Purchase, Payment } from '../types';
import { paymentsAPI } from '../services/api';

interface LiabilitiesProps {
  purchases: Purchase[];
  payments: Payment[];
  onPurchasesChange: (purchases: Purchase[]) => void;
  onPaymentsChange: (payments: Payment[]) => void;
}

const Liabilities: React.FC<LiabilitiesProps> = ({ 
  purchases, 
  payments, 
  onPurchasesChange, 
  onPaymentsChange 
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    notes: '',
  });

  const resetPaymentForm = () => {
    setPaymentData({
      amount: '',
      paymentMethod: '',
      notes: '',
    });
    setSelectedPurchase(null);
    setShowPaymentForm(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!selectedPurchase) return;

      const paymentAmount = parseFloat(paymentData.amount);
      if (paymentAmount <= 0 || paymentAmount > selectedPurchase.amountDue) {
        alert('Invalid payment amount');
        return;
      }

      const paymentRequest = {
        purchaseId: selectedPurchase.id,
        amount: paymentAmount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes || undefined,
      };

      const response = await paymentsAPI.create(paymentRequest);
      
      // Update local state
      onPaymentsChange([...payments, response.data]);
      
      // Update purchase payment status locally
      const updatedAmountPaid = selectedPurchase.amountPaid + paymentAmount;
      const updatedAmountDue = selectedPurchase.totalCost - updatedAmountPaid;
      
      let newPaymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (updatedAmountDue <= 0) {
        newPaymentStatus = 'paid';
      } else if (updatedAmountPaid > 0) {
        newPaymentStatus = 'partial';
      }

      const updatedPurchases = purchases.map(p =>
        p.id === selectedPurchase.id
          ? {
              ...p,
              amountPaid: updatedAmountPaid,
              amountDue: Math.max(0, updatedAmountDue),
              paymentStatus: newPaymentStatus,
            }
          : p
      );
      onPurchasesChange(updatedPurchases);
      
      resetPaymentForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentForm = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setPaymentData({
      amount: purchase.amountDue.toString(),
      paymentMethod: '',
      notes: '',
    });
    setShowPaymentForm(true);
  };

  const calculateTotals = () => {
    const totalLiabilities = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const totalPaid = purchases.reduce((sum, purchase) => sum + purchase.amountPaid, 0);
    const totalDue = purchases.reduce((sum, purchase) => sum + purchase.amountDue, 0);
    const overduePurchases = purchases.filter(p => 
      p.dueDate && new Date(p.dueDate) < new Date() && p.amountDue > 0
    );

    return {
      totalLiabilities,
      totalPaid,
      totalDue,
      overdueCount: overduePurchases.length,
      overdueAmount: overduePurchases.reduce((sum, p) => sum + p.amountDue, 0),
    };
  };

  const totals = calculateTotals();
  const unpaidPurchases = purchases.filter(p => p.amountDue > 0);
  const recentPayments = payments.slice(-5).reverse();

  const getSupplierSummary = () => {
    const supplierData = purchases.reduce((acc, purchase) => {
      if (!acc[purchase.supplierName]) {
        acc[purchase.supplierName] = {
          totalOwed: 0,
          totalPaid: 0,
          totalDue: 0,
          purchaseCount: 0,
        };
      }
      acc[purchase.supplierName].totalOwed += purchase.totalCost;
      acc[purchase.supplierName].totalPaid += purchase.amountPaid;
      acc[purchase.supplierName].totalDue += purchase.amountDue;
      acc[purchase.supplierName].purchaseCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(supplierData).map(([supplier, data]) => ({
      supplier,
      ...data,
    }));
  };

  const supplierSummary = getSupplierSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Liabilities</h2>
          <p className="text-slate-600">Track what you owe to suppliers and manage payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Liabilities</p>
              <p className="text-2xl font-bold text-slate-900">${totals.totalLiabilities.toFixed(2)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-slate-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totals.totalPaid.toFixed(2)}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Amount Due</p>
              <p className="text-2xl font-bold text-red-600">${totals.totalDue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">${totals.overdueAmount.toFixed(2)}</p>
              <p className="text-sm text-slate-500">{totals.overdueCount} items</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {showPaymentForm && selectedPurchase && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Record Payment for {selectedPurchase.productName}
          </h3>
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Supplier: <span className="font-medium">{selectedPurchase.supplierName}</span>
            </p>
            <p className="text-sm text-slate-600">
              Total Cost: <span className="font-medium">${selectedPurchase.totalCost.toFixed(2)}</span>
            </p>
            <p className="text-sm text-slate-600">
              Already Paid: <span className="font-medium text-green-600">${selectedPurchase.amountPaid.toFixed(2)}</span>
            </p>
            <p className="text-sm text-slate-600">
              Amount Due: <span className="font-medium text-red-600">${selectedPurchase.amountDue.toFixed(2)}</span>
            </p>
          </div>
          <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedPurchase.amountDue}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Payment reference, etc."
              />
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetPaymentForm}
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
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Liabilities */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Outstanding Liabilities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Amount Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {unpaidPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      <Check className="h-12 w-12 mx-auto mb-2 text-green-300" />
                      All liabilities are paid!
                    </td>
                  </tr>
                ) : (
                  unpaidPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{purchase.productName}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(purchase.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{purchase.supplierName}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-red-600">${purchase.amountDue.toFixed(2)}</div>
                        <div className="text-sm text-slate-500">
                          of ${purchase.totalCost.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openPaymentForm(purchase)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Plus className="h-3 w-3" />
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Summary */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Supplier Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {supplierSummary.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No supplier data available</p>
              ) : (
                supplierSummary.map((supplier) => (
                  <div key={supplier.supplier} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{supplier.supplier}</h4>
                      <span className="text-sm text-slate-500">{supplier.purchaseCount} purchases</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Total Owed</p>
                        <p className="font-medium">${supplier.totalOwed.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Paid</p>
                        <p className="font-medium text-green-600">${supplier.totalPaid.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Due</p>
                        <p className="font-medium text-red-600">${supplier.totalDue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Purchase
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentPayments.map((payment) => {
                  const purchase = purchases.find(p => p.id === payment.purchaseId);
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {purchase?.productName || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {purchase?.supplierName || 'Unknown Supplier'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-green-600">
                          ${payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liabilities;