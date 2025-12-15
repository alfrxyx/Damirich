import { Bell, Menu, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Interface Notifikasi
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function TopBar() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const API_URL = 'http://127.0.0.1:8000/api';
  const token = sessionStorage.getItem('auth_token'); // Pakai Session Storage

  // 1. Load User & Notifikasi
  useEffect(() => {
    const userString = sessionStorage.getItem('user_info');
    if (userString) setUser(JSON.parse(userString));

    fetchNotifications();

    // Auto refresh notifikasi setiap 30 detik (Polling sederhana)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch API
  const fetchNotifications = async () => {
    if (!token) return;
  try {
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(res.data.data);
    setUnreadCount(res.data.unread_count);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching notifications:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

  // 3. Mark Read
  const handleMarkRead = async (id: number) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update UI lokal biar cepet
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  // 4. Close dropdown click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Helper UI
  const getRoleLabel = (posisiId: number) => {
    if (posisiId === 1) return 'Administrator';
    if (posisiId === 2) return 'Staff';
    return 'Karyawan';
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
      
      {/* Bagian Kiri */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-gray-500 hidden sm:block">
          Portal {user?.posisi_id === 1 ? 'Admin' : 'Karyawan'}
        </h2>
      </div>

      {/* Bagian Kanan */}
      <div className="flex items-center gap-4">
        
        {/* === NOTIFIKASI LONCENG === */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative transition-colors focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-700 text-sm">Notifikasi</h3>
                        <span className="text-xs text-gray-500">{unreadCount} belum dibaca</span>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                Tidak ada notifikasi baru.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                                    className={`p-3 border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2 text-right">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {/* Garis Pemisah */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Profil User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
                {user?.name || 'Pengguna'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
                {user ? getRoleLabel(Number(user.posisi_id)) : 'Memuat...'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-blue-100">
            {getInitials(user?.name)}
          </div>
        </div>

      </div>
    </header>
  );
}