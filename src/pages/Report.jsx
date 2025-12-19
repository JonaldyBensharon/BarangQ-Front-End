import { useEffect, useState } from 'react';
import api from '../components/api';
import { formatRupiah } from '../utils/formatter';

export default function Report() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/reports').then(res => setData(res.data));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan Riwayat Transaksi</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Nama Barang</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Total Masuk</th>
              <th className="p-4">Keuntungan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500 text-sm">{new Date(item.date).toLocaleString()}</td>
                <td className="p-4 font-bold text-gray-800">{item.name}</td>
                <td className="p-4 font-bold">{item.qty}</td>
                <td className="p-4 text-blue-600 font-bold">{formatRupiah(item.total_price)}</td>
                <td className={`p-4 font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.profit > 0 ? '+' : ''} {formatRupiah(item.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="p-8 text-center text-gray-400">Belum ada transaksi</p>}
      </div>
    </div>
  );
}