import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../components/config';

const API_BASE = API_URL;

export default function Settings() {
  const [form, setForm] = useState({
    id: '', username: '', password: '', store_name: '', store_description: '', address: '', store_image: ''
  });

  useEffect(() => {
    axios.get(`${API_BASE}/users/info`).then(res => setForm(res.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.put(`${API_BASE}/settings`, form);
        localStorage.setItem('user', JSON.stringify(res.data));
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pengaturan toko berhasil diperbarui',
            confirmButtonColor: '#2563EB'
        });
    } catch(err) { 
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem' });
    }
  };

  return (
    <div className="animate-fade-in pb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Toko</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Kartu Preview */}
            <div className="w-full lg:w-1/3">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                    <img src={form.store_image || "https://via.placeholder.com/150"} alt="Toko" 
                         className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-100"/>
                    <h3 className="font-bold text-xl">{form.store_name}</h3>
                    <p className="text-gray-500 text-sm mt-2">{form.address}</p>
                </div>
            </div>

            {/* Form Edit */}
            <div className="w-full lg:w-2/3 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Username</label>
                            <input type="text" value={form.username} className="w-full border p-3 rounded-lg bg-gray-50"
                            onChange={e => setForm({...form, username: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Kata Sandi</label>
                            <input type="text" value={form.password} className="w-full border p-3 rounded-lg bg-gray-50"
                            onChange={e => setForm({...form, password: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Nama Usaha / Toko</label>
                        <input type="text" value={form.store_name} className="w-full border p-3 rounded-lg"
                        onChange={e => setForm({...form, store_name: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">URL Foto Toko</label>
                        <input type="text" value={form.store_image} placeholder="https://..." className="w-full border p-3 rounded-lg"
                        onChange={e => setForm({...form, store_image: e.target.value})} />
                        <p className="text-xs text-gray-400 mt-1">*Masukkan link gambar (Direct Link)</p>
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Deskripsi Toko</label>
                        <textarea rows="2" value={form.store_description} className="w-full border p-3 rounded-lg"
                        onChange={e => setForm({...form, store_description: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Alamat Lengkap</label>
                        <textarea rows="2" value={form.address} className="w-full border p-3 rounded-lg"
                        onChange={e => setForm({...form, address: e.target.value})}></textarea>
                    </div>

                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4">
                        SIMPAN PERUBAHAN
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}