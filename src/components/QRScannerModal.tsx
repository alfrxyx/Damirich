// src/components/QRScannerModal.tsx
import React, { useEffect } from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { AlertCircle, QrCode } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: ( string) => void;
  attendanceType: 'clock-in' | 'clock-out';
  error?: string;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  attendanceType,
  error
}: QRScannerModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    console.log('✅ Modal QR Scanner dibuka');
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {attendanceType === 'clock-in' ? 'Scan ID Masuk' : 'Scan ID Pulang'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Arahkan kamera ke QR Code</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* QR Scanner */}
        <div className="relative mb-4 border border-gray-200 rounded-xl overflow-hidden aspect-video bg-black">
          <QrReader
            onResult={(result, err) => {
              if (result) {
                console.log('✅ QR TERDETEKSI:', result.getText());
                const cleanData = result.getText().trim();
                onScanSuccess(cleanData);
                onClose();
              } else if (err) {
                console.log('❌ SCAN ERROR:', err);
              }
            }}
            constraints={{ facingMode: 'environment' }} // Prioritaskan kamera belakang di HP
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ objectFit: 'cover' }}
          />
        </div>

        {/* Tombol */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              const manual = prompt('Masukkan kode QR secara manual:');
              if (manual) {
                onScanSuccess(manual.trim());
                onClose();
              }
            }}
            className="btn-donate w-full flex items-center justify-center gap-1 text-sm py-2"
            style={{
              '--radii': '0.5rem',
              '--size': '0.9rem'
            } as React.CSSProperties}
          >
            <QrCode size={14} />
            Manual
          </button>
        </div>
      </div>
    </div>
  );
}