/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, ShoppingCart, Check, ChevronUp, ChevronDown, X } from 'lucide-react';
import api from '../components/api';

export default function Sales() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // State Keranjang Belanja
    const [pendingSales, setPendingSales] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [summarySales, setSummarySales] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    
    // State untuk input jumlah sementara sebelum dikonfirmasi
    const [tempQtys, setTempQtys] = useState({});

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            // FIX: Gunakan /api/products
            const res = await api.get('/api/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            Swal.fire('Gagal', 'Tidak bisa memuat data produk', 'error');
        }
    };

    // Filter Pencarian
    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        setFilteredProducts(
            products.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.code && p.code.toLowerCase().includes(term))
            )
        );
    }, [searchTerm, products]);

    // Logika Tambah ke Keranjang
    const addToPending = (product, qty) => {
        if (qty <= 0 || qty > product.stock) {
            Swal.fire('Error', 'Jumlah tidak valid atau melebihi stok', 'error');
            return;
        }

        const exists = pendingSales.find(item => item.id === product.id);

        if (exists) {
            setPendingSales(
                pendingSales.map(item =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + qty, subtotal: (item.qty + qty) * item.sell_price }
                        : item
                )
            );
        } else {
            setPendingSales([
                ...pendingSales,
                {
                    id: product.id,
                    name: product.name,
                    sell_price: Number(product.sell_price),
                    stock: Number(product.stock),
                    qty: qty,
                    subtotal: Number(product.sell_price) * qty
                }
            ]);
        }
    };

    // Update jumlah di dalam keranjang (Drawer)
    const updateQtyInCart = (id, newQty) => {
        if (newQty < 0) return;
        
        // Cari stok asli produk untuk validasi max
        const originalProduct = products.find(p => p.id === id);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (newQty > maxStock) return; // Cegah melebihi stok

        setPendingSales(prev => prev.map(item => {
            if (item.id === id) {
                if (newQty === 0) return null; // Hapus jika 0
                return { ...item, qty: newQty, subtotal: item.sell_price * newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const handleConfirmQty = (product, qty) => {
        addToPending(product, qty);

        // Kurangi stok visual di tabel (agar user tau sisa stok)
        setProducts(products.map(p =>
            p.id === product.id ? { ...p, stock: p.stock - qty } : p
        ));

        // Reset input sementara
        setTempQtys({ ...tempQtys, [product.id]: 0 });
        setHighlightedId(null);
        setPanelOpen(true); // Buka drawer otomatis saat nambah barang
    };

    const handleRecord = async () => {
        if (pendingSales.length === 0) {
            Swal.fire('Info', 'Keranjang masih kosong', 'info');
            return;
        }

        try {
            const payload = pendingSales.map(i => ({
                product_id: i.id,
                qty: i.qty
            }));

            // FIX: Gunakan /api/transactions
            const res = await api.post('/api/transactions', { items: payload });
            
            // Ambil detail untuk summary
            const summary = await api.get(`/api/transactions/${res.data.transaction_id}`);

            setSummarySales(summary.data);
            setPendingSales([]);
            setPanelOpen(false);

            Swal.fire('Sukses', 'Transaksi Berhasil Disimpan!', 'success');
            fetchProducts(); // Refresh data terbaru dari server
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan transaksi', 'error');
        }
    };

    // Hitungan Summary Drawer
    const totalQty = pendingSales.reduce((a, b) => a + b.qty, 0);
    const totalRevenue = pendingSales.reduce((a, b) => a + b.subtotal, 0);

    // Hitungan Summary Akhir (Struk)
    const totalSummaryQty = summarySales?.items.reduce((a, b) => a + b.qty, 0) || 0;
    const totalSummaryRevenue = summarySales?.items.reduce((a, b) => a + b.subtotal, 0) || 0;
    const totalSummaryProfit = summarySales?.items.reduce((a, b) => a + b.profit, 0) || 0;

    return (
        <div className="animate-fade-in pb-32"> {/* pb-32 untuk memberi ruang bagi drawer bawah */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kasir / Penjualan</h2>

            {/* --- SEARCH BAR (GAYA BARU) --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border">
                 <div className="w-full md:w-1/3 flex items-center px-3 py-2 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
                    <Search className="text-gray-400 mr-2 shrink-0" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari Barang..." 
                        className="w-full outline-none bg-transparent border-none p-0 text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- TABEL PRODUK --- */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Produk</th>
                            <th className="p-4">Harga</th>
                            <th className="p-4 text-center">Sisa Stok</th>
                            <th className="p-4 text-center w-48">Input Jumlah</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((p) => (
                            <tr key={p.id} className={`hover:bg-blue-50 transition ${highlightedId === p.id ? 'bg-blue-50' : ''}`}>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.code || '-'}</div>
                                </td>
                                <td className="p-4 font-medium">
                                    Rp {parseInt(p.sell_price).toLocaleString()}
                                </td>
                                <td className={`p-4 text-center font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                                    {p.stock}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center space-x-2 bg-white border rounded-lg p-1 shadow-sm">
                                        <input
                                            type="number"
                                            min="0"
                                            max={p.stock}
                                            className="w-16 text-center outline-none font-bold text-gray-700"
                                            placeholder="0"
                                            value={tempQtys[p.id] > 0 ? tempQtys[p.id] : ''}
                                            onFocus={() => setHighlightedId(p.id)}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 0;
                                                setTempQtys({ ...tempQtys, [p.id]: Math.min(val, p.stock) });
                                            }}
                                        />
                                        {(tempQtys[p.id] || 0) > 0 && (
                                            <button 
                                                onClick={() => handleConfirmQty(p, tempQtys[p.id])}
                                                className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition"
                                                title="Masuk Keranjang"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-400">Barang tidak ditemukan.</div>
                )}
            </div>

            {/* --- DRAWER KERANJANG (FLOATING BOTTOM PANEL) --- */}
            {pendingSales.length > 0 && !summarySales && (
                <div className={`fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 z-40 border-t ${panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
                    
                    {/* Header Drawer (Selalu Terlihat) */}
                    <div 
                        className="bg-gray-900 text-white p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
                        onClick={() => setPanelOpen(!panelOpen)}
                    >
                        <div className="flex items-center font-bold text-lg">
                            <ShoppingCart className="mr-3" />
                            {pendingSales.length} Item di Keranjang
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Total Sementara</p>
                                <p className="text-xl font-bold text-green-400">Rp {totalRevenue.toLocaleString()}</p>
                            </div>
                            {panelOpen ? <ChevronDown /> : <ChevronUp />}
                        </div>
                    </div>

                    {/* Isi Drawer (Tabel Keranjang) */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                        <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                            <thead className="bg-gray-100 border-b text-left text-sm font-bold text-gray-600">
                                <tr>
                                    <th className="p-3">Nama Barang</th>
                                    <th className="p-3">Harga</th>
                                    <th className="p-3">Qty</th>
                                    <th className="p-3">Subtotal</th>
                                    <th className="p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingSales.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3">Rp {item.sell_price.toLocaleString()}</td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                className="w-16 border rounded p-1 text-center"
                                                value={item.qty}
                                                onChange={(e) => updateQtyInCart(item.id, parseInt(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td className="p-3 font-bold">Rp {item.subtotal.toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => updateQtyInCart(item.id, 0)}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleRecord}
                                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition transform active:scale-95 flex items-center"
                            >
                                <Check className="mr-2" /> PROSES PEMBAYARAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL STRUK / SUMMARY --- */}
            {summarySales && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl">
                        <div className="text-center border-b pb-4 mb-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Check size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Transaksi Berhasil!</h3>
                            <p className="text-gray-500 text-sm">{new Date().toLocaleString()}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Item</span>
                                <span className="font-bold">{totalSummaryQty} pcs</span>
                            </div>
                            <div className="flex justify-between text-gray-800 text-lg">
                                <span>Total Pendapatan</span>
                                <span className="font-bold">Rp {totalSummaryRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600 text-sm bg-green-50 p-2 rounded">
                                <span>Estimasi Keuntungan</span>
                                <span className="font-bold">+ Rp {totalSummaryProfit.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => window.print()} 
                                className="flex-1 border border-gray-300 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cetak
                            </button>
                            <button 
                                onClick={() => setSummarySales(null)} 
                                className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-700"
                            >
                                Transaksi Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}