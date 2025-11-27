import { Bell, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick?: () => void;
}

interface UserData {
  nama: string;
  email: string;
  posisi_id: number;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch (e) {
        console.error("Gagal parse user data:", e);
        localStorage.clear();
        navigate('/login');
      }
    }
  }, [navigate]);

  const getInitials = (name: string): string => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 w-full">

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* 🔥 BAGIAN PROFIL — sudah aman, tidak logout lagi */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
              {user?.nama || 'John Doe'}
            </p>
            <p className="text-xs text-gray-500 leading-none">
              Karyawan
            </p>
          </div>

          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-blue-50">
            {user ? getInitials(user.nama) : 'JD'}
          </div>
        </div>
      </div>
    </header>
  );
}
