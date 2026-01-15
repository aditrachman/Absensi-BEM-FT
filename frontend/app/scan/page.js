'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { attendance } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('camera');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [manualToken, setManualToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isSecure, setIsSecure] = useState(true);
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (typeof window !== 'undefined') {
            setIsSecure(window.isSecureContext);
        }

        return () => {
            if (scannerRef.current) {
                try {
                     if (scannerRef.current.isScanning) {
                        scannerRef.current.stop().catch(err => console.warn('Cleanup stop error:', err));
                     }
                } catch (e) {
                    console.warn('Cleanup error:', e);
                }
            }
        };
    }, [router]);

    const startCamera = async () => {
        setError('');
        if (!isSecure) {
            setError("Browser memblokir kamera karena koneksi tidak aman (HTTP). Gunakan 'Upload Gambar' atau 'Manual'.");
            return;
        }

        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Stop camera immediately after scan
                    stopCamera().then(() => {
                        handleAttendanceSubmit(decodedText);
                    });
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error(err);
            setError("Gagal mengakses kamera. Pastikan izin diberikan.");
        }
    };

    const stopCamera = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.warn('Stop camera warning:', err);
            } finally {
                setIsScanning(false);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setLoading(true);

        try {
            const scanner = new Html5Qrcode("reader-hidden");
            const decodedText = await scanner.scanFile(file, true);
            handleAttendanceSubmit(decodedText);
        } catch (err) {
            setError("QR Code tidak ditemukan. Pastikan gambar jelas.");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAttendanceSubmit = async (token) => {
        setLoading(true);
        setError('');

        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            await submitAttendance(token, position.coords.latitude, position.coords.longitude);
                        } catch (e) {
                            setError(e.response?.data?.error || 'Gagal mencatat absensi (Geo)');
                        }
                    },
                    async (err) => {
                        console.warn('Geolocation error:', err);
                        // Continue without location
                        try {
                            await submitAttendance(token);
                        } catch (e) {
                            setError(e.response?.data?.error || 'Gagal mencatat absensi');
                        }
                    }
                );
            } else {
                await submitAttendance(token);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mencatat absensi');
            setLoading(false);
        }
    };

    const submitAttendance = async (token, latitude = null, longitude = null) => {
        try {
            const response = await attendance.scan({
                qr_token: token,
                latitude,
                longitude,
                device_info: navigator.userAgent
            });
            setResult({ message: 'Absensi Berhasil!', data: response.data });
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualToken.trim()) {
            handleAttendanceSubmit(manualToken.trim());
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />
            
            <div className="pt-28 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="mb-8 text-center animate-fade-in-up relative">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="absolute left-0 top-1 text-[#165DFF] hover:underline flex items-center text-sm font-semibold"
                        >
                            ← Kembali
                        </button>
                        <h2 className="text-3xl font-bold text-[#080C1A] mb-2">Scan Absensi</h2>
                        <p className="text-[#6A7686]">Arahkan kamera ke QR Code kegiatan</p>
                    </div>

                    {result ? (
                        <div className="glass card text-center p-8 animate-fade-in-up">
                            <div className="w-24 h-24 bg-gradient-to-tr from-[#30B22D] to-[#4ADE80] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                <span className="text-5xl text-white">✓</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#080C1A] mb-2">{result.message}</h2>
                            <p className="text-[#6A7686] mb-8 text-lg">{result.data.event.title}</p>
                            
                            <div className="bg-white/50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-white/50 backdrop-blur-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#6A7686] font-medium">Waktu</span>
                                    <span className="font-bold text-[#080C1A]">{result.data.event.time_start}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#6A7686] font-medium">Status</span>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                        result.data.attendance.status === 'hadir' 
                                        ? 'bg-[#DCFCE7] text-[#166534]' 
                                        : 'bg-[#FEF9C3] text-[#854D0E]'
                                    }`}>
                                        {result.data.attendance.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="w-full py-4 bg-[#165DFF] text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/30 hover:bg-[#0E4BD9] hover:-translate-y-1 transition-all"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            {/* Tabs */}
                            <div className="bg-white/60 backdrop-blur-md border border-white/50 p-1.5 rounded-[24px] mb-8 flex shadow-sm">
                                <button
                                    onClick={() => { setActiveTab('camera'); stopCamera(); }}
                                    className={`flex-1 px-6 py-3 rounded-[20px] font-bold transition-all duration-300 ${
                                        activeTab === 'camera' 
                                        ? 'bg-[#165DFF] text-white shadow-md' 
                                        : 'text-[#6A7686] hover:bg-white/50'
                                    }`}
                                >
                                    📷 Kamera
                                </button>
                                <button
                                    onClick={() => { setActiveTab('manual'); stopCamera(); }}
                                    className={`flex-1 px-6 py-3 rounded-[20px] font-bold transition-all duration-300 ${
                                        activeTab === 'manual' 
                                        ? 'bg-[#165DFF] text-white shadow-md' 
                                        : 'text-[#6A7686] hover:bg-white/50'
                                    }`}
                                >
                                    ⌨️ Manual
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-[24px] text-sm font-medium mb-6 flex items-center gap-3 animate-pulse">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="glass card min-h-[400px] flex flex-col justify-center">
                                {activeTab === 'camera' ? (
                                    <div className="flex flex-col h-full">
                                        {!isSecure && (
                                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm mb-4">
                                                ⚠️ Kamera tidak tersedia di HTTP. Gunakan Upload atau Manual.
                                            </div>
                                        )}
                                        
                                        <div id="reader" className="rounded-2xl overflow-hidden mb-6 border-2 border-[#165DFF]/20 shadow-inner"></div>
                                        <div id="reader-hidden" className="hidden"></div>

                                        {!isScanning ? (
                                            <div className="space-y-4 mt-auto">
                                                <button
                                                    onClick={startCamera}
                                                    disabled={loading || !isSecure}
                                                    className="w-full py-4 bg-[#165DFF] text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/30 hover:bg-[#0E4BD9] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                                                >
                                                    {loading ? 'Memproses...' : 'Mulai Scan Kamera'}
                                                </button>

                                                <div className="relative py-2">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-2 bg-white text-[#6A7686]">atau upload gambar</span>
                                                    </div>
                                                </div>

                                                <label className="w-full py-4 bg-white border-2 border-dashed border-[#165DFF]/30 text-[#165DFF] rounded-[20px] font-bold hover:bg-[#F0F7FF] hover:border-[#165DFF] transition-all cursor-pointer flex items-center justify-center gap-2">
                                                    <span>📤 Upload QR Code</span>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <button onClick={stopCamera} className="w-full py-4 bg-[#ED6B60] text-white rounded-[20px] font-bold shadow-lg shadow-red-500/30 hover:bg-[#D94F4F] transition-all mt-auto">
                                                Stop Scanning
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleManualSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[#080C1A] text-sm font-bold ml-1">
                                                Token Absensi
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-white/50 border border-[#F3F4F3] rounded-[20px] text-[#080C1A] placeholder:text-gray-400 outline-none focus:border-[#165DFF] focus:shadow-lg focus:shadow-blue-500/10 transition-all font-medium text-lg text-center tracking-widest"
                                                placeholder="X X X X X X"
                                                value={manualToken}
                                                onChange={(e) => setManualToken(e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-[#6A7686] text-center">Masukkan kode token yang diberikan panitia</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-[#165DFF] text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/30 hover:bg-[#0E4BD9] hover:-translate-y-1 transition-all"
                                        >
                                            {loading ? 'Memproses...' : 'Submit Token'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
