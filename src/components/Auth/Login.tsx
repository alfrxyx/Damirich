import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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

            // Kode ini sudah BENAR karena mengambil 'data' dari response.data
            const { access_token, data } = response.data; // data = { id: 1, nama: "...", posisi_id: 1/2, ... }

            if (!access_token) {
                throw new Error('Token tidak ditemukan');
            }

            // Simpan token (kunci untuk akses API)
            localStorage.setItem('auth_token', access_token);
            // Simpan data karyawan (termasuk posisi_id) untuk pengecekan Front-End
            localStorage.setItem('user_info', JSON.stringify(data)); 

            // Redirect ke halaman utama, di mana App.tsx akan menjalankan ProtectedRoute
            window.location.href = '/';

        } catch (err: any) {
            console.error('Login gagal:', err);
            setError(err.response?.data?.message || 'Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                
                <div className="bg-blue-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Fingerprint className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Absen Damirich</h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Silakan masuk untuk melanjutkan
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <span className="font-medium">Error:</span> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="admin@kantor.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sedang Memproses...
                                </>
                            ) : (
                                'Masuk Sekarang'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Belum terdaftar?{' '}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Daftar Akun Baru
                            </Link>
                        </p>
                    </div>

                    <div className="mt-2 text-center">
                        <p className="text-xs text-gray-500">
                            Lupa password?{' '}
                            <span className="text-blue-600 hover:underline cursor-pointer">
                                Hubungi Admin
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}