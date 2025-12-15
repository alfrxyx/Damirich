import { useState } from 'react';
import { Fingerprint, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.clear();
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

            sessionStorage.setItem('auth_token', access_token);
            sessionStorage.setItem('user_info', JSON.stringify(user));

            if (Number(user.posisi_id) === 1) {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            console.error('Login gagal:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Terjadi kesalahan saat login. Coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[650px]">
                    {/* Left Panel – Branded Visual */}
                    <div className="relative bg-gradient-to-b from-blue-700 to-indigo-800 p-10 lg:p-16 text-white flex flex-col justify-between overflow-hidden">
                        {/* Decorative Blobs */}
                        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl opacity-40"></div>
                        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl opacity-50"></div>

                        {/* Logo & Tagline */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Fingerprint className="w-7 h-7" />
                                </div>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight max-w-xs">
                                Sistem ERP <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                                    Terintegrasi
                                </span>
                            </h1>
                            <p className="mt-4 text-blue-100/90 max-w-md text-sm lg:text-base">
                                Kelola kehadiran tim Anda secara real-time, akurat, dan aman dari mana saja.
                            </p>
                        </div>

                        <div className="relative z-10 text-xs text-blue-200/70 font-medium">
                            © 2025 Damirich Corp. Hak cipta dilindungi.
                        </div>
                    </div>

                    {/* Right Panel – Login Form */}
                    <div className="p-8 lg:p-14 flex items-center justify-center">
                        <div className="w-full max-w-md">
                            <div className="mb-10 text-center">
                                <img 
                                    src="/logo_damirich.png" 
                                    alt="Damirich Logo" 
                                    className="w-24 h-auto mx-auto" 
                                />
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Selamat Datang Kembali</h2>
                                <p className="text-gray-500 mt-2">Masuk untuk mengakses dashboard Anda.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Perusahaan
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium"
                                        placeholder="nama@perusahaan.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                            Password
                                        </label>
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Lupa password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium pr-12"
                                            placeholder="••••••••"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                                        loading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Masuk ke Akun'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-500 text-sm">
                                    Belum punya akun? Hubungi tim HRD perusahaan Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}