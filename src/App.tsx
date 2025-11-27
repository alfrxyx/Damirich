import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest'; 
import Login from './components/Auth/Login'; 
import Register from './pages/Register'; 
import AdminDashboard from './pages/AdminDashboard';
import ManageKaryawan from './pages/ManageKaryawan';

// --- GUARD: PUBLIC ROUTE ---
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        const userString = localStorage.getItem('user_info');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (Number(user.posisi_id) === 1) {
                    return <Navigate to="/admin/dashboard" replace />;
                }
            } catch (e) {
                localStorage.clear();
            }
        }
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

// --- GUARD: PROTECTED ROUTE ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// --- APLIKASI UTAMA ---
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* HALAMAN LOGIN & REGISTER */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                {/* <Route path="/register" element={<Register />} /> */}

                {/* === SEMUA HALAMAN YANG PAKAI SIDEBAR (USER & ADMIN) === */}
                <Route element={
                    <ProtectedRoute>
                        <MainLayout /> {/* <--- INI KUNCINYA! Sidebar ada di sini */}
                    </ProtectedRoute>
                }>
                    {/* 1. Area Karyawan */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cuti" element={<LeaveRequest />} />
                    <Route path="/settings" element={<div className="p-6">Halaman Pengaturan</div>} />

                    {/* 2. Area Admin (SEKARANG SUDAH PAKAI SIDEBAR JUGA) */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />}/>
                    <Route path="/admin/karyawan" element={<ManageKaryawan/>}/>
                    {/* Menu admin lain bisa ditambah di sini */}
                    <Route path="/admin/rekap" element={<div className="p-6">Halaman Rekap</div>} />
                </Route>

                {/* Redirect Nyasar */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;