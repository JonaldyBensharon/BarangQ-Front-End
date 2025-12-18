/* eslint-disable react-hooks/immutability */
console.log('Sales jsx baru dipakai');
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ArrowUp, ArrowDown } from 'lucide-react';
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
            const res = await api.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch {
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
            Swal.fire('Error', 'Jumlah tidak valid', 'error');
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
                    qty,
                    subtotal: Number(product.sell_price) * qty
                }
            ]);
        }
    };

    const updateQty = (id, qty) => {
        if (qty < 0) return;

        setPendingSales(
            pendingSales
                .map(item =>
                    item.id === id
                        ? qty === 0
                            ? null
                            : { ...item, qty, subtotal: item.sell_price * qty }
                        : item
                )
                .filter(Boolean)
        );
    };

    const toggleHighlight = (id) => {
        setHighlightedId(prev => (prev === id ? null : id));
    };

    const totalQty = pendingSales.reduce((a, b) => a + b.qty, 0);
    const totalRevenue = pendingSales.reduce((a, b) => a + b.subtotal, 0);

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

            Swal.fire('Sukses', 'Penjualan dicatat!', 'success');
            fetchProducts();
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan', 'error');
        }
    };

    const getCurrentStock = (productId) => {
      const product = products.find(p => p.id === productId);
      return product ? product.stock : '-';
    };

    const totalSummaryQty = summarySales?.items.reduce((a, b) => a + b.qty, 0) || 0;
    const totalSummaryRevenue = summarySales?.items.reduce((a, b) => a + b.subtotal, 0) || 0;
    const totalSummaryProfit = summarySales?.items.reduce((a, b) => a + b.profit, 0) || 0;

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
                            {filteredProducts.map((p, i) => (
                                <tr key={p.id} className={highlightedId === p.id ? 'highlight' : ''}>
                                    <td>{i + 1}</td>
                                    <td>{p.code || '-'}</td>
                                    <td>{p.name}</td>
                                    <td>{p.sell_price}</td>
                                    <td>{p.stock}</td>
                                    <td className="qty-input-cell">
                                        <div className="qty-wrapper">
                                            <input
                                                type="number"
                                                min={0}
                                                max={p.stock}
                                                value={tempQtys[p.id] || 0}
                                                onFocus={() => toggleHighlight(p.id)}
                                                onChange={e =>
                                                    setTempQtys({
                                                        ...tempQtys,
                                                        [p.id]: Math.min(Number(e.target.value) || 0, p.stock)
                                                    })
                                                }
                                            />
                                            {(tempQtys[p.id] || 0) > 0 && (
                                                <button
                                                    className="confirm-btn"
                                                    onClick={() => handleConfirmQty(p, tempQtys[p.id])}
                                                >
                                                    ✔
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pendingSales.length > 0 && (
                        <div className={`detail-drawer ${panelOpen ? 'expanded' : 'collapsed'}`}>
                            
                            <div className="drawer-toggle">
                              <button onClick={() => setPanelOpen(!panelOpen)}>
                                    {panelOpen ? <ArrowDown /> : <ArrowUp />}
                                </button>
                            </div>

                            <div className="drawer-title">
                              <h3>Detail Penjualan</h3>
                            </div>

                            {!panelOpen && (
                                <div className="drawer-summary">
                                    <span>
                                        Barang yang terjual: <strong>{pendingSales.length}</strong>
                                    </span>
                                    <button onClick={handleRecord}>
                                        Catat
                                    </button>
                                </div>
                            )}

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
                                            {pendingSales.map((i, idx) => (
                                                <tr key={i.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{i.name}</td>
                                                    <td>{i.sell_price}</td>
                                                    <td>{i.stock - i.qty}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={i.stock}
                                                            value={i.qty}
                                                            onChange={e =>
                                                                updateQty(i.id, Math.min(Number(e.target.value) || 0, i.stock))
                                                            }
                                                        />
                                                    </td>
                                                    <td>{i.subtotal}</td>
                                                </tr>
                                            ))}
                                            <tr className="total-row">
                                                <td colSpan={4}>Total</td>
                                                <td>{totalQty}</td>
                                                <td>{totalRevenue}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <button onClick={handleRecord}>Catat</button>
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
                                    <td>{getCurrentStock(item.product_id)}</td>
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
                        <p><pre>Jumlah barang yang terjual : {totalSummaryQty} </pre></p>
                        <p><pre>Total Pendapatan           : Rp{totalSummaryRevenue}</pre></p>
                        <p><pre>Total Keuntungan           : Rp{totalSummaryProfit}</pre></p>
                        <button onClick={() => setSummarySales(null)}>Kembali</button>
                    </div>
                </div>
            )}
        </div>
    );
}