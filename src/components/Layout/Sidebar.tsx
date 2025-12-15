import { 
    LayoutDashboard, 
    Settings, 
    ChevronLeft, 
    ChevronRight, 
    LogOut, 
    Shield, 
    Calendar, 
    Users, 
    FileText,
    AlertTriangle 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Pastikan file CSS ini ada (yang tadi kita buat)
import './LogoutButton.css'; 

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const userInfoString = sessionStorage.getItem('user_info');
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                if (userInfo && Number(userInfo.posisi_id) === 1) { 
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error("Gagal parse user info:", e);
            }
        }
    }, []);

    const employeeMenu = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Permohonan Cuti', path: '/cuti' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const adminMenu = [
        { icon: Shield, label: 'Dashboard Admin', path: '/admin/dashboard' },
        { icon: Users, label: 'Data Karyawan', path: '/admin/karyawan' }, 
        { icon: FileText, label: 'Laporan Harian', path: '/admin/rekap-harian' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const menuItems = isAdmin ? adminMenu : employeeMenu;

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        sessionStorage.clear(); 
        window.location.href = '/login';
    };

    return (
        <>
            <aside 
                className={`bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                } shadow-sm z-40 overflow-hidden`}
            >
                {/* HEADER */}
                <div className={`h-16 flex items-center px-4 border-b border-gray-100 transition-all duration-300 ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                }`}>
                    <div className={`flex flex-col overflow-hidden transition-opacity duration-300 ${
                        isCollapsed ? 'opacity-0 w-0' : 'opacity-1 w-auto'
                    }`}>
                        <img src="/logo_damirich.png" alt="Damirich Logo" className="w-24 h-auto ml-6" />
                    </div>
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all duration-200 focus:outline-none group"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        ) : (
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        )}
                    </button>
                </div>

                {/* MENU */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                                    isActive 
                                        ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                } ${isCollapsed ? 'justify-center px-3' : ''}`}
                            >
                                <item.icon size={22} className={`flex-shrink-0 transition-colors duration-200 ${
                                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                                }`} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap overflow-hidden transition-all text-sm font-medium">
                                        {item.label}
                                    </span>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 transition-all">
                    <button 
                        onClick={handleLogoutClick}
                        className={`btn-logout ${isCollapsed ? 'collapsed' : ''}`}
                    >
                        <LogOut size={20} className="flex-shrink-0 z-10" />
                        {!isCollapsed && <span className="z-10">LOGOUT</span>}
                    </button>
                </div>
            </aside>

            {/* === MODAL LOGOUT === */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowLogoutModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                                        <AlertTriangle className="text-red-600" size={24} />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Apakah Anda yakin ingin mengakhiri sesi dan keluar dari aplikasi?
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Tombol Batal */}
                                    <button 
                                        onClick={() => setShowLogoutModal(false)}
                                        className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        BATAL
                                    </button>
                                    
                                    {/* Tombol YA KELUAR (Menggunakan Style btn-logout) */}
                                    <button 
                                        onClick={confirmLogout}
                                        // Menggunakan class yang sama dengan tombol di sidebar
                                        className="btn-logout justify-center" 
                                        // Override padding sedikit agar pas di dalam modal
                                        style={{ padding: '0.6em 1em' }} 
                                    >
                                        <span className="z-10">YA, KELUAR</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}