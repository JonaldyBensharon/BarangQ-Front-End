/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../components/api';
import { formatRupiah } from '../utils/formatter';

const ProductImage = ({ url, apiUrl }) => {
    const [error, setError] = useState(false);
    
    if (!url || error) {
        return (
            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                <Package size={20} />
            </div>
        );
    }

    const src = url.startsWith('http') ? url : `${apiUrl}${url}`;

    return (
        <img 
            src={src} 
            alt="Produk" 
            className="w-12 h-12 object-cover rounded border bg-white"
            onError={() => setError(true)}
        />
    );
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false); 
  
  const API_URL = 'https://barangq-back-end-production.up.railway.app';

  const [form, setForm] = useState({
    id: '', code: '', name: '', brand: '', description: '', image_url: '', buy_price: '', sell_price: '', stock: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
        const res = await api.get('/products');
        setProducts(res.data);
    } catch (err) {
        console.error("Gagal mengambil data produk", err);
    }
  };

  const openAddModal = () => {
    setForm({ id: '', code: '', name: '', brand: '', description: '', image_url: '', buy_price: '', sell_price: '', stock: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm(item);
    setIsEdit(true);
    setShowModal(true);
  };

  const handlePriceChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setForm({ ...form, [field]: rawValue });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (isEdit) {
            await api.put(`/products/${form.id}`, form);
            Swal.fire('Sukses', 'Data barang berhasil diperbarui', 'success');
        } else {
            await api.post(`products`, form);
            Swal.fire('Berhasil', 'Barang berhasil didaftarkan', 'success');
        }
        setShowModal(false);
        fetchProducts();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.response?.data?.error || 'Terjadi kesalahan'
        });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
        title: 'Konfirmasi Penghapusan', text: "Data yang telah dihapus tidak bisa dikembalikan!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
                Swal.fire('Terhapus!', 'Barang telah dihapus.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Gagal menghapus barang', 'error');
            }
        }
    })
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Barang</h2>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center border">
        <div className="w-2/3 flex items-center px-3 py-2 bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="text-gray-400 mr-2 shrink-0" size={20} />
            <input 
                type="text" 
                placeholder="Cari Nama Barang" 
                className="w-full outline-none bg-transparent border-none p-0 text-gray-700 placeholder-gray-400"
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-blue-700 transition">
            <Plus size={20} className="mr-2"/> Daftarkan Barang Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-600 text-sm font-bold tracking-wider">
                <tr>
                    <th className="p-4">Foto</th>
                    <th className="p-4">Kode/Nama</th>
                    <th className="p-4">Merk</th>
                    <th className='p-4 text-right'>Harga Beli</th>
                    <th className="p-4 text-right">Harga Jual</th>
                    <th className="p-4 text-center">Stok</th>
                    <th className="p-4 text-center">Edit</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                        <td className="p-4">
                            <ProductImage url={item.image_url} apiUrl={API_URL} />
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.code || '-'}</div>
                        </td>
                        <td className="p-4 text-gray-600">{item.brand || '-'}</td>
                        <td className="p-4 font-medium text-right">{formatRupiah(item.buy_price)}</td>
                        <td className="p-4 font-medium text-right">{formatRupiah(item.sell_price)}</td>
                        <td className={`p-4 font-bold text-center ${item.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>{item.stock}</td>
                        <td className="p-4 flex justify-center space-x-2">
                            <button onClick={() => openEditModal(item)} className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400">Tidak ada barang yang ditemukan.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><X/></button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Kode Barang</label>
                        <input type="text" placeholder="Contoh: BRG-001" className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Merk/Brand</label>
                        <input type="text" placeholder="Contoh: Cahaya" className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500">Nama Barang</label>
                        <input type="text" required placeholder="Contoh: Buku" className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500">Deskripsi</label>
                        <textarea placeholder="Keterangan singkat" className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" rows="2"
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Harga Beli</label>
                        <input 
                            type="text" 
                            required 
                            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.buy_price ? parseInt(form.buy_price).toLocaleString('id-ID') : ''} 
                            onChange={e => handlePriceChange(e, 'buy_price')} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Harga Jual</label>
                        <input 
                            type="text" 
                            required 
                            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.sell_price ? parseInt(form.sell_price).toLocaleString('id-ID') : ''} 
                            onChange={e => handlePriceChange(e, 'sell_price')} 
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Stok Awal</label>
                        <input type="number" required className="border p-2 rounded w-full bg-gray-50" disabled={isEdit}
                            value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">URL Gambar</label>
                        <input type="text" placeholder="https://..." className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                    </div>

                    <button className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4 transition shadow-lg">
                        {isEdit ? 'Simpan Perubahan' : 'Daftarkan Barang'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}