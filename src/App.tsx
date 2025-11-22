import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest'; 
import Login from './components/Auth/Login'; 
import Register from './pages/Register'; 
import AdminDashboard from './pages/AdminDashboard'; // ✅ Sudah benar diimport

// --- KOMPONEN PENJAGA (GUARD) ---

// 1. Hanya boleh lewat kalau sudah Login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// 2. Kalau sudah login, jangan kasih masuk halaman Login lagi
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

// --- APLIKASI UTAMA ---

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* HALAMAN PUBLIC (Login & Register) */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={<Register />} />

                {/* HALAMAN UTAMA (Perlu Login) */}
                {/* Semua route di dalam ini akan memiliki Sidebar (karena dibungkus MainLayout) */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    {/* 1. Dashboard Karyawan (Halaman Depan) */}
                    <Route index element={<Dashboard />} />
                    
                    {/* 2. Permohonan Cuti */}
                    <Route path="cuti" element={<LeaveRequest />} />
                    
                    {/* 3. Settings */}
                    <Route path="settings" element={<div className="p-6">Halaman Pengaturan Profil</div>} />

                    {/* --- AREA ADMIN --- */}
                    <Route path="admin/dashboard" element={<AdminDashboard />} />
                    
                    {/* Placeholder menu admin lain (bisa dilengkapi nanti) */}
                    <Route path="admin/rekap-harian" element={<div className="p-6 text-xl">Halaman Rekap Absensi Harian</div>} />
                    <Route path="admin/karyawan" element={<div className="p-6 text-xl">Halaman Kelola Data Karyawan</div>} />
                    <Route path="admin/laporan-semua" element={<div className="p-6 text-xl">Halaman Laporan Bulanan</div>} />
                    
                </Route>

                {/* Redirect halaman nyasar ke Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;