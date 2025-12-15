import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer, Download, Search, FileDown } from 'lucide-react';
import './DonateButton.css';

export default function Laporan() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [reportType, setReportType] = useState<'absensi' | 'cuti'>('absensi');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPDF, setLoadingPDF] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const token = sessionStorage.getItem('auth_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    const handleFilter = async () => {
        if (!startDate || !endDate) {
            alert('Silakan pilih periode tanggal');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                type: reportType
            });

            const response = await fetch(`${API_URL}/admin/laporan?${params}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) throw new Error('Gagal memuat laporan');

            const result = await response.json();
            setData(result.data || []);
        } catch (err: any) {
            const msg = err.message || 'Gagal memuat laporan. Cek koneksi atau coba lagi.';
            setError(msg);
            console.error('Laporan error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ⭐ FUNGSI DOWNLOAD PDF
    const handleDownloadPDF = async () => {
        if (!startDate || !endDate) {
            alert('Silakan pilih periode tanggal terlebih dahulu');
            return;
        }

        setLoadingPDF(true);
        
        try {
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                type: reportType
            });

            const response = await fetch(`${API_URL}/admin/laporan/export-pdf?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Gagal download PDF');
            }

            // Convert response ke blob
            const blob = await response.blob();
            
            // Buat URL download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-${reportType}-${startDate}-${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            // Success notification
            alert('PDF berhasil didownload!');
        } catch (error: any) {
            console.error('Error download PDF:', error);
            alert('Gagal download PDF. Pastikan backend sudah disetup dengan benar.');
        } finally {
            setLoadingPDF(false);
        }
    };

    const handleExportCSV = () => {
        if (data.length === 0) return alert('Tidak ada data untuk diexport.');

        let header = '';
        let rows = '';

        if (reportType === 'absensi') {
            header = 'Tanggal,Nama Karyawan,Jam Masuk,Jam Pulang,Status,Durasi\n';
            rows = data
                .map((row) => `"${row.tanggal}","${row.nama_karyawan}",${row.jam_masuk || '-'},${row.jam_pulang || '-'},${row.status},"${row.keterangan}"`)
                .join('\n');
        } else {
            header = 'Periode Cuti,Nama Karyawan,Jenis Cuti,Alasan,Status\n';
            rows = data
                .map((row) => `"${row.tanggal}","${row.nama_karyawan}","${row.jam_masuk}","${row.jam_pulang}",${row.status}`)
                .join('\n');
        }

        const csvContent = `data:text/csv;charset=utf-8,${header}${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = `Laporan_${reportType === 'absensi' ? 'Absensi' : 'Cuti'}_${startDate}_sd_${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    const getHeaderLabel = (key: string) => {
        if (reportType === 'absensi') {
            return { jam_masuk: 'Jam Masuk', jam_pulang: 'Jam Pulang' }[key] || key;
        } else {
            return { jam_masuk: 'Jenis Cuti', jam_pulang: 'Alasan' }[key] || key;
        }
    };

    const getStatusClass = (status: string) => {
        if (reportType === 'absensi') {
            return status === 'Terlambat' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
        } else {
            return status === 'Disetujui'
                ? 'bg-green-100 text-green-700'
                : status === 'Ditolak'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700';
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan & Rekap</h1>
                    <p className="text-sm text-gray-500 mt-1">Pilih periode dan jenis laporan untuk melihat data.</p>
                </div>
            </motion.div>

            {/* Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Laporan</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as 'absensi' | 'cuti')}
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
                        >
                            <option value="absensi">Absensi Kehadiran</option>
                            <option value="cuti">Rekap Pengajuan Cuti</option>
                        </select>
                    </div>
                    {/* --- TOMBOL TAMPILKAN BARU (Start) --- */}
                    <button
                        onClick={handleFilter}
                        disabled={loading}
                        className="btn-donate w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ '--radii': '0.5rem' } as React.CSSProperties} // Menyesuaikan radius dengan input field
                    >
                        {loading ? (
                            <>
                                {/* Spinner loading yang konsisten dengan halaman sebelumnya */}
                                <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                <span>Memuat...</span>
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                <span>Tampilkan</span>
                            </>
                        )}
                    </button>
                    {/* --- TOMBOL TAMPILKAN BARU (End) --- */}
                </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hasil Laporan */}
            <AnimatePresence>
                {hasSearched && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                Hasil Laporan {reportType === 'absensi' ? 'Absensi' : 'Cuti'} ({data.length} Data)
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                    <Printer size={16} /> Print
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={loadingPDF}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    {loadingPDF ? (
                                        <>
                                            <span className="h-2 w-2 bg-white rounded-full animate-ping"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={16} /> Download PDF
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <Download size={16} /> Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto p-4 sm:p-6">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 font-semibold">
                                        <th className="px-4 py-3 border-b">Tanggal</th>
                                        <th className="px-4 py-3 border-b">Nama Karyawan</th>
                                        <th className="px-4 py-3 border-b">{getHeaderLabel('jam_masuk')}</th>
                                        <th className="px-4 py-3 border-b">{getHeaderLabel('jam_pulang')}</th>
                                        <th className="px-4 py-3 border-b text-center">Status</th>
                                        {reportType === 'absensi' && <th className="px-4 py-3 border-b">Durasi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={reportType === 'absensi' ? 6 : 5}
                                                className="px-4 py-8 text-center text-gray-400 italic"
                                            >
                                                Tidak ada data pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 border-b font-mono text-gray-800">{row.tanggal}</td>
                                                <td className="px-4 py-3 border-b font-medium">{row.nama_karyawan}</td>
                                                <td className="px-4 py-3 border-b text-gray-700">{row.jam_masuk}</td>
                                                <td className="px-4 py-3 border-b text-gray-700">{row.jam_pulang}</td>
                                                <td className="px-4 py-3 border-b text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(row.status)}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                {reportType === 'absensi' && (
                                                    <td className="px-4 py-3 border-b text-gray-600">{row.keterangan}</td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}