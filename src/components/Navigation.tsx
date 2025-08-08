import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TruckIcon, 
  FileText,
  Store,
  CreditCard,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: TruckIcon },
    { id: 'liabilities', label: 'Liabilities', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };
  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <Store className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold">Business Manager</h1>
      </div>
      
      {/* User Info */}
      <div className="mb-6 p-3 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-300">Welcome back</span>
        </div>
        <p className="text-white font-medium truncate">{user?.name}</p>
        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;