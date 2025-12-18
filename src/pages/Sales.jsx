import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../components/api';
import "../components/Sales.css";

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
            const res = await api.get('/api/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch(err) {
            Swal.fire('Gagal', 'Tidak bisa memuat data produk', 'error');
        }
    };

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(term) || (p.code && p.code.toLowerCase().includes(term))
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const addToPending = (product, qty) => {
        if(qty <= 0 || qty > product.stock){
            return Swal.fire('Error', 'Jumlah tidak valid', 'error');
        }
        const exists = pendingSales.find(item => item.id === product.id);
        if(exists){
            const updated = pendingSales.map(item => 
                item.id === product.id ? {...item, qty: item.qty + qty, subtotal: (item.qty + qty) * item.sell_price} : item
            );
            setPendingSales(updated);
        } else {
            setPendingSales([...pendingSales, { 
                id: product.id,
                name: product.name,
                sell_price: parseFloat(product.sell_price),
                stock: parseInt(product.stock),
                qty: qty,
                subtotal: parseFloat(product.sell_price) * qty
            }]);
        }
        Swal.fire('Berhasil', 'Barang ditambahkan ke detail penjualan', 'success');
    };

    const updateQty = (id, qty) => {
        if(qty < 0) return;
        const updated = pendingSales.map(item => {
            if(item.id === id){
                if(qty === 0) return null;
                return {...item, qty, subtotal: item.sell_price * qty};
            }
            return item;
        }).filter(Boolean);
        setPendingSales(updated);
    };

    const toggleHighlight = (id) => {
        setHighlightedId(prev => prev === id ? null : id);
    };

    const totalQty = pendingSales.reduce((acc, item) => acc + item.qty, 0);
    const totalRevenue = pendingSales.reduce((acc, item) => acc + item.subtotal, 0);

    const handleConfirmQty = (product, qty) => {
        addToPending(product, qty);
        const updatedProducts = products.map(p => 
            p.id === product.id ? {...p, stock: p.stock - qty} : p
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        setTempQtys({...tempQtys, [product.id]: 0});
        setHighlightedId(null);
        setPanelOpen(true); 
    };

    const handleRecord = async () => {
        if(pendingSales.length === 0){
            return Swal.fire('Info', 'Belum ada barang untuk dicatat', 'info');
        }

        const payloadItems = pendingSales.map(item => ({
            product_id: item.id,
            qty: item.qty
        }));

        try {
            const res = await api.post('/api/transactions', { items: payloadItems });
            const { transaction_id } = res.data;

            const summaryRes = await api.get(`/api/transactions/${transaction_id}`);
            setSummarySales(summaryRes.data);

            Swal.fire('Sukses', 'Penjualan dicatat!', 'success');

            setPendingSales([]);
            setPanelOpen(false);

            fetchProducts();
        } catch(err) {
            const msg = err.response?.data?.error || 'Terjadi kesalahan saat mencatat penjualan';
            Swal.fire('Gagal', msg, 'error');
        }
    };

    const totalSummaryQty = summarySales?.items.reduce((acc, item) => acc + item.qty, 0) || 0;
    const totalSummaryRevenue = summarySales?.items.reduce((acc, item) => acc + item.subtotal, 0) || 0;
    const totalSummaryProfit = summarySales?.items.reduce((acc, item) => acc + item.profit, 0) || 0;

    return (
        <div className="sales-container">
            {!summarySales && (
                <>
                    <div className="search-panel">
                        <input 
                            type="text" 
                            placeholder="Cari produk" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Kode</th>
                                <th>Nama</th>
                                <th>Harga Jual</th>
                                <th>Sisa Stok</th>
                                <th>Jumlah Terjual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, idx) => {
                                const tempQty = tempQtys[product.id] || 0;
                                return (
                                    <tr key={product.id} className={highlightedId === product.id ? 'highlight' : ''}>
                                        <td>{idx + 1}</td>
                                        <td>{product.code || '-'}</td>
                                        <td>{product.name}</td>
                                        <td>{product.sell_price}</td>
                                        <td>{product.stock}</td>
                                        <td className="qty-input-cell">
                                            <div className="qty-wrapper">
                                                <button 
                                                    disabled={tempQty <= 0} 
                                                    onClick={() => setTempQtys({...tempQtys, [product.id]: tempQty - 1})}
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                                <input 
                                                    type="number"
                                                    min={0}
                                                    max={product.stock}
                                                    value={tempQty}
                                                    onFocus={() => toggleHighlight(product.id)}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setTempQtys({...tempQtys, [product.id]: Math.min(val, product.stock)});
                                                    }}
                                                />
                                                <button 
                                                    disabled={tempQty >= product.stock} 
                                                    onClick={() => setTempQtys({...tempQtys, [product.id]: tempQty + 1})}
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                {tempQty > 0 && (
                                                    <button className="confirm-btn" onClick={() => handleConfirmQty(product, tempQty)}>✔</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {pendingSales.length > 0 && (
                        <div className={`detail-drawer ${panelOpen ? 'expanded' : 'collapsed'}`}>
                            <div className="drawer-header">
                                <button className="drawer-toggle" onClick={() => setPanelOpen(!panelOpen)}>
                                    {panelOpen ? <ArrowDown size={18}/> : <ArrowUp size={18}/>}
                                </button>
                                <h3>Detail Penjualan</h3>
                            </div>

                            {panelOpen && (
                                <div className="drawer-content">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>No.</th>
                                                <th>Nama Barang</th>
                                                <th>Harga Jual</th>
                                                <th>Sisa Stok</th>
                                                <th>Jumlah Terjual</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingSales.map((item, idx) => (
                                                <tr key={item.id} className={highlightedId === item.id ? 'highlight' : ''}>
                                                    <td>{idx + 1}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.sell_price}</td>
                                                    <td>{item.stock - item.qty}</td>
                                                    <td className="qty-input-cell">
                                                        <div className="qty-wrapper">
                                                            <button
                                                                disabled={item.qty <= 0}
                                                                onClick={() => updateQty(item.id, item.qty - 1)}
                                                            >
                                                                <ChevronDown size={16} />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={item.stock}
                                                                value={item.qty}
                                                                onChange={e => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    updateQty(item.id, Math.min(val, item.stock));
                                                                }}
                                                                onFocus={() => toggleHighlight(item.id)} />
                                                            <button
                                                                disabled={item.qty >= item.stock}
                                                                onClick={() => updateQty(item.id, item.qty + 1)}
                                                            >
                                                                <ChevronUp size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>{item.subtotal}</td>
                                                </tr>
                                            ))}
                                            <tr className="total-row">
                                                <td colSpan={4}>Total Penjualan</td>
                                                <td>{totalQty}</td>
                                                <td>{totalRevenue}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <button className="record-btn" onClick={handleRecord}>Catat</button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {summarySales && (
                <div className="summary-panel">
                    <h3>Rangkuman Penjualan</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Nama Barang</th>
                                <th>Harga Jual</th>
                                <th>Sisa Stok</th>
                                <th>Jumlah Terjual</th>
                                <th>Pendapatan</th>
                                <th>Laba</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summarySales.items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td>{idx + 1}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.sell_price}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.qty}</td>
                                    <td>{item.subtotal}</td>
                                    <td>{item.profit}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan={4}>Total</td>
                                <td>{totalSummaryQty}</td>
                                <td>{totalSummaryRevenue}</td>
                                <td>{totalSummaryProfit}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="summary-totals">
                        <p>Jumlah barang yang terjual: {totalSummaryQty}</p>
                        <p>Total Pendapatan: {totalSummaryRevenue}</p>
                        <p>Total Keuntungan: {totalSummaryProfit}</p>
                        <button onClick={() => setSummarySales(null)}>Kembali</button>
                    </div>
                </div>
            )}
        </div>
    );
}