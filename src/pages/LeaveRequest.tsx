import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Plus, 
  Trash2 
} from 'lucide-react';

import './DonateButton.css';

export default function LeaveRequest() {
  // State untuk Form Permohonan Cuti
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('annual');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State untuk Daftar Permohonan Cuti
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Token Autentikasi
  const token = sessionStorage.getItem('auth_token');
  const API_URL = 'http://127.0.0.1:8000/api';

  // --- FETCH DAFTAR PERMOHONAN CUTI ---
  const fetchLeaveRequests = async () => {
    if (!token) return;

    setFetching(true);
    try {
      const response = await axios.get(`${API_URL}/leave-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setLeaveRequests(data);
    } catch (err: any) {
      console.error("Gagal memuat riwayat cuti:", err);
      setError("Gagal memuat data permohonan cuti.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    if (!token) window.location.href = '/login';
  }, []);

  // --- SUBMIT FORM PERMOHONAN CUTI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!startDate || !endDate || !reason.trim()) {
      setError("Semua field wajib diisi.");
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Tanggal selesai tidak boleh lebih awal.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('type', leaveType);
      formData.append('reason', reason.trim());

      const response = await axios.post(`${API_URL}/leave-request`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
        } // ⚠️ HAPUS 'Content-Type' — biarkan Axios atur otomatis
      });

      setSuccess(response.data.message || "Permohonan cuti berhasil diajukan.");
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('annual');
      await fetchLeaveRequests();
    } catch (err: any) {
      console.error("Error saat mengajukan cuti:", err);
      const msg = err.response?.data?.message || "Gagal mengajukan cuti. Coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- HAPUS PERMOHONAN CUTI ---
  const handleDelete = async (id: number) => {
    if (!confirm("Batalkan permohonan ini?")) return;

    try {
      await axios.delete(`${API_URL}/leave-request/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Permohonan cuti dibatalkan.");
      await fetchLeaveRequests();
    } catch (err: any) {
      setError("Gagal membatalkan permohonan cuti.");
    }
  };

  // Helper untuk jenis cuti
  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual: 'Tahunan',
      sick: 'Sakit',
      personal: 'Pribadi',
      maternity: 'Melahirkan',
      paternity: 'Ayah'
    };
    return labels[type] || type;
  };

  // Helper untuk status badge
  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200";
    
    switch (status) {
      case 'approved':
        return (
          <span className={`${base} bg-green-100 text-green-800 ring-1 ring-green-200`}>
            <CheckCircle size={12} className="mr-1" /> Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className={`${base} bg-red-100 text-red-800 ring-1 ring-red-200`}>
            <XCircle size={12} className="mr-1" /> Ditolak
          </span>
        );
      default:
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 animate-pulse`}>
            <Clock size={12} className="mr-1" /> Menunggu
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Permohonan Cuti
        </h1>
        <p className="text-gray-500 text-sm">Ajukan cuti Anda melalui form di bawah ini.</p>
      </div>

      {/* FORM AJUAN CUTI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" /> Ajukan Permohonan Cuti
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 items-start text-red-600 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex gap-2 items-start text-green-600 text-sm animate-fade-in">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Mulai */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Tanggal Selesai */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Jenis Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="annual">Cuti Tahunan</option>
              <option value="sick">Cuti Sakit</option>
              <option value="personal">Cuti Pribadi</option>
              <option value="maternity">Cuti Melahirkan</option>
              <option value="paternity">Cuti Lainnya</option>
            </select>
          </div>

          {/* Alasan Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Cuti</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan cuti Anda secara singkat..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Submit Button */}
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-donate w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ 
                '--radii': '0.75rem', // Sesuaikan radius agar rounded-xl seperti input field
                '--size': '1rem' 
              } as React.CSSProperties}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengajukan...</span>
                </>
              ) : (
                'Ajukan Permohonan Cuti'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIWAYAT PERMOHONAN CUTI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Riwayat Permohonan Cuti
        </h2>

        {fetching ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Memuat data...</p>
            </div>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/40">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4 text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-gray-500 font-medium">Belum ada permohonan cuti</h3>
            <p className="text-gray-400 text-sm mt-1">Ajukan cuti pertama Anda hari ini!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-full">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaveRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="px-4 py-4 text-gray-800 font-medium">
                      {new Date(req.start_date).toLocaleDateString('id-ID')} — {new Date(req.end_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {req.duration_days} hari
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getLeaveTypeLabel(req.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 
                                     transition-colors duration-200 group-hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" /> Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}