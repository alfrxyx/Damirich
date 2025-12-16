// src/components/ManualInputModal.tsx
import React, { useState } from 'react';
import { AlertCircle, QrCode } from 'lucide-react';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  attendanceType: 'clock-in' | 'clock-out';
}

export default function ManualInputModal({
  isOpen,
  onClose,
  onConfirm,
  attendanceType
}: ManualInputModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputValue.trim()) {
    setError('Kode QR tidak boleh kosong.');
    return;
  }

  // Tutup modal **dulu**, lalu proses
  onClose(); // ← Penting: tutup modal sekarang

  // Kirim data ke parent (Dashboard)
  onConfirm(inputValue.trim());
  
  // Reset state lokal
  setInputValue('');
  setError('');
 };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Masukkan Kode QR Manual
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Untuk {attendanceType === 'clock-in' ? 'Masuk' : 'Pulang'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            placeholder="Contoh: ABCD1234"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-center font-mono text-lg mb-4 transition-all"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
            Batal
            </button>
            <button
            type="submit"
            className="btn-donate w-full flex items-center justify-center gap-1 text-sm py-2"
            style={{
                '--radii': '0.5rem',
                '--size': '0.9rem'
            } as React.CSSProperties}
            >
            <QrCode size={14} />
            Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}