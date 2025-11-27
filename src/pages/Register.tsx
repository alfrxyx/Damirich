import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fingerprint, Mail, Lock, User, Briefcase, Calendar, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  
  // State Data Form
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: '',
    divisi_id: '1', // Default IT
    posisi_id: '2', // Default Staff (ID 2)
    tanggal_masuk: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data Dummy (Harus sama dengan Database Seeder kamu)
  const divisions = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HRD' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Finance' },
  ];

  const positions = [
    { id: 2, name: 'Staff' },
    { id: 3, name: 'Manager' },
    // Admin (ID 1) sengaja tidak ditampilkan agar user tidak bisa pilih
  ];

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
      
      await axios.post(`${API_URL}/register`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      setSuccess('Registrasi berhasil! Mengalihkan ke login...');
      
      // Delay sebentar lalu lempar ke Login
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);

    } catch (err: any) {
        console.error('Registrasi Gagal:', err);
        // Menangani pesan error dari Laravel
        const msg = err.response?.data?.message || 'Terjadi kesalahan server.';
        const validationErrors = err.response?.data?.errors;
        
        if (validationErrors) {
            // Jika ada banyak error validasi, ambil yang pertama
            const firstError = Object.values(validationErrors)[0];
            setError(Array.isArray(firstError) ? firstError[0] : msg);
        } else {
            setError(msg);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Container Utama */}
      <div className="max-w-7xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* --- BAGIAN KIRI: Visual Biru --- */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
             {/* Efek Background */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

             {/* Logo */}
             <div className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                        <Fingerprint className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wide text-blue-100">DAMIRICH</span>
                </div>
            </div>

            {/* Text Headline */}
            <div className="relative z-10 mt-12 md:mt-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    Bergabung dengan <br/>
                    <span className="text-blue-200">Tim Hebat Kami.</span>
                </h1>
                <p className="text-blue-100/80 text-lg font-light leading-relaxed max-w-md">
                    Buat akun karyawan baru untuk mulai mengelola absensi, jadwal, dan produktivitas Anda.
                </p>
            </div>

            <div className="relative z-10 text-sm text-blue-200/60 font-medium">
                © 2025 Damirich Corp. All rights reserved.
            </div>
        </div>

        {/* --- BAGIAN KANAN: Form Register --- */}
        <div className="md:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
            <div className="max-w-lg mx-auto w-full">
                
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h2>
                    <p className="text-gray-500 text-lg">Lengkapi data diri Anda di bawah ini.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    
                    {/* Alert Error/Success */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-lg font-medium">
                            ✅ {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* NAMA */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium" placeholder="Nama Lengkap" required />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Email Perusahaan</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium" placeholder="nama@kantor.com" required />
                            </div>
                        </div>

                        {/* DIVISI (Dropdown) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Divisi</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select name="divisi_id" value={formData.divisi_id} onChange={handleChange} className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none font-medium cursor-pointer">
                                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* POSISI (Dropdown) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Posisi</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select name="posisi_id" value={formData.posisi_id} onChange={handleChange} className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none font-medium cursor-pointer">
                                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium" placeholder="******" required />
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Ulangi Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium" placeholder="******" required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="mt-8 text-center pb-4">
                    <p className="text-gray-500">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}