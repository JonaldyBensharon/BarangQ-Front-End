import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, LogOut } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddStock from './pages/AddStock';
import Sales from './pages/Sales';
import Report from './pages/Report';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import logo from './assets/logo.png';
import api from './components/api';

const Layout = ({ children, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-brand-blue h-16 flex items-center justify-between px-6 shadow-md text-white sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-700 rounded">
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-lg hidden md:block">BarangQ</h1>
          <button onClick={onLogout} className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition">
            <LogOut size={16} className="mr-2" /> Keluar
          </button>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.get('/api/users/info', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(res.data);
          localStorage.setItem('currentUser', JSON.stringify(res.data)); 
        })
        .catch((err) => {
          console.error("Gagal verifikasi token:", err);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <motion.img
          src={logo}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="w-40"
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={(u) => setUser(u)} /> : <Navigate to="/" />} />
        
        <Route path="/*" element={
          user ? (
            <Layout onLogout={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("currentUser");
              setUser(null);
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/add-stock" element={<AddStock />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/report" element={<Report />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;