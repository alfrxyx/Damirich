import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  // State ini harusnya diangkat ke sini agar Sidebar & Konten Kanan sinkron
  // Tapi karena Sidebar Anda mengelola state sendiri, kita sesuaikan saja layoutnya
  // agar Sidebar punya ruang sendiri dan tidak menimpa konten.
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* BAGIAN KIRI: SIDEBAR */}
      {/* z-30 agar sidebar di atas konten jika layar kecil */}
      <div className="flex-shrink-0 z-30 relative">
        <Sidebar />
      </div>

      {/* BAGIAN KANAN: KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TopBar (Akan selalu di atas konten kanan) */}
        <TopBar />

        {/* Area Konten yang bisa di-scroll (Dashboard, Settings, dll) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}