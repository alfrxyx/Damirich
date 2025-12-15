import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest'; 
import Login from './components/Auth/Login'; 
import Settings from './pages/Settings'; 
import AdminDashboard from './pages/AdminDashboard';
import ManageKaryawan from './pages/ManageKaryawan';
import Laporan from './pages/Laporan'; // 👈 Pastikan komponen ini diimpor

// --- GUARD: PUBLIC ROUTE ---
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        const userString = sessionStorage.getItem('user_info');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (Number(user.posisi_id) === 1) {
                    return <Navigate to="/admin/dashboard" replace />;
                }
            } catch (e) {
                sessionStorage.clear();
            }
        }
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

// --- GUARD: PROTECTED ROUTE ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// --- APLIKASI UTAMA ---
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* HALAMAN LOGIN */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                {/* SEMUA HALAMAN TERLINDUNGI DENGAN LAYOUT */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* User Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cuti" element={<LeaveRequest />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/karyawan" element={<ManageKaryawan />} />
                    <Route path="/admin/rekap-harian" element={<Laporan />} /> {/* ✅ Ditambahkan di sini */}
                    <Route path="/admin/rekap" element={<div className="p-6">Halaman Rekap</div>} />
                </Route>

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;