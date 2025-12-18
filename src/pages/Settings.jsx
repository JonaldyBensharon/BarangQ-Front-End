/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
 
import { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';     
import Swal from 'sweetalert2';
import api from '../components/api';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); 
  
  const API_URL = 'http://localhost:5001';

  const [selectedFile, setSelectedFile] = useState(null); 
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  const [form, setForm] = useState({
    username: '', 
    store_name: '', 
    store_description: '', 
    address: '', 
    store_image: '' 
  });

  const [passForm, setPassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinData, setPinData] = useState({ pin: '', newPass: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/settings'); 
      
      setForm(prev => ({
          ...prev,
          username: res.data.username || '',
          store_name: res.data.store_name || '',
          store_description: res.data.store_description || '',
          address: res.data.address || '',
          store_image: res.data.store_image || ''
      }));
      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data:", err);
      if (err.response && err.response.status === 401) {
          navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsImageDeleted(false); 
      const previewUrl = URL.createObjectURL(file);
      setForm({ ...form, store_image: previewUrl });
    }
  };

  const handleDeleteImage = () => {
    setForm({ ...form, store_image: '' });
    setSelectedFile(null);
    setIsImageDeleted(true); 
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        
        formData.append('username', form.username);
        formData.append('store_name', form.store_name);
        formData.append('store_description', form.store_description);
        formData.append('address', form.address);
        
        formData.append('delete_image', isImageDeleted); 

        if (selectedFile) {
            formData.append('store_image', selectedFile);
        } else {
            formData.append('store_image', form.store_image || '');
        }

        const res = await api.put('/settings', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = { ...currentUser, ...res.data.user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setSelectedFile(null);
        setIsImageDeleted(false);
        
        fetchData();

        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil toko diperbarui', timer: 1500, showConfirmButton: false });
    } catch(err) { 
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan profil' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return Swal.fire('Error', 'Konfirmasi password baru tidak cocok', 'error');
    }
    
    try {
      await api.put('/settings/change-password', {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      Swal.fire('Sukses', 'Password berhasil diganti', 'success');
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Password lama salah', 'error');
    }
  };

  const handleResetViaPin = async () => {
    try {
      await api.put('/settings/verify-pin', { username: form.username, pin: pinData.pin });
      await api.put('/settings/reset-password', { username: form.username, newPassword: pinData.newPass });
      
      setShowPinModal(false);
      setPinData({ pin: '', newPass: '' });
      Swal.fire('Sukses', 'Password berhasil direset via PIN', 'success');
    } catch (err) {
      Swal.fire('Gagal', 'PIN salah atau terjadi kesalahan', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Yakin hapus akun?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/settings/delete-account');

        await Swal.fire({
            title: 'Terhapus!',
            text: 'Akun Anda telah dihapus permanen.',
            icon: 'success',
            timer: 2000, 
            showConfirmButton: true
        });

        localStorage.clear(); 
        window.location.href = '/login'; 
        
      } catch (err) {
        console.error(err);
        Swal.fire(
            'Gagal', 
            err.response?.data?.error || 'Terjadi kesalahan saat menghapus akun', 
            'error'
        );
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat...</div>;

  return (
    <div className="animate-fade-in pb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Akun</h2>

        <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`pb-2 px-4 font-medium transition ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Profil Toko
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`pb-2 px-4 font-medium transition ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Keamanan & Akun
            </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* TAB 1: PROFIL TOKO */}
            {activeTab === 'profile' && (
            <>
                <div className="w-full lg:w-1/3">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center sticky top-4">
                        <img 
                            src={
                                form.store_image 
                                    ? (form.store_image.startsWith('/uploads') ? `${API_URL}${form.store_image}` : form.store_image)
                                    : "https://ui-avatars.com/api/?name=Error&background=red"
                            } 
                            alt="Logo Toko" 
                            className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-50"
                            onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=Error&background=red"}}
                        />
                        <h3 className="font-bold text-xl">{form.store_name || "Nama Toko"}</h3>
                        <p className="text-gray-500 text-sm">@{form.username}</p>
                        
                        <div className="mt-4 flex flex-col gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                            >
                                📷 Upload / Kamera
                            </button>
                            
                            {form.store_image && (
                                <button 
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Hapus Gambar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSaveProfile} className="grid gap-5">
                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Username</label>
                            <input type="text" value={form.username} disabled className="w-full border bg-gray-100 p-3 rounded-lg text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Nama Usaha / Toko</label>
                            <input type="text" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})} className="w-full border p-3 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Deskripsi Toko</label>
                            <textarea rows="3" value={form.store_description} onChange={e => setForm({...form, store_description: e.target.value})} className="w-full border p-3 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Alamat Toko</label>
                            <textarea rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-3 rounded-lg"></textarea>
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition w-full mt-2">SIMPAN PROFIL</button>
                    </form>
                </div>
            </>
            )}

            {/* TAB 2: KEAMANAN */}
            {activeTab === 'security' && (
                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Ganti Password</h3>
                        <form onSubmit={handleChangePassword} className="grid gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Password Lama</label>
                                <input type="password" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} className="w-full border p-3 rounded-lg" placeholder="******" />
                                <button type="button" onClick={() => setShowPinModal(true)} className="text-xs text-blue-600 hover:underline mt-1 text-right block w-full">
                                    Lupa password lama? Gunakan PIN
                                </button>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Password Baru</label>
                                <input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} className="w-full border p-3 rounded-lg" placeholder="******" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Konfirmasi Password Baru</label>
                                <input type="password" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} className="w-full border p-3 rounded-lg" placeholder="******" />
                            </div>
                            <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-900 transition mt-2">
                                UPDATE PASSWORD
                            </button>
                        </form>
                    </div>

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h3 className="text-lg font-bold text-red-700 mb-2">Zona Bahaya</h3>
                        <p className="text-red-600 text-sm mb-4">Menghapus akun akan menghilangkan semua data toko, produk, dan transaksi secara permanen.</p>
                        <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition w-full lg:w-auto">
                            HAPUS AKUN PERMANEN
                        </button>
                    </div>
                </div>
            )}
        </div>

        {showPinModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Reset via PIN</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Masukkan PIN Akun</label>
                            <input type="password" value={pinData.pin} onChange={e => setPinData({...pinData, pin: e.target.value})} className="w-full border p-2 rounded text-center text-2xl tracking-widest" maxLength={4} placeholder="0000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password Baru</label>
                            <input type="password" value={pinData.newPass} onChange={e => setPinData({...pinData, newPass: e.target.value})} className="w-full border p-2 rounded" placeholder="Password baru" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowPinModal(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold">Batal</button>
                            <button onClick={handleResetViaPin} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}