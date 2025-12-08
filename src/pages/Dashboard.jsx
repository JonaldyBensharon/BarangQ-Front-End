import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Package, ShoppingBag, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, products: 0, sales: 0, lowStock: [] });
  const [store, setStore] = useState({});

  useEffect(() => {
    axios.get('http://127.0.0.1:5001/dashboard').then(res => setStats(res.data));
    axios.get('http://127.0.0.1:5001/user-info').then(res => setStore(res.data));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Profil Toko */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8 shadow-xl flex items-center">
        <img src={store.store_image || "https://via.placeholder.com/100"} className="w-24 h-24 rounded-full border-4 border-gray-600 mr-6 object-cover"/>
        <div>
            <h1 className="text-3xl font-bold">{store.store_name || "Toko Saya"}</h1>
            <p className="text-gray-300 mt-1 max-w-xl">{store.store_description || "Deskripsi toko belum diatur."}</p>
            <p className="flex items-center text-sm text-gray-400 mt-2">
                <MapPin size={16} className="mr-1"/> {store.address || "Alamat belum diatur"}
            </p>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
            <div><p className="text-gray-500">Pendapatan</p><h3 className="text-2xl font-bold">Rp {parseInt(stats.income).toLocaleString()}</h3></div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><DollarSign/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
            <div><p className="text-gray-500">Total Produk</p><h3 className="text-2xl font-bold">{stats.products}</h3></div>
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full"><Package/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
            <div><p className="text-gray-500">Terjual</p><h3 className="text-2xl font-bold">{stats.sales} x</h3></div>
            <div className="bg-green-100 text-green-600 p-3 rounded-full"><ShoppingBag/></div>
        </div>
      </div>

      {/* Stok Rendah */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4 text-red-600">Peringatan Stok Menipis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStock?.map(p => (
                <div key={p.id} className="border border-red-100 bg-red-50 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Sisa: {p.stock}</span>
                </div>
            ))}
            {stats.lowStock?.length === 0 && <p className="text-gray-400">Aman! Tidak ada stok yang menipis.</p>}
        </div>
      </div>
    </div>
  );
}