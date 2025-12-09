import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Report() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5001/api/reports').then(res => setData(res.data));
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
                <td className="p-4 text-blue-600 font-bold">Rp {parseInt(item.total_price).toLocaleString()}</td>
                <td className="p-4 text-green-600 font-bold">+ Rp {parseInt(item.profit).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="p-8 text-center text-gray-400">Belum ada transaksi</p>}
      </div>
    </div>
  );
}