import { useState, useEffect } from 'react';
import axios from 'axios';
import QRScannerModal from '../components/QRScannerModal';
import { 
  MapPin, 
  Loader2, 
  AlertCircle, 
  PartyPopper, 
  QrCode, 
  LogOut, 
  User,
  History
} from 'lucide-react';
import './DonateButton.css';

export default function Dashboard() {
  // --- STATE DATA ---
  const [user, setUser] = useState<any>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const token = sessionStorage.getItem('auth_token');

  // --- STATE UI ---
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentAttendanceType, setCurrentAttendanceType] = useState<'clock-in' | 'clock-out' | null>(null);
  const [greeting, setGreeting] = useState('');

  // --- STATE UNTUK ERROR & LOADING (tetap diperlukan untuk proses pasca-scan) ---
  const [qrModalLoading, setQrModalLoading] = useState(false);
  const [qrModalError, setQrModalError] = useState('');

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
    const userString = sessionStorage.getItem('user_info');
    if (userString) setUser(JSON.parse(userString));
    if (!token) window.location.href = '/login';
    
    // Logic Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

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
    setShowQrModal(true);
  };

  // --- LOGIC SETELAH SCAN BERHASIL ---
// --- LOGIC SETELAH SCAN BERHASIL ---
const handleScanResult = async (qrContent: string) => {
  setQrModalLoading(true);
  setQrModalError('');

  try {
    const position = await getCurrentLocation();
    
    const payload = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      metode: 'qr',
      qr_content: qrContent
    };

    await axios.post(`${API_URL}/absensi/${currentAttendanceType}`, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    // ✅ Setelah absen berhasil, ambil data terbaru
    await fetchRiwayat();
    setShowQrModal(false);

    // Opsional: beri feedback sukses
    alert(`Absensi ${currentAttendanceType === 'clock-in' ? 'Masuk' : 'Pulang'} berhasil!`);

} catch (err: any) {
  console.error("Error Absen:", err);

  // ✅ Gunakan HTTP status, bukan teks pesan
  if (err.response?.status === 403) {
    // "Belum jam pulang"
    setQrModalError('Belum jam pulang! Jam pulang adalah pukul 15:00.');
    // Jangan tutup modal → user bisa coba lagi
    return;
  }

  if (err.response?.status === 409) {
    // "Sudah absen"
    setQrModalError(err.response.data.message);
    setShowQrModal(false);
    return;
  }

  if (err.response?.status === 401) {
    // "QR Code salah"
    setQrModalError('QR Code salah! Scan QR Anda sendiri.');
    setShowQrModal(false);
    return;
  }

  // Error lain
  const errorMsg = err.response?.data?.message || "Gagal absen.";
  setQrModalError(errorMsg);
  // Biarkan modal terbuka untuk coba ulang
} finally {
    setQrModalLoading(false);
  }
};

  // Status Badge Class
  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'tepat waktu': return 'bg-emerald-100 text-emerald-700';
      case 'terlambat': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER (TETAP SAMA) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100">
            {user?.name?.charAt(0) || <User />}
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Karyawan'}</h1>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-3xl font-bold text-gray-800 font-mono tracking-tight">
             {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
           </p>
           <p className="text-gray-400 text-sm font-medium">
             {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
           </p>
        </div>
      </div>

      {/* 2. AREA KONTEN */}
      <div className="space-y-6">
        
        {/* Card Absensi Hari Ini */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
           <div className="flex items-center gap-2 mb-6">
              <MapPin className="text-red-500" size={20} />
              <h3 className="font-bold text-gray-800">Status Absensi</h3>
           </div>

           {/* Grid Jam */}
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl border ${checkInTime ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Masuk</p>
                 <p className={`text-2xl font-bold ${checkInTime ? 'text-green-700' : 'text-gray-400'}`}>
                    {checkInTime || '--:--'}
                 </p>
              </div>
              <div className={`p-4 rounded-xl border ${checkOutTime ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pulang</p>
                 <p className={`text-2xl font-bold ${checkOutTime ? 'text-red-700' : 'text-gray-400'}`}>
                    {checkOutTime || '--:--'}
                 </p>
              </div>
           </div>

           {/* Tombol Action */}
           <div>
              {!checkInTime ? (
                  <button
                      onClick={() => handleOpenQrModal('clock-in')}
                      className="btn-donate w-full flex items-center justify-center gap-2"
                      style={{ '--radii': '0.75rem', '--size': '1rem' } as React.CSSProperties}
                  >
                      <QrCode size={18} /> 
                      <span>Scan Masuk</span>
                  </button>
              ) : !checkOutTime ? (
                  <button
                      onClick={() => handleOpenQrModal('clock-out')}
                      className="btn-donate w-full flex items-center justify-center gap-2"
                      style={{ 
                          '--radii': '0.75rem', 
                          '--size': '1rem',
                          '--btn-bg-1': 'hsla(0, 100%, 81%, 1.00)', 
                          '--btn-bg-2': 'hsla(0, 100%, 39%, 1.00)',
                          '--btn-bg-color': 'hsla(360 100% 100% / 1)',
                      } as React.CSSProperties}
                  >
                      <LogOut size={18} /> 
                      <span>Scan Pulang</span>
                  </button>
              ) : (
                  <div className="w-full py-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-center gap-2">
                      <PartyPopper size={20} /> 
                      <span className="font-semibold">Absensi Selesai!</span>
                  </div>
              )}
           </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
           <div className="flex items-center gap-2 mb-4">
              <History className="text-blue-500" size={20} />
              <h3 className="font-bold text-gray-800">Riwayat Terakhir</h3>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="text-gray-400 font-medium text-xs uppercase border-b border-gray-100">
                    <tr>
                       <th className="py-3 px-2">Tanggal</th>
                       <th className="py-3 px-2">Jam</th>
                       <th className="py-3 px-2">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {riwayat.length > 0 ? riwayat.slice(0,3).map((item) => (
                       <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 font-medium text-gray-700">{item.tanggal}</td>
                          <td className="py-3 px-2 text-gray-600">
                             <span className="text-green-600">{item.jam_masuk}</span> 
                             <span className="mx-1 text-gray-300">/</span>
                             <span className="text-red-600">{item.jam_pulang || '-'}</span>
                          </td>
                          <td className="py-3 px-2">
                             <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClass(item.status)}`}>
                                {item.status}
                             </span>
                          </td>
                       </tr>
                    )) : (
                       <tr><td colSpan={3} className="py-6 text-center text-gray-400">Belum ada data</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

      </div>

      {/* ✅ MODAL BARU: SCAN QR DENGAN KAMERA */}
      <QRScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleScanResult} // ← tetap pakai fungsi asli Anda
        attendanceType={currentAttendanceType || 'clock-in'}
        error={qrModalError} // ← Tambahkan baris ini
      />
    </div>
  );
}