import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, BarChart2, Users, RefreshCw, 
  CheckCircle, XCircle, Loader2, Info 
} from 'lucide-react';

// =========================================================
// TIPE DATA
// =========================================================
interface Stats {
  total_employees: number;
  present_today: number;
  late_entries: number;
}

interface LeaveRequest {
  id: number;
  karyawan: {
    nama: string;
    divisi: { nama: string };
  };
  start_date: string;
  end_date: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const API_URL = 'http://127.0.0.1:8000/api';

// =========================================================
// KOMPONEN STAT CARD (Optimized with React.memo)
// =========================================================
const StatCard = React.memo(({ icon: Icon, title, value, color }: {
  icon: React.ElementType;
  title: string;
  value: number | undefined;
  color: string;
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value !== undefined ? value.toLocaleString('id-ID') : '–'}</p>
    </div>
  </div>
));

// =========================================================
// SKELETON LOADER UNTUK STAT CARD
// =========================================================
const StatCardSkeleton = () => (
  <div className="bg-white p-5 rounded-xl shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// =========================================================
// NOTIFIKASI TOAST SEDERHANA (bisa diganti dengan library seperti react-hot-toast)
// =========================================================
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) => {
  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg ${bgColor} ${textColor} flex items-center space-x-2 animate-fade-in-up`}>
      <Icon size={18} />
      <span className="font-medium">{message}</span>
    </div>
  );
};

// =========================================================
// HALAMAN UTAMA DASHBOARD
// =========================================================
export default function AdminDashboard() {
  const [authToken] = useState<string | null>(localStorage.getItem('auth_token'));
  
  const [stats, setStats] = useState<Stats>({ total_employees: 0, present_today: 0, late_entries: 0 });
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Tutup toast setelah 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const [resStats, resLeaves] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard-harian`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get(`${API_URL}/admin/leaves`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      setStats(resStats.data.stats || { total_employees: 0, present_today: 0, late_entries: 0 });
      setLeaves(resLeaves.data.data || []);
    } catch (error: any) {
      console.error("Gagal load dashboard:", error);
      const message = error.response?.status === 403
        ? "Akses Ditolak! Anda login sebagai Karyawan Biasa, bukan Admin."
        : "Gagal memuat data. Pastikan server backend menyala.";
      setErrorMsg(message);
      setToast({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = useCallback(async (id: number, newStatus: 'approved' | 'rejected') => {
    const actionLabel = newStatus === 'approved' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${actionLabel} pengajuan cuti ini?`)) return;

    setActionLoading(id);
    try {
      await axios.put(`${API_URL}/admin/leaves/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      setToast({ message: `Berhasil ${actionLabel} cuti.`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Gagal memperbarui status.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  }, [authToken]);

  const formatDate = useCallback((dateString: string) => 
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Ditolak</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Menunggu</span>;
    }
  }, []);

  const pendingCount = useMemo(() => leaves.filter(l => l.status === 'pending').length, [leaves]);

  if (!authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Sesi Tidak Valid</h2>
          <p className="text-gray-600 mt-2">Silakan login kembali sebagai Admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Pusat kontrol absensi & cuti karyawan</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          aria-label="Refresh data"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard icon={Users} title="Total Karyawan" value={stats.total_employees} color="text-blue-600" />
            <StatCard icon={BarChart2} title="Sudah Absen" value={stats.present_today} color="text-emerald-600" />
            <StatCard icon={AlertTriangle} title="Terlambat" value={stats.late_entries} color="text-amber-600" />
          </>
        )}
      </div>

      {/* TABEL APPROVAL CUTI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Approval Cuti
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {pendingCount} menunggu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Alasan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && leaves.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Memuat data...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Tidak ada permohonan cuti.</td></tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{leave.karyawan?.nama || '–'}</div>
                      <div className="text-xs text-gray-500 mt-1">{leave.karyawan?.divisi?.nama || '–'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-700 font-medium">{formatDate(leave.start_date)}</div>
                      <div className="text-xs text-gray-500 mt-1">s/d {formatDate(leave.end_date)}</div>
                    </td>
                    <td className="px-4 py-4 max-w-[180px]">
                      <div className="truncate" title={leave.reason}>{leave.reason || '–'}</div>
                      <div className="text-xs text-gray-400 capitalize mt-1">{leave.type || '–'}</div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(leave.status)}</td>
                    <td className="px-4 py-4 text-right">
                      {leave.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleStatusChange(leave.id, 'approved')}
                            disabled={actionLoading === leave.id}
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-700 hover:text-white transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            aria-label="Setujui"
                          >
                            {actionLoading === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                          </button>
                          <button 
                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                            disabled={actionLoading === leave.id}
                            className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-700 hover:text-white transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            aria-label="Tolak"
                          >
                            {actionLoading === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={16} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}