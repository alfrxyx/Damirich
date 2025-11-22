import { Clock, MapPin, Loader2, AlertCircle, PartyPopper, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios'; 

export default function Dashboard() {
	// State Data & Konfigurasi
	const [checkInTime, setCheckInTime] = useState<string | null>(null);
	const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
	const [riwayat, setRiwayat] = useState<any[]>([]);
	const token = localStorage.getItem('auth_token');

	// State UI
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showQrModal, setShowQrModal] = useState(false);
	const [currentAttendanceType, setCurrentAttendanceType] = useState<'clock-in' | 'clock-out' | null>(null);

	// QR Modal State
	const [qrInput, setQrInput] = useState('');
	const [qrModalLoading, setQrModalLoading] = useState(false);
	const [qrModalError, setQrModalError] = useState('');

	// URL API Langsung
	const API_URL = 'http://127.0.0.1:8000/api';


	// --- FETCH DATA (Riwayat & Status Hari Ini) ---
	const fetchRiwayat = async () => {
		const currentToken = localStorage.getItem('auth_token');
		if (!currentToken) return;

		try {
			const response = await axios.get(`${API_URL}/absensi/riwayat`, {
				headers: { Authorization: `Bearer ${currentToken}` }
			});
			
			// FIX 1: Memastikan response.data.data adalah array agar riwayat.map tidak crash.
			const dataRiwayat = response.data && Array.isArray(response.data.data) 
                                ? response.data.data 
                                : [];
			
			setRiwayat(dataRiwayat);

			// Cek Status Hari Ini dari data terbaru
			if (dataRiwayat.length > 0) {
				const latest = dataRiwayat[0]; 
				
                // FIX 2: Menggunakan perbandingan tanggal string ISO untuk menghindari bug timezone
                const latestDate = new Date().toISOString().split('T')[0];
                const todayDate = new Date().toISOString().split('T')[0];

                if (latestDate === todayDate) {
					setCheckInTime(latest.jam_masuk);
					setCheckOutTime(latest.jam_pulang);
				} else {
					setCheckInTime(null);
					setCheckOutTime(null);
				}
			} else {
				setCheckInTime(null);
				setCheckOutTime(null);
			}
		} catch (err: any) {
			console.error("Gagal load data riwayat (Kemungkinan CORS/Network):", err.message || err);
			// Jika gagal, pastikan state error di reset
			setError("Gagal memuat status kehadiran (Server/CORS Error).");
		}
	};

	useEffect(() => {
		fetchRiwayat();
		// Jika token tidak ada, logout.
		if (!token) window.location.href = '/login'; 
	}, []);

	// --- LOGIC GPS ---
	const getCurrentLocation = (): Promise<GeolocationPosition> => {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error("Browser tidak support GPS"));
			} else {
				// Tambahkan timeout dan high accuracy
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
				});
			}
		});
	};

	// --- LOGIC TOMBOL UTAMA (Buka Modal) ---
	const handleOpenQrModal = (type: 'clock-in' | 'clock-out') => {
		setCurrentAttendanceType(type);
		setQrModalError('');
		setQrInput('');
		setShowQrModal(true);
	};

	// --- LOGIC SUBMIT ABSEN QR + GPS ---
	const handleQrSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setQrModalError('');
		setQrModalLoading(true);

		if (!qrInput && currentAttendanceType === 'clock-in') {
			setQrModalError('Token QR wajib diisi untuk Clock In.');
			setQrModalLoading(false);
			return;
		}
        
        // Atur qrContentToSend: hanya wajib saat clock-in
        const qrContentToSend = currentAttendanceType === 'clock-in' ? qrInput : (qrInput || ''); 


		try {
			// 1. Ambil Lokasi Dulu 
			const position = await getCurrentLocation();
			const lat = position.coords.latitude;
			const long = position.coords.longitude;

			// 2. Kirim ke Backend
			const formData = new FormData();
			formData.append('latitude', lat.toString());
			formData.append('longitude', long.toString());
			formData.append('metode', 'qr'); 
			formData.append('qr_content', qrContentToSend); 
            // PENTING: Back-End Clock-Out tidak wajib QR, tapi kita kirim metodenya

			const endpoint = `${API_URL}/absensi/${currentAttendanceType}`;
			
			const response = await axios.post(endpoint, formData, {
				headers: { 
					Authorization: `Bearer ${token}`, 
					'Content-Type': 'multipart/form-form-data'
				}
			});
            
            // 3. Sukses: Tampilkan notifikasi
            alert(response.data.message || "Absensi berhasil diproses.");

			// 4. Sukses & Tutup Modal
			setShowQrModal(false);
			// REFRESH DATA DENGAN ASYNC CALL
			await fetchRiwayat(); 

		} catch (err: any) {
			console.error("Error Absen:", err);
            // Menangkap error dari backend dengan aman
			const msg = err.response?.data?.message || "Gagal absen. Pastikan GPS aktif, token benar, atau Server berjalan.";
            setQrModalError(msg);
		} finally {
			setQrModalLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full"> 
			
			{/* HEADER */}
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-500 text-sm">Selamat datang! Jangan lupa absen hari ini.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				
				{/* KIRI: TABEL RIWAYAT */}
				<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Kehadiran</h2>
					
					{riwayat.length > 0 ? (
						<div className="overflow-hidden rounded-lg border border-gray-100">
							<table className="w-full text-sm text-left">
								<thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
									<tr>
										<th className="px-4 py-3">Tanggal</th>
										<th className="px-4 py-3">Masuk</th>
										<th className="px-4 py-3">Pulang</th>
										<th className="px-4 py-3">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{riwayat.map((item) => (
										<tr key={item.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 py-3 text-gray-600">{item.tanggal}</td>
											<td className="px-4 py-3 text-green-600 font-medium">{item.jam_masuk}</td>
											<td className="px-4 py-3 text-red-600 font-medium">{item.jam_pulang || '-'}</td>
											<td className="px-4 py-3">
												<span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
													{item.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center bg-gray-50/50">
							<div className="inline-flex p-3 rounded-full bg-gray-100 mb-3 text-gray-400">
								<Clock className="w-6 h-6" />
							</div>
							<p className="text-gray-500">Belum ada data riwayat.</p>
						</div>
					)}
				</div>

				{/* KANAN: WIDGET ABSENSI */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
					
					<div className="flex flex-col gap-4">
						
						{/* Alert Error */}
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start text-red-600 text-sm">
								<AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
								<span>{error}</span>
							</div>
						)}

						{/* STATUS HARI INI (BOX BIRU) */}
						<div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
							<div className="flex items-center gap-2 mb-3 text-blue-700">
								<MapPin className="w-4 h-4" />
								<span className="font-medium text-sm">Status Hari Ini</span>
							</div>
							
							<div className="space-y-2 text-sm">
								<div className="flex justify-between items-center">
									<span className="text-gray-500">Masuk</span>
									<span className="font-semibold text-gray-900 font-mono">
										{checkInTime || '--:--:--'}
									</span>
								</div>
								<div className="flex justify-between items-center pt-2 border-t border-blue-100">
									<span className="text-gray-500">Pulang</span>
									<span className="font-semibold text-gray-900 font-mono">
										{checkOutTime || '--:--:--'}
									</span>
								</div>
							</div>
						</div>

						{/* TOMBOL AKSI */}
						<div className="flex flex-col gap-2">
							{!checkInTime ? (
								// KONDISI 1: BELUM MASUK -> TAMPILKAN TOMBOL CHECK IN (Buka Modal)
								<button
									onClick={() => handleOpenQrModal('clock-in')}
									disabled={loading}
									className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
								>
									<QrCode className="w-4 h-4" /> Check In (Scan QR)
								</button>
							) : !checkOutTime ? (
								// KONDISI 2: SUDAH MASUK, BELUM PULANG -> TAMPILKAN TOMBOL CHECK OUT (Buka Modal)
								<button
									onClick={() => handleOpenQrModal('clock-out')}
									disabled={loading}
									className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
								>
									<QrCode className="w-4 h-4" /> Check Out (Scan QR)
								</button>
							) : (
								// KONDISI 3: SUDAH SELESAI
								<div className="w-full py-3 bg-green-50 text-green-700 rounded-lg font-medium text-sm border border-green-200 flex items-center justify-center gap-2 shadow-sm">
									<PartyPopper className="w-4 h-4" /> Absensi Selesai
								</div>
							)}
						</div>

					</div>
				</div>

			</div>
			
			{/* --- MODAL INPUT QR CODE --- */}
			{showQrModal && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
					<form onSubmit={handleQrSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
							<QrCode className="w-5 h-5 text-blue-600" />
							{currentAttendanceType === 'clock-in' ? 'Scan QR Masuk' : 'Scan QR Pulang'}
						</h3>
						
						{qrModalError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
								{qrModalError}
							</div>
						)}

						<p className="text-sm text-gray-600">
							Arahkan kamera ke QR Code di layar kantor atau masukkan token manual.
						</p>

						{/* Input Token Manual */}
						<div>
							<label className="text-sm font-medium text-gray-700 mb-1 block">Token QR (Manual)</label>
							<input
								type="text"
								value={qrInput}
								onChange={(e) => setQrInput(e.target.value)}
								placeholder="Masukkan Token atau Scan"
								disabled={qrModalLoading}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 font-mono uppercase"
								required
							/>
						</div>
						
						<div className="flex justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={() => setShowQrModal(false)}
								disabled={qrModalLoading}
								className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={qrModalLoading}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
							>
								{qrModalLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Validasi...
									</>
								) : (
									'Submit & Check'
								)}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}