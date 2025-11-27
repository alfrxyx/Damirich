import { useState } from 'react';
import { Fingerprint, Loader2, Eye, EyeOff } from 'lucide-react'; // Link dihapus
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.clear(); 
        setError('');
        setLoading(true);

        try {
            const API_URL = 'http://127.0.0.1:8000/api';
            
            const response = await axios.post(
                `${API_URL}/login`,
                { email, password },
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const { access_token, user } = response.data;

            if (!access_token) {
                throw new Error('Token tidak ditemukan');
            }

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user_info', JSON.stringify(user)); 

            if (Number(user.posisi_id) === 1) {
                window.location.href = '/admin/dashboard'; 
            } else {
                window.location.href = '/'; 
            }

        } catch (err: any) {
            console.error('Login gagal:', err);
            setError(err.response?.data?.message || 'Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* BAGIAN KIRI (GAMBAR/GRADIENT) */}
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <Fingerprint className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-wide text-blue-100">DAMIRICH</span>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            Sistem Absensi <br/>
                            <span className="text-blue-200">Terintegrasi.</span>
                        </h1>
                        <p className="text-blue-100/80 text-lg font-light leading-relaxed max-w-md">
                            Platform manajemen kehadiran karyawan yang akurat, real-time, dan mudah diakses dari mana saja.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-blue-200/60 font-medium">
                        © 2025 Damirich Corp. All rights reserved.
                    </div>
                </div>

                {/* BAGIAN KANAN (FORM LOGIN) */}
                <div className="md:w-1/2 bg-white p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
                            <p className="text-gray-500 text-lg">Silakan login ke akun Anda.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium flex items-center animate-pulse">
                                    <span className="mr-2">⚠️</span> {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Perusahaan</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                    placeholder="nama@kantor.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                        Lupa password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Masuk Akun'}
                            </button>
                        </form>

                        {/* BAGIAN LINK REGISTER SUDAH DIHAPUS DI SINI */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                Belum punya akun? Hubungi Admin HRD.
                            </p>
                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
    );
}