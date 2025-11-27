import { 
    LayoutDashboard, 
    Settings, 
    ChevronLeft, 
    ChevronRight, 
    LogOut, 
    Shield, 
    Calendar, 
    History, 
    Users, 
    FileText 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Cek Peran Pengguna
    useEffect(() => {
        const userInfoString = localStorage.getItem('user_info');
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

    const handleLogout = () => {
        if(confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.clear(); 
            window.location.href = '/login';
        }
    };

    return (
        <aside 
            className={`bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-20' : 'w-64'
            } shadow-sm z-50 overflow-hidden`}
        >
            {/* HEADER */}
            <div className={`h-16 flex items-center px-4 border-b border-gray-100 transition-all duration-300 ${
                isCollapsed ? 'justify-center' : 'justify-between'
            }`}>
                <div 
                    className={`flex flex-col overflow-hidden transition-opacity duration-300 ${
                        isCollapsed ? 'opacity-0 w-0' : 'opacity-1 w-auto'
                    }`}
                >
                    <span className="font-bold text-xl text-blue-600 whitespace-nowrap transition-all">
                        Damirich
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold transition-all">
                        {isAdmin ? 'Administrator' : 'Employee Portal'}
                    </span>
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
                            <item.icon 
                                size={22} 
                                className={`flex-shrink-0 transition-colors duration-200 ${
                                    isActive 
                                        ? 'text-blue-600' 
                                        : 'text-gray-500 group-hover:text-gray-700'
                                }`} 
                            />
                            
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
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group relative ${
                        isCollapsed ? 'justify-center px-3' : ''
                    }`}
                >
                    <LogOut 
                        size={22} 
                        className="flex-shrink-0 transition-transform duration-200 group-hover:rotate-12" 
                    />
                    {!isCollapsed && (
                        <span className="whitespace-nowrap font-medium overflow-hidden text-sm">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
}