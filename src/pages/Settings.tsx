import { useState, useEffect } from 'react';
import { User, Briefcase, Calendar, Mail, Hash, Shield, Clock, Copy, RefreshCw } from 'lucide-react';

export default function Settings() {
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        const userString = sessionStorage.getItem('user_info');
        if (userString) {
            setUser(JSON.parse(userString));
        }
    }, []);

    // Helper: Mapping ID ke Nama
    const getDivisiName = (id: number) => {
        const div = { 1: 'IT', 2: 'HRD', 3: 'Marketing', 4: 'Finance' };
        return div[id as keyof typeof div] || 'Umum';
    };

    const getPosisiName = (id: number) => {
        const pos = { 1: 'Administrator', 2: 'Staff', 3: 'Manager' };
        return pos[id as keyof typeof pos] || 'Karyawan';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const getMasaKerja = (dateString: string) => {
        if (!dateString) return '-';
        const start = new Date(dateString);
        const now = new Date();
        const diffYears = now.getFullYear() - start.getFullYear();
        const diffMonths = now.getMonth() - start.getMonth();
        
        if (diffYears > 0) {
            return `${diffYears} Tahun ${diffMonths} Bulan`;
        }
        return `${diffMonths} Bulan`;
    };

    const copyToken = () => {
        if (user?.attendance_token) {
            navigator.clipboard.writeText(user.attendance_token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const regenerateToken = async () => {
        if (!confirm('Yakin ingin mengganti token absensi Anda? Token lama akan tidak berlaku.')) return;
        
        setRegenerating(true);
        try {
            // TODO: Panggil API untuk regenerate token
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Token berhasil diperbarui!');
            // Simulasi update token
            const newToken = 'NEW_' + Math.random().toString(36).substr(2, 10).toUpperCase();
            const updatedUser = { ...user, attendance_token: newToken };
            sessionStorage.setItem('user_info', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) {
            alert('Gagal memperbarui token. Coba lagi.');
        } finally {
            setRegenerating(false);
        }
    };

    if (!user) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto px-4 py-6">
            
            {/* HEADER - MODERN GRADIENT */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-200/50">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                    Pengaturan Akun
                </h1>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
                    Kelola informasi profil, keamanan, dan preferensi akun Anda
                </p>
            </div>

            {/* KARTU PROFIL UTAMA - DENGAN ANIMASI */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_40%)]"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                </div>
                
                <div className="px-8 pb-10 relative">
                    <div className="relative flex flex-col md:flex-row justify-between items-center -mt-20">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-4xl font-bold text-white relative z-10 tracking-wider">
                                        {user.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border-2 border-white shadow-lg">
                                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                                    {user.name}
                                </h2>
                                <p className="text-blue-600 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <Mail size={16} /> {user.email}
                                </p>
                                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="px-4 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-sm font-bold rounded-full border border-blue-100 flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> {getPosisiName(Number(user.posisi_id))}
                                    </span>
                                    <span className="px-4 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 text-sm font-bold rounded-full border border-purple-100 flex items-center gap-1">
                                        <User className="w-3 h-3" /> ID: EMP-{user.id.toString().padStart(4, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 md:mt-0 flex flex-col items-center">
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm border border-amber-100 w-full max-w-xs">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Masa Kerja</span>
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <p className="text-2xl font-bold text-amber-900">{getMasaKerja(user.tanggal_masuk)}</p>
                                <p className="text-xs text-amber-700 mt-1">Sejak {formatDate(user.tanggal_masuk)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAIL INFORMASI - GRID MODERN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Data Pekerjaan - CARD MODERN */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-5 flex items-center gap-3">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            <span>Informasi Pekerjaan</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Divisi</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{getDivisiName(Number(user.divisi_id))}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jabatan</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{getPosisiName(Number(user.posisi_id))}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-green-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status Karyawan</p>
                                    <p className="font-bold text-green-700 mt-0.5 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Permanent
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ID Pegawai</p>
                                    <p className="font-mono font-bold text-gray-800 mt-0.5 bg-gray-50 px-2 py-1 rounded inline-block">
                                        EMP-{user.id.toString().padStart(4, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Keamanan & Token - CARD MODERN */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="h-3 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-5 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-purple-600" />
                            <span>Keamanan & Token</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{formatDate(user.tanggal_masuk)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Masa Kerja</p>
                                    <p className="font-bold text-amber-800 mt-0.5">{getMasaKerja(user.tanggal_masuk)}</p>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-purple-600" /> Token Absensi
                                    </h4>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={copyToken}
                                            className={`p-1.5 rounded-lg ${
                                                copied 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            } transition-colors`}
                                            title={copied ? 'Disalin!' : 'Salin Token'}
                                        >
                                            <Copy size={16} />
                                        </button>
                                        {/* <button 
                                            onClick={regenerateToken}
                                            disabled={regenerating}
                                            className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-70"
                                            title="Perbarui Token"
                                        >
                                            {regenerating ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw size={16} />
                                            )}
                                        </button> */}
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <code className="font-mono text-sm text-gray-700 break-all mr-2">
                                            {user.attendance_token || 'Belum digenerate'}
                                        </code>
                                        {user.attendance_token && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Gunakan token ini untuk absensi dengan QR Code
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER INFO - MODERN */}
            <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-gray-900">Keamanan Akun Anda</p>
                        <p className="text-sm text-gray-500">Token absensi bersifat rahasia. Jangan bagikan ke siapapun.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon Lock untuk footer
const Lock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);