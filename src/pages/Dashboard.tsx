import { Clock, MapPin, Loader2, AlertCircle, PartyPopper, QrCode, LogOut, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
    // State Data
    const [user, setUser] = useState<any>(null);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
    const [riwayat, setRiwayat] = useState<any[]>([]);
    const token = localStorage.getItem('auth_token');

    // State UI
    const [showQrModal, setShowQrModal] = useState(false);
    const [currentAttendanceType, setCurrentAttendanceType] = useState<'clock-in' | 'clock-out' | null>(null);

    // QR Modal State
    const [qrInput, setQrInput] = useState('');
    const [qrModalLoading, setQrModalLoading] = useState(false);
    const [qrModalError, setQrModalError] = useState('');
    const [modalStatus, setModalStatus] = useState(''); 

    const API_URL = 'http://127.0.0.1:8000/api';

    // --- FETCH DATA ---
    const fetchRiwayat = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/absensi/riwayat`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const dataRiwayat = response.data && Array.isArray(response.data.data) ? response.data.data : [];
            setRiwayat(dataRiwayat);

            if (dataRiwayat.length > 0) {
                const latest = dataRiwayat[0]; 
                const latestDate = new Date(latest.tanggal).toISOString().split('T')[0];
                const todayDate = new Date().toISOString().split('T')[0];

                if (latestDate === todayDate) {
                    setCheckInTime(latest.jam_masuk);
                    setCheckOutTime(latest.jam_pulang);
                }
            }
        } catch (err) {
            console.error("Gagal load riwayat");
        }
    };

    useEffect(() => {
        const userString = localStorage.getItem('user_info');
        if (userString) setUser(JSON.parse(userString));
        if (!token) window.location.href = '/login';
        fetchRiwayat();
    }, []);

    // --- LOGIC GPS ---
    const getCurrentLocation = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Browser tidak support GPS"));
            } else {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true, timeout: 10000, maximumAge: 0
                });
            }
        });
    };

    const handleOpenQrModal = (type: 'clock-in' | 'clock-out') => {
        setCurrentAttendanceType(type);
        setQrModalError('');
        setQrInput('');
        setModalStatus('');
        setShowQrModal(true);
    };

    // --- LOGIC SUBMIT ---
    const handleQrSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setQrModalError('');
        
        if (!qrInput && currentAttendanceType === 'clock-in') {
            setQrModalError('Scan QR atau Masukkan Token.');
            return;
        }

        setQrModalLoading(true);

        try {
            // 1. Cari Lokasi
            setModalStatus('Mencari lokasi GPS...');
            const position = await getCurrentLocation();
            
            // 2. Kirim Data JSON
            setModalStatus('Memverifikasi Absensi...');
            const payload = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                metode: 'qr',
                qr_content: qrInput || '' 
            };

            await axios.post(`${API_URL}/absensi/${currentAttendanceType}`, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            alert("Berhasil! Absensi tercatat.");
            setShowQrModal(false);
            fetchRiwayat(); 

        } catch (err: any) {
            console.error("Error Absen:", err);
            if (err.code === 1) setQrModalError("Izinkan akses lokasi browser.");
            else if (err.code === 2 || err.code === 3) setQrModalError("Gagal dapat lokasi. Pastikan GPS aktif.");
            else setQrModalError(err.response?.data?.message || "Gagal absen. Coba lagi.");
        } finally {
            setQrModalLoading(false);
            setModalStatus('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Halo, {user?.name || 'Karyawan'}! 👋</h1>
                        <p className="text-blue-100 flex items-center gap-2"><Briefcase size={14} /> {user?.email}</p>
                    </div>
                </div>
                <div className="text-right hidden md:block bg-white/10 p-3 rounded-xl">
                    <p className="text-3xl font-bold font-mono">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm text-blue-200">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KIRI: ID CARD */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center text-center">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                        <QrCode className="w-5 h-5 text-blue-600"/> ID Card Digital
                    </h3>
                    <div className="p-4 border-4 border-blue-50 rounded-2xl bg-white shadow-sm mb-5">
                        {user?.attendance_token ? (
                            <QRCodeSVG value={user.attendance_token} size={180} />
                        ) : <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-xl">Token Kosong</div>}
                    </div>
                    <div className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 break-all text-center">
                        {user?.attendance_token || '-'}
                    </div>
                </div>

                {/* KANAN: TOMBOL & RIWAYAT */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500"/> Absensi Harian</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                <span className="text-xs text-green-600 font-bold uppercase">Jam Masuk</span>
                                <p className="text-xl font-bold text-green-800 mt-1">{checkInTime || '--:--'}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                <span className="text-xs text-red-600 font-bold uppercase">Jam Pulang</span>
                                <p className="text-xl font-bold text-red-800 mt-1">{checkOutTime || '--:--'}</p>
                            </div>
                        </div>
                        {!checkInTime ? (
                            <button onClick={() => handleOpenQrModal('clock-in')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
                                <QrCode size={20} /> Scan Masuk (ID Card)
                            </button>
                        ) : !checkOutTime ? (
                            <button onClick={() => handleOpenQrModal('clock-out')} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
                                <LogOut size={20} /> Scan Pulang
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-center border-2 border-dashed border-gray-300">✅ Absensi Selesai</div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Riwayat Terakhir</h3>
                        <div className="overflow-hidden rounded-lg border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Masuk</th><th className="px-4 py-3">Pulang</th><th className="px-4 py-3">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {riwayat.length > 0 ? riwayat.slice(0,3).map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.tanggal}</td>
                                            <td className="px-4 py-3 text-green-600 font-medium">{item.jam_masuk}</td>
                                            <td className="px-4 py-3 text-red-600">{item.jam_pulang || '-'}</td>
                                            <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{item.status}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan={4} className="p-4 text-center text-gray-400">Belum ada data.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL SCAN */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                            {currentAttendanceType === 'clock-in' ? 'Scan ID Card Anda' : 'Scan Pulang'}
                        </h3>
                        {qrModalError && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex gap-2 items-start"><AlertCircle size={16} className="mt-0.5 shrink-0"/>{qrModalError}</div>}
                        <form onSubmit={handleQrSubmit} className="space-y-4">
                            <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)} placeholder="Scan atau Masukkan Token ID Card" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-mono text-center text-lg" autoFocus />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button type="button" onClick={() => setShowQrModal(false)} className="py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={qrModalLoading} className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex justify-center items-center disabled:bg-blue-400">
                                    {qrModalLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {modalStatus || 'Proses...'}</> : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}