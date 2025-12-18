import { useState } from 'react';
import Swal from 'sweetalert2';
import { Archive, Search } from 'lucide-react';
import api from '../components/api'

export default function AddStock() {
  const [input, setInput] = useState('');
  const [qty, setQty] = useState('');

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/stocks/add-stock', {
            search_term: input,
            qty: Number(qty)
        });
        
        Swal.fire({
            icon: 'success',
            title: 'Stok Berhasil Ditambah!',
            text: `Stok sekarang: ${res.data.new_stock}`,
            confirmButtonColor: '#2563EB'
        });
        setInput('');
        setQty('');
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.response?.data || 'Barang tidak ditemukan'
        });
    }
  };

  return (
    <div className="flex justify-center pt-10 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-[500px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <Archive className="mr-2 text-blue-600"/> Tambah Stok Barang
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Masukkan Nama atau Kode barang yang sudah terdaftar.</p>

            <form onSubmit={handleAddStock} className="space-y-4">
                <div>
        <label className="block font-medium mb-1">Cari Barang</label>
        <div className="flex items-center border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white overflow-hidden">
            <Search className="text-gray-400 mr-3 shrink-0" size={20} />
            <input 
                type="text" required placeholder="Masukkan Nama atau Kode Barang" 
                className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 border-none p-0"
                value={input} 
                onChange={e => setInput(e.target.value)} 
            />
        </div>
    </div>

                <div>
                    <label className="block font-medium mb-1">Jumlah Penambahan</label>
                    <input type="number" required min="1" placeholder="0" 
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                        value={qty} onChange={e => setQty(e.target.value)} />
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                    Proses Penambahan Stok
                </button>
            </form>
        </div>
    </div>
  );
}