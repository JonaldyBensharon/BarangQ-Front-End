import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false); 
  
  // State Form
  const [form, setForm] = useState({
    id: '', code: '', name: '', brand: '', description: '', image_url: '', buy_price: '', sell_price: '', stock: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://127.0.0.1:5001/products');
    setProducts(res.data);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (isEdit) {
            await axios.put(`http://127.0.0.1:5001/products/${form.id}`, form);
            Swal.fire('Sukses', 'Data barang berhasil diperbarui', 'success');
        } else {
            await axios.post('http://127.0.0.1:5001/products', form);
            Swal.fire('Berhasil', 'Barang berhasil ditambahkan', 'success');
        }
        setShowModal(false);
        fetchProducts();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.response?.data || 'Terjadi kesalahan'
        });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
        title: 'Yakin hapus?', text: "Data tidak bisa dikembalikan!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await axios.delete(`http://127.0.0.1:5001/products/${id}`);
            fetchProducts();
            Swal.fire('Terhapus!', 'Barang telah dihapus.', 'success');
        }
    })
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Barang</h2>

      {/* Kontrol Atas */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center border">
        <div className="relative w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input type="text" placeholder="Cari Nama Barang..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-blue-700 transition">
            <Plus size={20} className="mr-2"/> Tambah Barang Baru
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4">Foto</th>
                    <th className="p-4">Kode/Nama</th>
                    <th className="p-4">Merk</th>
                    <th className="p-4">Harga Jual</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50">
                        <td className="p-4">
                            <img src={item.image_url || "https://via.placeholder.com/50"} alt="" className="w-12 h-12 object-cover rounded bg-gray-200"/>
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-gray-800">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.code}</div>
                        </td>
                        <td className="p-4 text-gray-600">{item.brand || '-'}</td>
                        <td className="p-4 font-medium">Rp {parseInt(item.sell_price).toLocaleString()}</td>
                        <td className={`p-4 font-bold ${item.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>{item.stock}</td>
                        <td className="p-4 flex justify-center space-x-2">
                            <button onClick={() => openEditModal(item)} className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold">{isEdit ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><X/></button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Kode Barang (Opsional)" className="border p-2 rounded" 
                        value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                    <input type="text" placeholder="Merk (Opsional)" className="border p-2 rounded" 
                        value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                    <input type="text" required placeholder="Nama Barang" className="border p-2 rounded col-span-2" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <textarea placeholder="Deskripsi" className="border p-2 rounded col-span-2" rows="2"
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    
                    <input type="number" required placeholder="Harga Modal" className="border p-2 rounded" 
                        value={form.buy_price} onChange={e => setForm({...form, buy_price: e.target.value})} />
                    <input type="number" required placeholder="Harga Jual" className="border p-2 rounded" 
                        value={form.sell_price} onChange={e => setForm({...form, sell_price: e.target.value})} />
                    
                    <input type="number" required placeholder="Stok Awal" className="border p-2 rounded" disabled={isEdit}
                        value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                    <input type="text" placeholder="URL Gambar (Opsional)" className="border p-2 rounded" 
                        value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />

                    <button className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2">
                        {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH BARANG'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}