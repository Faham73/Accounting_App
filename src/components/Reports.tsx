import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { Product, Sale, Purchase } from '../types';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}

const Reports: React.FC<ReportsProps> = ({ products, sales, purchases }) => {
  const calculateProfitLoss = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalCogs = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalPurchases + totalCogs; // Adjust for actual COGS vs purchases
    
    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      totalPurchases,
      netProfit,
      grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    };
  };

  const getTopProducts = () => {
    const productSales = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          productName: sale.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      acc[sale.productId].quantity += sale.quantity;
      acc[sale.productId].revenue += sale.totalRevenue;
      acc[sale.productId].profit += sale.profit;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getInventoryValue = () => {
    return products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);
  };

  const getRecentTransactions = () => {
    const allTransactions = [
      ...sales.map(sale => ({
        id: sale.id,
        type: 'Sale',
        description: `Sale of ${sale.quantity}x ${sale.productName}`,
        amount: sale.totalRevenue,
        date: sale.date,
        isPositive: true,
      })),
      ...purchases.map(purchase => ({
        id: purchase.id,
        type: 'Purchase',
        description: `Purchase of ${purchase.quantity}x ${purchase.productName}`,
        amount: purchase.totalCost,
        date: purchase.date,
        isPositive: false,
      })),
    ];

    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const profitLoss = calculateProfitLoss();
  const topProducts = getTopProducts();
  const inventoryValue = getInventoryValue();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
        <p className="text-slate-600">Comprehensive business performance insights</p>
      </div>

      {/* Profit & Loss Overview */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Profit & Loss Statement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">${profitLoss.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600">Cost of Goods Sold</p>
            <p className="text-xl font-bold text-orange-600">${profitLoss.totalCogs.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600">Gross Profit</p>
            <p className="text-xl font-bold text-blue-600">${profitLoss.grossProfit.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600">Gross Margin</p>
            <p className="text-xl font-bold text-slate-600">{profitLoss.grossMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Selling Products
          </h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-slate-900">{product.productName}</p>
                      <p className="text-sm text-slate-600">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">profit: ${product.profit.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Inventory Summary
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-slate-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-blue-600">${inventoryValue.toFixed(2)}</p>
              <p className="text-sm text-slate-500">{products.length} products in stock</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Stock Status</h4>
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{product.name}</span>
                  <span className={`font-medium ${
                    product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {product.stock} units
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'Sale' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{transaction.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${
                        transaction.isPositive ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No transactions recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;