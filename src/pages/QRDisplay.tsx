import React, { useState, useEffect } from 'react';
import { RefreshCw, QrCode } from 'lucide-react';
import api from '../api';

const QR_REFRESH_INTERVAL = 30000; // 30 detik

export default function QRDisplay() {
  const [qrSvg, setQrSvg] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [timer, setTimer] = useState(QR_REFRESH_INTERVAL / 1000);

  const fetchQR = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/company/generate-qr');
      setQrSvg(response.data.qr_image);
      setToken(response.data.token_saat_ini);
      setTimer(QR_REFRESH_INTERVAL / 1000); // Reset timer
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat QR Code. Cek koneksi backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQR(); // Fetch pertama kali saat komponen dimuat

    const intervalId = setInterval(() => {
      fetchQR();
    }, QR_REFRESH_INTERVAL); // Atur interval fetch setiap 30 detik

    // Timer Hitung Mundur
    const timerId = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : QR_REFRESH_INTERVAL / 1000));
    }, 1000);

    // Bersihkan interval saat komponen dilepas
    return () => {
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        
        <h1 className="text-3xl font-bold text-gray-800">QR Code Absensi Kantor</h1>
        <p className="text-gray-500">Scan QR ini untuk Check In/Check Out. QR akan berganti secara otomatis.</p>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg">{error}</div>
        )}

        <div className="flex justify-center items-center h-64 w-full bg-blue-50/50 rounded-xl border-4 border-blue-600 border-dashed p-4 relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Memuat...</p>
            </div>
          ) : qrSvg ? (
            // Render QR Code dari SVG string
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-56 h-56" />
          ) : (
            <QrCode className="w-16 h-16 text-gray-300" />
          )}

          {/* Timer Hitung Mundur */}
          <div className="absolute bottom-3 right-3 text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200">
            {timer}s hingga refresh
          </div>

        </div>

        {/* Info Token (Hanya untuk Debug) */}
        <div className="text-xs text-gray-500 font-mono pt-4 border-t border-gray-100">
          Token Aktif: {token || 'N/A'}
        </div>
      </div>
    </div>
  );
}