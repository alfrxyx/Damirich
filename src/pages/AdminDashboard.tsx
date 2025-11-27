import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, BarChart2, Users, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// =========================================================
// TIPE DATA
// =========================================================
interface Stats {
    total_employees: number;
    present_today: number;
    late_entries: number;
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
    
    // State QR
    const [qrContent, setQrContent] = useState<string | null>(null);
    const [qrExpires, setQrExpires] = useState<string | null>(null);

    // State Loading & Error
    const [isLoading, setIsLoading] = useState(true);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1. Fetch Data Stats
    const fetchData = async () => {
        if (!authToken) return;
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const resStats = await axios.get(`${API_URL}/admin/dashboard-harian`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if(resStats.data.stats) setStats(resStats.data.stats);

        } catch (error: any) {
            console.error("Gagal load dashboard:", error);
            if (error.response?.status === 403) {
                setErrorMsg("Akses Ditolak! Anda login sebagai Karyawan Biasa, bukan Admin.");
            } else {
                setErrorMsg("Gagal memuat data stats. Pastikan server backend menyala.");
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

    if (!authToken) return <div className="p-10 text-center text-red-600">Silakan Login Kembali.</div>;
    
    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-500 text-sm">Pusat kontrol absensi karyawan.</p>
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
                
                {/* 2. QR CODE (Full Width di layar kecil, sebagian di layar besar) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                        <QrCode className="w-5 h-5 mr-2 text-indigo-600"/> Token Absensi Harian
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                        {qrContent ? (
                            <div className="p-4 border-4 border-indigo-100 rounded-xl bg-white shadow-lg">
                                <QRCodeSVG value={qrContent} size={200} />
                            </div>
                        ) : (
                            <div className="h-48 w-full max-w-md bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                                <QrCode size={48} className="mb-3 opacity-20" />
                                Klik tombol di bawah untuk generate QR
                            </div>
                        )}

                        {qrContent && (
                            <div className="text-center">
                                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-mono font-bold mb-2 border border-indigo-100">
                                    {qrContent}
                                </div>
                                {qrExpires && <p className="text-sm text-red-500 font-semibold flex justify-center items-center"><Clock size={14} className="mr-1"/> Kadaluarsa: {qrExpires}</p>}
                            </div>
                        )}

                        <button 
                            onClick={generateToken}
                            disabled={isQrLoading}
                            className="w-full max-w-md py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isQrLoading ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <QrCode className="w-5 h-5 mr-2" />}
                            {isQrLoading ? 'Sedang Membuat Token...' : 'Generate QR Code Baru'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}