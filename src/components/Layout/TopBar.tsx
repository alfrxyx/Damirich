import { Bell, Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [user, setUser] = useState<any>(null);

  // 1. Ambil Data User saat komponen dimuat
  useEffect(() => {
    const userString = localStorage.getItem('user_info');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (e) {
        console.error("Gagal load user info di TopBar");
      }
    }
  }, []);

  // Helper untuk menentukan label jabatan
  const getRoleLabel = (posisiId: number) => {
    if (posisiId === 1) return 'Administrator';
    if (posisiId === 2) return 'Staff';
    if (posisiId === 3) return 'Manager';
    return 'Karyawan';
  };

  // Helper untuk inisial nama
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
      
      {/* Bagian Kiri (Bisa untuk Breadcrumb atau Menu Toggle Mobile nanti) */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden">
          <Menu size={20} />
        </button>
        {/* Breadcrumb Simpel */}
        <h2 className="text-sm font-medium text-gray-500 hidden sm:block">
          Portal {user?.posisi_id === 1 ? 'Admin' : 'Karyawan'}
        </h2>
      </div>

      {/* Bagian Kanan (Profil & Notif) */}
      <div className="flex items-center gap-4">
        
        {/* Notifikasi Icon */}
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        {/* Garis Pemisah */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Profil User Dinamis */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            {/* NAMA ASLI DARI DATABASE */}
            <p className="text-sm font-bold text-gray-900 leading-none">
                {user?.name || 'Pengguna'}
            </p>
            {/* JABATAN ASLI */}
            <p className="text-xs text-gray-500 mt-1">
                {user ? getRoleLabel(Number(user.posisi_id)) : 'Memuat...'}
            </p>
          </div>
          
          {/* Avatar Inisial */}
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-blue-100">
            {getInitials(user?.name)}
          </div>
        </div>

      </div>
    </header>
  );
}