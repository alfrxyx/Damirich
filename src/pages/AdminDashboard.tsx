import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, BarChart2, Users, QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    status: string;
}

const API_URL = 'http://127.0.0.1:8000/api';

// =========================================================
// KOMPONEN STAT CARD
// =========================================================
const StatCard: React.FC<{ icon: React.ElementType, title: string, value: number | undefined, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-100 transition hover:shadow-md">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value !== undefined ? value : '-'}</p>
        </div>
    </div>
);

// =========================================================
// HALAMAN UTAMA DASHBOARD
// =========================================================
export default function AdminDashboard() {
    const [authToken] = useState(localStorage.getItem('auth_token'));
    
    // State Data
    const [stats, setStats] = useState<Stats>({ total_employees: 0, present_today: 0, late_entries: 0 });
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    
    // State QR
    const [qrContent, setQrContent] = useState<string | null>(null);
    const [qrExpires, setQrExpires] = useState<string | null>(null);

    // State Loading & Error
    const [isLoading, setIsLoading] = useState(true);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1. Fetch Data
    const fetchData = async () => {
        if (!authToken) return;
        setIsLoading(true);
        setErrorMsg(null);

        try {
            // Ambil Stats
            const resStats = await axios.get(`${API_URL}/admin/dashboard-harian`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Ambil Cuti
            const resLeaves = await axios.get(`${API_URL}/admin/leaves`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if(resStats.data.stats) setStats(resStats.data.stats);
            if(resLeaves.data.data) setLeaves(resLeaves.data.data);

        } catch (error: any) {
            console.error("Gagal load dashboard:", error);
            if (error.response?.status === 403) {
                setErrorMsg("Akses Ditolak! Anda login sebagai Karyawan Biasa, bukan Admin.");
            } else {
                setErrorMsg("Gagal memuat data. Pastikan server backend menyala.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [authToken]);

    // 2. Generate QR
    const generateToken = async () => {
        setIsQrLoading(true);
        try {
            const response = await axios.post(`${API_URL}/admin/generate-token`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setQrContent(response.data.token_saat_ini);
            setQrExpires(new Date(response.data.expires_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        } catch (error) {
            alert("Gagal generate QR Code");
        } finally {
            setIsQrLoading(false);
        }
    };

    // 3. Approve/Reject Cuti (INI LOGIKA TOMBOLNYA)
    const handleStatusChange = async (id: number, newStatus: string) => {
        if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        setActionLoading(id);
        try {
            await axios.put(`${API_URL}/admin/leaves/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            // Update lokal biar cepet (tanpa reload)
            setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
            alert(`Berhasil mengubah status menjadi: ${newStatus}`);
        } catch (error) {
            alert('Gagal update status.');
        } finally {
            setActionLoading(null);
        }
    };

    // Helper
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Disetujui</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Ditolak</span>;
            default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Menunggu</span>;
        }
    };

    // TAMPILAN JIKA ERROR / LOADING
    if (!authToken) return <div className="p-10 text-center text-red-600">Silakan Login Kembali.</div>;
    
    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-500 text-sm">Pusat kontrol absensi & cuti karyawan.</p>
                </div>
                <button onClick={fetchData} className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600" title="Refresh Data">
                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {errorMsg}
                </div>
            )}

            {/* 1. STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Users} title="Total Karyawan" value={stats.total_employees} color="text-blue-600" />
                <StatCard icon={BarChart2} title="Sudah Absen" value={stats.present_today} color="text-green-600" />
                <StatCard icon={AlertTriangle} title="Terlambat" value={stats.late_entries} color="text-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. QR CODE (Kiri) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                        <QrCode className="w-5 h-5 mr-2 text-indigo-600"/> Token Absensi
                    </h3>
                    
                    <div className="flex flex-col items-center space-y-4">
                        {qrContent ? (
                            <div className="p-3 border-2 border-dashed border-indigo-200 rounded-lg bg-indigo-50">
                                <QRCodeSVG value={qrContent} size={160} />
                            </div>
                        ) : (
                            <div className="h-40 w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                                <QrCode size={40} className="mb-2 opacity-20" />
                                Klik tombol di bawah
                            </div>
                        )}

                        {qrContent && (
                            <div className="text-center w-full">
                                <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all mb-2 border">
                                    {qrContent}
                                </div>
                                {qrExpires && <p className="text-xs text-red-500 font-semibold flex justify-center items-center"><Clock size={12} className="mr-1"/> Exp: {qrExpires}</p>}
                            </div>
                        )}

                        <button 
                            onClick={generateToken}
                            disabled={isQrLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow flex justify-center items-center disabled:bg-indigo-300"
                        >
                            {isQrLoading ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
                            {isQrLoading ? 'Memproses...' : 'Generate QR Baru'}
                        </button>
                    </div>
                </div>

                {/* 3. TABEL PERMOHONAN CUTI (Kanan - INI BAGIAN BARUNYA) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600"/> Approval Cuti
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {leaves.filter(l => l.status === 'pending').length} Pending
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Alasan</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading && leaves.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
                                ) : leaves.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada permohonan cuti.</td></tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{leave.karyawan?.nama}</div>
                                                <div className="text-xs text-gray-500">{leave.karyawan?.divisi?.nama}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700 font-medium">{formatDate(leave.start_date)}</div>
                                                <div className="text-xs text-gray-500">s/d {formatDate(leave.end_date)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="truncate max-w-[150px]" title={leave.reason}>{leave.reason}</div>
                                                <div className="text-xs text-gray-400 capitalize">{leave.type}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(leave.status)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {/* INI TOMBOL AKSI YANG KAMU CARI */}
                                                {leave.status === 'pending' ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'approved')}
                                                            disabled={actionLoading === leave.id}
                                                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-600 hover:text-white transition shadow-sm"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                            disabled={actionLoading === leave.id}
                                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition shadow-sm"
                                                            title="Tolak"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">Selesai</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}