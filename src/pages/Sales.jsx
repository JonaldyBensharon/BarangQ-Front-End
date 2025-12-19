/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, ShoppingCart, Check, ChevronUp, ChevronDown, X } from 'lucide-react';
import api from '../components/api';
import { formatRupiah } from '../utils/formatter';

export default function Sales() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [pendingSales, setPendingSales] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [summarySales, setSummarySales] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    const [tempQtys, setTempQtys] = useState({});

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            Swal.fire('Gagal', 'Tidak bisa memuat data produk', 'error');
        }
    };

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        setFilteredProducts(
            products.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.code && p.code.toLowerCase().includes(term))
            )
        );
    }, [searchTerm, products]);

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

    const updateQtyInCart = (id, newQty) => {
        if (newQty < 0) return;
        
        const originalProduct = products.find(p => p.id === id);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (newQty > maxStock) return; 

        setPendingSales(prev => prev.map(item => {
            if (item.id === id) {
                if (newQty === 0) return null; 
                return { ...item, qty: newQty, subtotal: item.sell_price * newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const handleConfirmQty = (product, qty) => {
        addToPending(product, qty);

        setProducts(products.map(p =>
            p.id === product.id ? { ...p, stock: p.stock - qty } : p
        ));

        setFilteredProducts(filteredProducts.map(p =>
            p.id === product.id ? { ...p, stock: p.stock - qty } : p
        ));

        setTempQtys({ ...tempQtys, [product.id]: 0 });
        setHighlightedId(null);
    };

    const handleRecord = async () => {
        if (pendingSales.length === 0) {
            Swal.fire('Info', 'Belum ada barang untuk dicatat', 'info');
            return;
        }

        try {
            const payload = pendingSales.map(i => ({
                product_id: i.id,
                qty: i.qty
            }));

            const res = await api.post('/transactions', { items: payload });
            const summary = await api.get(`/transactions/${res.data.transaction_id}`);

            setSummarySales(summary.data);
            setPendingSales([]);
            setPanelOpen(false);

            fetchProducts(); 
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan transaksi', 'error');
        }
    };

    const getCurrentStock = (productId) => {
      const product = products.find(p => p.id === productId);
      return product ? product.stock : '-';
    };

    // Hitungan Summary Drawer
    const totalRevenue = pendingSales.reduce((a, b) => a + b.subtotal, 0);

    // Hitungan Summary Akhir
    const totalSummaryQty = summarySales?.items.reduce((a, b) => a + b.qty, 0) || 0;
    const totalSummaryRevenue = summarySales?.items.reduce((a, b) => a + Number(b.subtotal), 0) || 0;
    const totalSummaryProfit = summarySales?.items.reduce((a, b) => a + Number(b.profit), 0) || 0;

    return (
        <div className="animate-fade-in pb-32"> 
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Catatan Penjualan</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border">
                 <div className="w-full md:w-2/3 flex items-center px-3 py-2 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
                    <Search className="text-gray-400 mr-2 shrink-0" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari Barang" 
                        className="w-full outline-none bg-transparent border-none p-0 text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Produk</th>
                            <th className="p-4">Harga Jual</th>
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
                                    {formatRupiah(p.sell_price)}
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

            {pendingSales.length > 0 && !summarySales && (
                <div className={`sticky bottom-0 left-0 w-full bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 z-40 border-t ${panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
                    
                    <div 
                        className="bg-gray-900 text-white p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
                        onClick={() => setPanelOpen(!panelOpen)}
                    >
                        <div className="flex items-center font-bold text-lg">
                            <ShoppingCart className="mr-3" />
                            {pendingSales.length} Barang di Catatan Penjualan
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Total Sementara</p>
                                <p className="text-xl font-bold text-green-400">{formatRupiah(totalRevenue)}</p>
                            </div>
                            {panelOpen ? <ChevronDown /> : <ChevronUp />}
                        </div>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                        <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                            <thead className="bg-gray-100 border-b text-left text-sm font-bold text-gray-600">
                                <tr>
                                    <th className="p-3">Nama Barang</th>
                                    <th className="p-3">Harga Jual</th>
                                    <th className="p-3">Sisa Stok</th>
                                    <th className="p-3">Jumlah Terjual</th>
                                    <th className="p-3">Subtotal</th>
                                    <th className="p-3 text-center">Hapus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingSales.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3">{formatRupiah(item.sell_price)}</td>
                                        <td className="p-3">{item.stock - item.qty}</td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                className="w-16 border rounded p-1 text-center"
                                                min={0}
                                                max={item.stock}
                                                value={item.qty}
                                                onChange={(e) => updateQtyInCart(item.id, Math.min(Number(e.target.value) || 0, item.stock))}
                                            />
                                        </td>
                                        <td className="p-3 font-bold">{formatRupiah(item.subtotal)}</td>
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
                                <Check className="mr-2" /> Proses Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {summarySales && (
              <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-auto'>
                  <div className='bg-white w-full max-w-5xl mt-16 mb-10 rounded-2xl shadow-xl border p-6'>
                  <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold text-green-600'>
                      Transaksi Berhasil Dicatat
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="border border-blue-400 p-3 text-center">Nama Barang</th>
                        <th className="border border-blue-400 p-3 text-center">Harga Jual</th>
                        <th className="border border-blue-400 p-3 text-center">Sisa Stok</th>
                        <th className="border border-blue-400 p-3 text-center">Jumlah Terjual</th>
                        <th className="border border-blue-400 p-3 text-center">Pendapatan</th>
                        <th className="border border-blue-400 p-3 text-center">Laba</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {summarySales.items.map((item) => {
                        const profitVal = Number(item.profit); 
                        return (
                            <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border p-3 font-medium">
                                {item.product_name}
                            </td>
                            <td className="border p-3 text-right">
                                {formatRupiah(item.sell_price)}
                            </td>
                            <td className="border p-3 text-center">
                                {getCurrentStock(item.product_id)}
                            </td>
                            <td className="border p-3 text-center font-semibold">
                                {item.qty}
                            </td>
                            <td className="border p-3 text-right">
                                {formatRupiah(item.subtotal)}
                            </td>
                            <td className={`border p-3 text-right font-semibold ${profitVal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitVal < 0 ? '- ' : (profitVal > 0 ? '+ ' : '')}{formatRupiah(Math.abs(profitVal))}
                            </td>
                            </tr>
                        );
                      })}

                      <tr className="bg-blue-400 font-bold">
                        <td className="text-white p-3" colSpan={3}>
                          Total
                        </td>
                        <td className="border p-3 text-center bg-blue-100">
                          {totalSummaryQty}
                        </td>
                        <td className="border p-3 text-right bg-blue-100">
                          {formatRupiah(totalSummaryRevenue)}
                        </td>
                        <td className={`border p-3 text-right bg-blue-100 ${totalSummaryProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {totalSummaryProfit < 0 ? '- ' : (totalSummaryProfit > 0 ? '+ ' : '')}{formatRupiah(Math.abs(totalSummaryProfit))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className='text-xl font-bold'>Total barang terjual</span>
                    <span className="text-xl font-bold">{totalSummaryQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className='text-xl font-bold'>Total Pendapatan</span>
                    <span className="text-xl font-bold">
                      {formatRupiah(totalSummaryRevenue)}
                    </span>
                  </div>
                  <div className={`flex justify-between ${totalSummaryProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className='text-xl font-bold'>Total Keuntungan</span>
                    <span className="text-xl font-bold">
                      {totalSummaryProfit < 0 ? '- ' : (totalSummaryProfit > 0 ? '+ ' : '')}{formatRupiah(Math.abs(totalSummaryProfit))}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 border bg-gray-300 rounded-xl font-bold hover:bg-gray-400"
                  >
                    Cetak
                  </button>

                  <button
                    onClick={() => setSummarySales(null)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
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