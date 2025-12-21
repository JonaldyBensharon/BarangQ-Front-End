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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Laporan Riwayat Transaksi</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-600 text-sm font-bold tracking-wider">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Nama Barang</th>
              <th className="p-4 text-center">Jumlah</th>
              <th className="p-4 text-right">Total Harga</th>
              <th className="p-4 text-right">Keuntungan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => {
                const profitVal = Number(item.profit); 
                return (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                        <td className="p-4 text-gray-500 text-sm">{new Date(item.date).toLocaleString()}</td>
                        <td className="p-4 font-bold text-gray-800">{item.name}</td>
                        <td className="p-4 font-bold text-center">{item.qty}</td>
                        <td className="p-4 text-blue-600 font-bold text-right">{formatRupiah(item.total_price)}</td>
                        <td className={`p-4 font-bold text-right ${profitVal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profitVal < 0 ? '- ' : (profitVal > 0 ? '+ ' : '')}{formatRupiah(Math.abs(profitVal))}
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
        {data.length === 0 && <p className="p-8 text-center text-gray-400">Belum ada transaksi</p>}
      </div>
    </div>
  );
}