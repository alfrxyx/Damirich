import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fingerprint, Mail, Lock, User, Briefcase, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

// Data Dummy untuk Divisi dan Posisi (Asumsi ID 1-3 sudah ada di DB)
const dummyOptions = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HRD' },
    { id: 3, name: 'Marketing' },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: '',
    divisi_id: '1',
    posisi_id: '1',
    tanggal_masuk: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = 'http://127.0.0.1:8000/api'; 
      
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      setSuccess(response.data.message || 'Registrasi berhasil! Silakan login.');
      
      // Jika berhasil, redirect ke halaman login
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);

    } catch (err: any) {
      console.error('Registrasi Gagal:', err);
      // Tampilkan error validasi dari backend
      const backendMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join('; ')
        : err.response?.data?.message || 'Terjadi kesalahan. Cek koneksi server.';
      
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Biru */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Daftar Karyawan Baru</h2>
          <p className="text-blue-100 text-sm mt-1">Lengkapi data untuk membuat akun</p>
        </div>

        {/* Form Register */}
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Pesan Sukses/Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
                ✅ {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* NAMA */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="budi@kantor.com"
                    required
                  />
                </div>
              </div>

              {/* TANGGAL MASUK */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tanggal Masuk</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="tanggal_masuk"
                    value={formData.tanggal_masuk}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    required
                  />
                </div>
              </div>

              {/* DIVISI */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Divisi</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="divisi_id"
                    value={formData.divisi_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    required
                  >
                    {dummyOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* POSISI */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Posisi</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="posisi_id"
                    value={formData.posisi_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                    required
                  >
                    {dummyOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                </div>
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </div>

            </div>
            
            {/* TOMBOL SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sedang Mendaftarkan...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Link ke Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}