import { useState } from 'react';
import Swal from 'sweetalert2';
import logo from '../assets/logo.png'; 
import { API_URL } from '../components/config';

const API_BASE_USER = `${API_URL}/users`;

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', store_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'register' : 'login';
    
    try {
        const res = await fetch(`${API_BASE_USER}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json(); // Sekarang aman karena server pasti kirim JSON

        if (res.ok) {
            if (isRegister) {
                Swal.fire('Sukses', 'Akun berhasil dibuat! Silakan Login.', 'success');
                setIsRegister(false);
            } else {
                onLogin(data);
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: `Selamat datang, ${data.store_name || 'Admin'}!`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } else {
            // Tampilkan pesan error asli dari server
            Swal.fire('Gagal', data, 'error');
        }
    } catch (error) { 
        console.error(error);
        Swal.fire('Error Koneksi', 'Pastikan Server Backend (Port 5001) menyala!', 'error'); 
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center animate-fade-in">
        <img src={logo} alt="Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-blue-600 mb-2">{isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left mt-6">
            {isRegister && (
                <div>
                    <label className="text-sm font-medium">Nama Toko</label>
                    <input type="text" required placeholder="Contoh: Toko Berkah"
                        className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setFormData({...formData, store_name: e.target.value})} />
                </div>
            )}
            <div>
                <label className="text-sm font-medium">Username</label>
                <input type="text" required 
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
                <label className="text-sm font-medium">Kata Sandi</label>
                <input type="password" required 
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                {isRegister ? 'DAFTAR SEKARANG' : 'MASUK'}
            </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
            <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 font-bold hover:underline">
                {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
        </div>
      </div>
    </div>
  );
}