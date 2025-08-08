import React from 'react';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  TruckIcon
} from 'lucide-react';
import { Product, Sale, Purchase, DashboardMetrics } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, purchases }) => {
  const calculateMetrics = (): DashboardMetrics => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalCosts = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0) +
                      sales.reduce((sum, sale) => sum + sale.totalCost, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      totalProducts: products.length,
      lowStockProducts,
      totalSales: sales.length,
    };
  };

  const metrics = calculateMetrics();
  const profitMargin = metrics.totalRevenue > 0 ? (metrics.totalProfit / metrics.totalRevenue) * 100 : 0;

  const MetricCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-slate-500 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const recentSales = sales.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
          change={`${sales.length} total sales`}
        />
        <MetricCard
          title="Total Profit"
          value={`$${metrics.totalProfit.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-blue-500"
          change={`${profitMargin.toFixed(1)}% margin`}
        />
        <MetricCard
          title="Products"
          value={metrics.totalProducts.toString()}
          icon={Package}
          color="bg-purple-500"
          change={`${metrics.lowStockProducts} low stock`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      Stock: {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">
                      Min: {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">All products are well stocked!</p>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Sales</h3>
          </div>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{sale.productName}</p>
                    <p className="text-sm text-slate-600">
                      Qty: {sale.quantity} × ${sale.sellingPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +${sale.profit.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No sales recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;