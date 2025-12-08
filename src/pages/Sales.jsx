import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ShoppingCart } from 'lucide-react';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://127.0.0.1:5001/products');
    setProducts(res.data);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return Swal.fire('Error', 'Pilih produk dulu!', 'error');
    
    setLoading(true);
    const total_price = parseInt(selectedProduct.sell_price) * parseInt(qty);
    const profit = (parseInt(selectedProduct.sell_price) - parseInt(selectedProduct.buy_price)) * parseInt(qty);

    try {
        await axios.post('http://127.0.0.1:5001/transactions', {
            product_id: parseInt(selectedProduct.id),
            qty: parseInt(qty),
            total_price: total_price,
            profit: profit
        });
        Swal.fire('Berhasil', 'Transaksi tercatat!', 'success');
        setQty(1);
        setSelectedProduct(null);
        fetchProducts(); 
    } catch (err) {
        Swal.fire('Gagal', err.response?.data || 'Terjadi kesalahan', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
      <div className="w-full md:w-1/2 bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800"><ShoppingCart className="mr-3"/> Kasir Penjualan</h2>
        <form onSubmit={handleTransaction} className="space-y-6">
            <div>
                <label className="block font-bold text-gray-600 mb-2">Pilih Barang</label>
                <select className="w-full p-3 border rounded-xl"
                    onChange={(e) => setSelectedProduct(products.find(p => p.id == e.target.value))}
                    value={selectedProduct?.id || ''}>
                    <option value="">-- Cari Barang --</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                            {p.name} (Stok: {p.stock})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block font-bold text-gray-600 mb-2">Jumlah Beli</label>
                <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
                    className="w-full p-3 border rounded-xl font-bold text-lg" />
            </div>
            <div className="bg-blue-50 p-6 rounded-xl flex justify-between items-center">
                <span className="text-gray-600">Total Bayar:</span>
                <span className="text-2xl font-bold text-blue-700">Rp {selectedProduct ? (selectedProduct.sell_price * qty).toLocaleString() : 0}</span>
            </div>
            <button disabled={loading || !selectedProduct} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
                {loading ? 'Memproses...' : 'BAYAR SEKARANG'}
            </button>
        </form>
      </div>
    </div>
  );
}