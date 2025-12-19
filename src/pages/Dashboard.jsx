/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingBag, MapPin } from 'lucide-react';
import api from '../components/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, products: 0, sales: 0, lowStock: [] });
  const [store, setStore] = useState({});
  
  const API_URL = 'https://barangq-back-end-production.up.railway.app';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const resStats = await api.get('/dashboard');
        setStats(resStats.data);

        const resStore = await api.get('/settings');
        setStore(resStore.data);
        
    } catch (err) {
        console.error("Gagal memuat dashboard:", err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Profil Toko */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8 shadow-xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
        <img 
            src={
                store.store_image 
                    ? (store.store_image.startsWith('/uploads') ? `${API_URL}${store.store_image}` : store.store_image)
                    : "https://ui-avatars.com/api/?name=Error&background=red"
            } 
            alt="Logo Toko"
            className="w-24 h-24 rounded-full border-4 border-gray-600 mb-4 md:mb-0 md:mr-6 object-cover bg-white"
            onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=Error&background=red"}}
        />
        <div>
            <h1 className="text-3xl font-bold">{store.store_name || "Nama Toko Belum Diatur"}</h1>
            <p className="text-gray-300 mt-1 max-w-xl text-sm md:text-base">
                {store.store_description || "Silakan atur deskripsi toko Anda di menu Pengaturan."}
            </p>
            <p className="flex items-center justify-center md:justify-start text-sm text-gray-400 mt-3 bg-gray-700/50 py-1 px-3 rounded-lg w-fit mx-auto md:mx-0">
                <MapPin size={16} className="mr-2"/> 
                {store.address || "Alamat belum diatur"}
            </p>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Pendapatan</p>
                <h3 className="text-2xl font-bold text-gray-800">
                    Rp {parseInt(stats.income || 0).toLocaleString('id-ID')}
                </h3>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full shadow-sm"><DollarSign size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Jumlah Produk</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.products || 0}</h3>
            </div>
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full shadow-sm"><Package size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Transaksi</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.sales || 0} x</h3>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-full shadow-sm"><ShoppingBag size={24}/></div>
        </div>
      </div>

      {/* Stok Rendah */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4 text-gray-600 flex items-center">
            Barang dengan Stok Sedikit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStock && stats.lowStock.length > 0 ? (
                stats.lowStock.map(p => (
                    <div key={p.id} className="border border-red-100 bg-red-50 p-4 rounded-xl flex items-center justify-between hover:bg-red-100 transition">
                        <span className="font-medium text-gray-700 truncate mr-2">{p.name}</span>
                        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                            Sisa: {p.stock}
                        </span>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>Stok barang masih mencukup. Tidak ada barang dengan stok yang menipis.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}