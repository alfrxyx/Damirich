import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react'; 
import './PulseButton.css';
import './ManageKaryawan.css';
import { 
    Plus, 
    Search, 
    Trash2, 
    User, 
    Briefcase, 
    QrCode, 
    X, 
    CheckCircle, 
    XCircle,
    Download,
    Loader2,
    AlertTriangle
} from 'lucide-react';

// Pastikan file ini ada di folder yang sama. 
// Jika tidak ada, buat file DonateButton.css dan isi dengan CSS tombol sebelumnya.
import './DonateButton.css'; 

interface Employee {
    id: number;
    name: string;
    email: string;
    divisi_id: number;
    divisi?: { name: string };
    tanggal_masuk: string;
    attendance_token: string | null; // Allow null agar tidak error
}

const DEPARTMENTS = [
    { id: '1', name: 'IT' },
    { id: '2', name: 'HRD' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'Finance' },
];

export default function ManageKaryawan() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // STATE MODAL QR CODE
    const [qrModalData, setQrModalData] = useState<{name: string, token: string | null} | null>(null);

    const [employeeToDelete, setEmployeeToDelete] = useState<{ id: number; name: string } | null>(null);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        divisi_id: '1',
        tanggal_masuk: new Date().toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const token = sessionStorage.getItem('auth_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/karyawan`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Pastikan data array
            setEmployees(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error('Gagal mengambil data karyawan:', error);
            setToast({ message: 'Gagal memuat data karyawan.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/admin/karyawan`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ message: 'Karyawan berhasil ditambahkan!', type: 'success' });
            setIsModalOpen(false);
            fetchEmployees();
            setFormData({
                name: '',
                email: '',
                password: '',
                divisi_id: '1',
                tanggal_masuk: new Date().toISOString().split('T')[0],
            });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.';
            setToast({ message: `Gagal: ${msg}`, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (id: number, name: string) => {
        setEmployeeToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!employeeToDelete) return;
        try {
            await axios.delete(`${API_URL}/admin/karyawan/${employeeToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
            setToast({ message: 'Karyawan berhasil dihapus.', type: 'success' });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal menghapus karyawan.';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (svg && qrModalData?.name) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `QR_${qrModalData.name.replace(/\s+/g, '_')}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                }
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const filteredEmployees = useMemo(() => {
        if (!search) return employees;
        const q = search.toLowerCase();
        return employees.filter(
            (emp) =>
                (emp.name && emp.name.toLowerCase().includes(q)) ||
                (emp.email && emp.email.toLowerCase().includes(q))
        );
    }, [employees, search]);

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg font-medium flex items-center gap-2 ${
                            toast.type === 'success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Karyawan</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data pegawai dan token absensi</p>
                </div>
                
                <button
                    className="btn-donate flex items-center justify-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                    style={{ '--size': '0.9rem' } as React.CSSProperties}
                >
                    <Plus size={20} /> 
                    <span>Tambah Karyawan</span>
                </button>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3"
            >
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari nama atau email karyawan..."
                    className="flex-1 outline-none text-sm placeholder:text-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </motion.div>

            {/* Tabel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 text-left">Nama Lengkap</th>
                                <th className="px-6 py-4 text-left">Divisi</th>
                                <th className="px-6 py-4 text-left">Tanggal Masuk</th>
                                <th className="px-6 py-4 text-center">QR Code</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                            <span className="text-gray-500">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                        {search ? 'Tidak ada karyawan yang cocok.' : 'Belum ada data karyawan.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <motion.tr
                                        key={emp.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{emp.name || 'Tanpa Nama'}</div>
                                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                                                {emp.divisi?.name || 'Staff'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{emp.tanggal_masuk}</td>
                                        
                                        {/* KOLOM QR CODE */}
                                        {/* KOLOM QR CODE */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setQrModalData({ name: emp.name, token: emp.attendance_token })}
                                                className="btn-pulse" // <--- Gunakan class baru ini
                                            >
                                                <QrCode size={14} /> 
                                                <span>Lihat QR</span>
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openDeleteModal(emp.id, emp.name)}
                                                className="btn-pulse-red" // <--- Pakai class merah yang baru
                                                title="Hapus Karyawan"
                                            >
                                                <Trash2 size={14} />
                                                <span>Hapus</span>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* MODAL LIHAT QR CODE */}
            <AnimatePresence>
                {qrModalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setQrModalData(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-blue-600 p-6 text-center text-white relative">
                                <button 
                                    onClick={() => setQrModalData(null)}
                                    className="absolute top-4 right-4 text-blue-200 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                                <h3 className="text-xl font-bold">ID Card Digital</h3>
                                <p className="text-blue-100 text-sm mt-1">{qrModalData.name}</p>
                            </div>
                            
                            <div className="p-8 flex flex-col items-center">
                                <div className="bg-white p-2 border-2 border-dashed border-gray-200 rounded-xl mb-6">
                                    {qrModalData.token ? (
                                        <QRCodeSVG 
                                            id="qr-code-svg"
                                            value={qrModalData.token} 
                                            size={200} 
                                            level="H"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-sm font-medium">
                                            <AlertTriangle size={32} className="mb-2 opacity-50"/>
                                            Token Belum Digenerate
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 text-center w-full mb-6">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Token ID</p>
                                    <p className="font-mono text-gray-700 font-bold break-all text-sm select-all">
                                        {qrModalData.token || 'KOSONG'}
                                    </p>
                                </div>

                                <button 
                                    onClick={downloadQR}
                                    disabled={!qrModalData.token}
                                    className="btn-donate w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ '--radii': '0.75rem', '--size': '0.9rem' } as React.CSSProperties}
                                >
                                    <Download size={18} /> Download / Cetak
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL TAMBAH & HAPUS (KODE SAMA SEPERTI SEBELUMNYA) */}
            {/* Saya perpendek bagian ini agar tidak terlalu panjang, tapi pastikan kode Modal Tambah & Hapus tetap ada di file aslimu ya! */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                                <h3 className="font-bold text-lg text-gray-800">Tambah Karyawan Baru</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            placeholder="Contoh: Budi Santoso"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Perusahaan</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="nama@kantor.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                        <input
                                            type="text"
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            placeholder="Min. 6 karakter"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Masuk</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={formData.tanggal_masuk}
                                            onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Divisi</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition"
                                            value={formData.divisi_id}
                                            onChange={(e) => setFormData({ ...formData, divisi_id: e.target.value })}
                                        >
                                            {DEPARTMENTS.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-donate w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{ '--radii': '0.5rem' } as React.CSSProperties}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            'Simpan & Generate Token'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL HAPUS KONFIRMASI */}
            <AnimatePresence>
                {isDeleteModalOpen && employeeToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                                        <AlertTriangle className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Karyawan?</h3>
                                <p className="text-gray-600 mb-6">
                                    Yakin ingin menghapus <span className="font-semibold text-gray-900">{employeeToDelete.name}</span>?<br />
                                    <span className="text-sm text-rose-600">Data absensi mereka juga akan hilang.</span>
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    
                                    {/* --- TOMBOL HAPUS BARU (Style Logout) --- */}
                                    <button
                                        onClick={handleDelete}
                                        className="btn-logout justify-center"
                                        style={{ padding: '0.6em 1em' }} 
                                    >
                                        <span className="z-10">HAPUS</span>
                                    </button>
                                    {/* --------------------------------------- */}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}