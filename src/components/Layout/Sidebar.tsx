import { LayoutDashboard, Settings, ChevronLeft, ChevronRight, LogOut, Shield, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Cek Peran Pengguna saat komponen dimuat
    useEffect(() => {
        const userInfoString = localStorage.getItem('user_info');
        // Atau jika kamu menyimpan data karyawan di 'user_data', sesuaikan kuncinya
        // const userInfoString = localStorage.getItem('user_data'); 
        
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                // Asumsi: Admin memiliki posisi_id = 1 (Manager/Admin)
                if (userInfo && userInfo.posisi_id === 1) { 
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error("Gagal parse user info:", e);
            }
        }
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard Karyawan', path: '/' },
        { icon: Calendar, label: 'Permohonan Cuti', path: '/cuti' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    // Jika Admin, tambahkan menu Admin
    if (isAdmin) {
        // Kita taruh menu Admin di paling atas atau bawah, sesuai selera. 
        // Di sini saya taruh di urutan kedua supaya mudah diakses.
        menuItems.splice(1, 0, { icon: Shield, label: 'Dashboard Admin', path: '/admin/dashboard' });
    }

    const handleLogout = () => {
        // 1. Hapus semua token dan data user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_data');
        
        // 2. Redirect ke Login
        navigate('/login');
    };

    return (
        <aside 
            className={`bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* HEADER */}
            <div className={`h-16 flex items-center px-4 border-b border-gray-100 transition-all ${
                isCollapsed ? 'justify-center' : 'justify-between'
            }`}>
                {!isCollapsed && (
                    <div className="font-bold text-xl text-blue-600 whitespace-nowrap overflow-hidden">
                        Absen Damirich
                    </div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    // Logika Active State yang lebih akurat
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                                isActive 
                                    ? 'bg-blue-50 text-blue-600 font-medium' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon 
                                size={22} 
                                className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
                            />
                            
                            {!isCollapsed && (
                                <span className="whitespace-nowrap overflow-hidden transition-all">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip saat collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100">
                {!isCollapsed && (
                    <div className="mb-3 px-2">
                        <h3 className="font-bold text-lg text-gray-800 whitespace-nowrap">
                            {isAdmin ? 'Portal Admin' : 'Portal Karyawan'}
                        </h3>
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all ${
                        isCollapsed ? 'justify-center' : ''
                    }`}
                >
                    <LogOut size={22} />
                    {!isCollapsed && (
                        <span className="whitespace-nowrap font-medium overflow-hidden">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
}