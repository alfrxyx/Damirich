import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Loader2, Plus, Trash2 } from 'lucide-react';

export default function LeaveRequest() {
  // State untuk Form Permohonan Cuti
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('annual'); // default: cuti tahunan
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State untuk Daftar Permohonan Cuti
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Token Autentikasi
  const token = localStorage.getItem('auth_token');
  const API_URL = 'http://127.0.0.1:8000/api';

  // --- FETCH DAFTAR PERMOHONAN CUTI ---
  const fetchLeaveRequests = async () => {
    if (!token) return;

    setFetching(true);
    try {
      const response = await axios.get(`${API_URL}/leave-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data && Array.isArray(response.data.data) 
        ? response.data.data 
        : [];

      setLeaveRequests(data);
    } catch (err: any) {
      console.error("Gagal memuat riwayat permohonan cuti:", err.message || err);
      setError("Gagal memuat data permohonan cuti.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    // Jika token tidak ada, redirect ke login
    if (!token) window.location.href = '/login';
  }, []);

  // --- SUBMIT FORM PERMOHONAN CUTI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validasi input
    if (!startDate || !endDate) {
      setError("Tanggal mulai dan tanggal selesai wajib diisi.");
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      setLoading(false);
      return;
    }

    if (!reason.trim()) {
      setError("Alasan cuti wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('type', leaveType);
      formData.append('reason', reason);

      const response = await axios.post(`${API_URL}/leave-request`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(response.data.message || "Permohonan cuti berhasil diajukan.");
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('annual');

      // Refresh daftar permohonan
      await fetchLeaveRequests();

    } catch (err: any) {
      console.error("Error saat mengajukan cuti:", err);
      const msg = err.response?.data?.message || "Gagal mengajukan permohonan cuti. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- HAPUS PERMOHONAN CUTI (Jika diperbolehkan oleh backend) ---
  const handleDelete = async (id: number) => {
    if (!confirm("Anda yakin ingin membatalkan permohonan cuti ini?")) return;

    try {
      await axios.delete(`${API_URL}/leave-request/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Permohonan cuti berhasil dibatalkan.");
      await fetchLeaveRequests(); // Refresh list
    } catch (err: any) {
      console.error("Gagal membatalkan permohonan cuti:", err);
      setError("Gagal membatalkan permohonan cuti. Silakan coba lagi.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Permohonan Cuti</h1>
        <p className="text-gray-500 text-sm">Ajukan cuti Anda melalui form di bawah ini.</p>
      </div>

      {/* FORM AJUAN CUTI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" /> Ajukan Permohonan Cuti
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Jenis Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="annual">Cuti Tahunan</option>
              <option value="sick">Cuti Sakit</option>
              <option value="personal">Cuti Pribadi</option>
              <option value="maternity">Cuti Melahirkan</option>
              <option value="paternity">Cuti Ayah</option>
            </select>
          </div>

          {/* Alasan Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Cuti</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan cuti Anda..."
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengajukan...
                </>
              ) : (
                'Ajukan Cuti'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIWAYAT PERMOHONAN CUTI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Riwayat Permohonan Cuti
        </h2>

        {fetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center bg-gray-50/50">
            <div className="inline-flex p-3 rounded-full bg-gray-100 mb-3 text-gray-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-gray-500">Belum ada permohonan cuti.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {req.duration_days} hari
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {req.type === 'annual' ? 'Tahunan' :
                         req.type === 'sick' ? 'Sakit' :
                         req.type === 'personal' ? 'Pribadi' :
                         req.type === 'maternity' ? 'Melahirkan' : 'Ayah'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'approved' ? 'bg-green-50 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {req.status === 'approved' ? 'Disetujui' :
                         req.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
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