import { Bell, Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';

// Role mapping sebagai konstanta (lebih aman & reusable)
const ROLE_LABELS: Record<number, string> = {
  1: 'Administrator',
  2: 'Staff',
  3: 'Manager',
};

export default function TopBar() {
  const [user, setUser] = useState<{ name: string; posisi_id: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const userString = localStorage.getItem('user_info');
      if (userString) {
        try {
          const parsed = JSON.parse(userString);
          setUser(parsed);
        } catch (e) {
          console.error("Gagal parse user_info di localStorage", e);
        }
      }
      setIsLoading(false);
    }, 300); // Simulasi loading ringan untuk UX yang lebih smooth

    return () => clearTimeout(timer);
  }, []);

  const getRoleLabel = (posisiId: number): string => {
    return ROLE_LABELS[posisiId] || 'Karyawan';
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-sm">
      
      {/* Bagian Kiri */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          aria-label="Toggle menu" 
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb / Context */}
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-gray-700">
            Portal {user?.posisi_id === 1 ? 'Admin' : 'Karyawan'}
          </h2>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="flex items-center gap-3">
        
        {/* Notifikasi */}
        <div className="relative">
          <button 
            aria-label="Notifikasi" 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all duration-200 relative"
          >
            <Bell size={20} />
            {/* Badge Notifikasi (bisa dikontrol via state nanti) */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* Profil */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            // Skeleton untuk profil
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="hidden sm:block text-right">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-right hidden sm:block min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'Pengguna'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {user ? getRoleLabel(user.posisi_id) : 'Guest'}
                  </span>
                </div>
              </div>

              {/* Avatar dengan animasi hover */}
              <div className="group relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform duration-200 border-2 border-white">
                  {getInitials(user?.name || 'U')}
                </div>
                {/* Tooltip ringan (opsional) */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded-sm whitespace-nowrap z-10 opacity-90">
                  Profil
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}