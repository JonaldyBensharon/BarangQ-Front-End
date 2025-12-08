import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Settings, Archive } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  
  const menus = [
    { name: 'Beranda', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Daftar Barang', path: '/products', icon: <Package size={20}/> },
    { name: 'Tambah Stok', path: '/add-stock', icon: <Archive size={20}/> }, 
    { name: 'Kasir', path: '/sales', icon: <ShoppingCart size={20}/> },
    { name: 'Laporan', path: '/report', icon: <TrendingUp size={20}/> },
    { name: 'Pengaturan', path: '/settings', icon: <Settings size={20}/> },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white shadow-xl z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} overflow-hidden border-r`}>
      <div className="h-20 flex items-center justify-center border-b bg-white">
        <img src={logo} alt="Logo" className={`transition-all ${isOpen ? 'w-32' : 'w-10'}`} />
      </div>

      <div className="mt-4 flex flex-col space-y-2 px-2">
        {menus.map((menu) => (
          <Link 
            key={menu.name} to={menu.path}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              location.pathname === menu.path 
              ? 'bg-blue-600 text-white font-bold shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="min-w-[40px] flex justify-center">{menu.icon}</div>
            <span className={`whitespace-nowrap transition-opacity duration-300 ${!isOpen && 'opacity-0 hidden'}`}>{menu.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}