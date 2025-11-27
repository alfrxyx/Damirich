import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, User, Briefcase, QrCode, X } from 'lucide-react';

// Tipe Data
interface Employee {
    id: number;
    name: string;
    email: string;
    divisi_id: number;
    divisi?: { name: string };
    tanggal_masuk: string;
    attendance_token: string;
}

export default function ManageKaryawan() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        divisi_id: '1',
        tanggal_masuk: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem('auth_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    // 1. Fetch Data Karyawan
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/karyawan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.data);
        } catch (error) {
            console.error("Gagal ambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // 2. Handle Submit Form Tambah
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/admin/karyawan`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Sukses! Karyawan berhasil ditambahkan.");
            setIsModalOpen(false);
            fetchEmployees(); // Refresh tabel
            
            // Reset Form
            setFormData({
                name: '',
                email: '',
                password: '',
                divisi_id: '1',
                tanggal_masuk: new Date().toISOString().split('T')[0]
            });
        } catch (error: any) {
            alert("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan"));
        } finally {
            setSubmitting(false);
        }
    };

    // === 3. HANDLE DELETE (FITUR BARU) ===
    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Yakin ingin menghapus karyawan "${name}"? \nData absensi mereka juga akan hilang.`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/admin/karyawan/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update tampilan tabel tanpa reload (Optimistic UI)
            setEmployees(employees.filter(emp => emp.id !== id));
            alert("Karyawan berhasil dihapus.");
            
        } catch (error: any) {
            alert("Gagal menghapus: " + (error.response?.data?.message || "Server Error"));
        }
    };

    // Filter Pencarian
    const filteredData = employees.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Karyawan</h1>
                    <p className="text-sm text-gray-500">Kelola data pegawai dan token absensi.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} /> Tambah Karyawan
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari nama atau email karyawan..." 
                    className="flex-1 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Tabel Karyawan */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Divisi</th>
                                <th className="px-6 py-4">Tanggal Masuk</th>
                                <th className="px-6 py-4 text-center">Token Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th> {/* KOLOM BARU */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Memuat data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Belum ada data karyawan.</td></tr>
                            ) : (
                                filteredData.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{emp.name}</div>
                                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                                                {emp.divisi?.name || 'Staff'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {emp.tanggal_masuk}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {emp.attendance_token ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                    <QrCode size={12} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Belum Ada</span>
                                            )}
                                        </td>
                                        {/* TOMBOL HAPUS DI SINI */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(emp.id, emp.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus Karyawan"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TAMBAH KARYAWAN (Tetap Sama) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Tambah Karyawan Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Contoh: Budi Santoso"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Perusahaan</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="nama@kantor.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Default</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Min. 6 karakter"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.tanggal_masuk}
                                        onChange={e => setFormData({...formData, tanggal_masuk: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                        value={formData.divisi_id}
                                        onChange={e => setFormData({...formData, divisi_id: e.target.value})}
                                    >
                                        <option value="1">IT</option>
                                        <option value="2">HRD</option>
                                        <option value="3">Marketing</option>
                                        <option value="4">Finance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan & Generate Token'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}