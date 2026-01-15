'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { events, permissions } from '@/lib/api';

export default function EventDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [event, setEvent] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
        loadEvent();
    }, [params.id, router]);

    const loadEvent = async () => {
        try {
            const response = await events.getById(params.id);
            setEvent(response.data);
        } catch (error) {
            console.error('Load event error:', error);
            alert('Event tidak ditemukan');
            router.push('/events');
        } finally {
            setLoading(false);
        }
    };

    const loadQRCode = async () => {
        try {
            const response = await events.getQR(params.id);
            setQrCode(response.data.qrCode);
            setShowQR(true);
        } catch (error) {
            alert('Gagal generate QR Code');
        }
    };

    const handlePermission = async (permissionId, status) => {
        if (!confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} izin ini?`)) return;

        try {
            await permissions.update(permissionId, { status });
            alert(`Izin berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
            loadEvent(); // Reload to see changes
        } catch (error) {
            console.error('Update permission error:', error);
            alert('Gagal memproses izin');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Yakin ingin menghapus event ini?')) return;

        try {
            await events.delete(params.id);
            router.push('/events');
        } catch (error) {
            alert('Gagal menghapus event');
        }
    };

    const getStatusBadge = (status, permissionStatus) => {
        if (permissionStatus === 'pending') {
             return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">Menunggu Izin</span>;
        }

        const styles = {
            hadir: 'bg-[#DCFCE7] text-[#166534]',
            terlambat: 'bg-[#FEF9C3] text-[#854D0E]',
            izin: 'bg-[#DBEAFE] text-[#1E40AF]',
            sakit: 'bg-[#F3E8FF] text-[#6B21A8]',
            alpha: 'bg-[#FEE2E2] text-[#991B1B]',
            pending: 'bg-gray-100 text-gray-500'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending} border border-white/50 shadow-sm`}>
            {(status || 'BELUM ABSEN').toUpperCase()}
        </span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#165DFF]/20 border-t-[#165DFF]"></div>
            </div>
        );
    }

    if (!event) return null;

    const canEdit = user?.role === 'admin' || user?.role === 'koordinator';
    const attendedCount = event.participants?.filter(p => p.status === 'hadir' || p.status === 'terlambat').length || 0;
    const attendanceRate = event.participants?.length > 0
        ? ((attendedCount / event.participants.length) * 100).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="pt-28 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-8 animate-fade-in-up">
                        <button
                            onClick={() => router.back()}
                            className="text-[#6A7686] hover:text-[#165DFF] mb-4 flex items-center gap-2 font-medium transition-colors"
                        >
                            ← Kembali
                        </button>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#080C1A] mb-3">{event.title}</h2>
                                <p className="text-[#6A7686] text-lg max-w-2xl">{event.description}</p>
                            </div>
                            {canEdit && (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={loadQRCode}
                                        className="px-6 py-3 bg-[#165DFF] text-white rounded-[16px] font-bold hover:bg-[#0E4BD9] shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                                    >
                                        📱 QR Code
                                    </button>
                                    <button
                                        onClick={() => router.push(`/events/${params.id}/edit`)}
                                        className="px-6 py-3 bg-white text-[#165DFF] border border-[#165DFF]/20 rounded-[16px] font-bold hover:bg-[#F0F7FF] transition-all"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2] rounded-[16px] font-bold hover:bg-[#FEE2E2] transition-all"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Permissions Section (Admin Only) */}
                    {canEdit && (event.participants?.some(p => p.permission_status === 'pending')) && (
                        <div className="glass card mb-8 border-l-4 border-l-orange-500 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-4 flex items-center gap-2">
                                ⏳ Menunggu Persetujuan ({event.participants.filter(p => p.permission_status === 'pending').length})
                            </h3>
                            <div className="space-y-3">
                                {event.participants.filter(p => p.permission_status === 'pending').map(p => (
                                    <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#080C1A]">{p.name} ({p.nim})</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${p.permission_reason?.includes('sakit') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {p.permission_reason?.includes('sakit') ? 'Sakit' : 'Izin'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#6A7686] mt-1">
                                                Alasan: <span className="text-[#080C1A] italic">"{p.permission_reason}"</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePermission(p.permission_id, 'approved')}
                                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                                            >
                                                ✅ Setujui
                                            </button>
                                            <button
                                                onClick={() => handlePermission(p.permission_id, 'rejected')}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                                            >
                                                ❌ Tolak
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QR Code Modal */}
                    {showQR && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-fade-in-up">
                            <div className="glass card p-8 max-w-sm w-full relative overflow-hidden text-center">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#165DFF] to-[#0E4BD9]"></div>
                                
                                <button 
                                    onClick={() => setShowQR(false)}
                                    className="absolute top-4 right-4 text-[#6A7686] hover:text-[#080C1A] p-2 transition-colors"
                                >
                                    ✕
                                </button>

                                <div className="mb-6 mt-2">
                                    <h3 className="text-xl font-bold text-[#080C1A]">QR Code Absensi</h3>
                                    <p className="text-[#6A7686] text-sm mt-1">{event.title}</p>
                                </div>

                                {qrCode && (
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-inner mb-6 inline-block">
                                        <img src={qrCode} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                                    </div>
                                )}

                                <div className="text-sm text-[#080C1A] bg-[#F1F3F6] p-4 rounded-xl mb-6 space-y-2 text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">📅</span>
                                        <span className="font-semibold">
                                            {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">⏰</span>
                                        <span className="font-semibold">{event.time_start} - {event.time_end}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowQR(false)}
                                    className="w-full py-3 bg-[#165DFF] text-white rounded-[16px] font-bold hover:bg-[#0E4BD9] transition-all shadow-lg shadow-blue-500/30"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Admin Only: Manual Token Display */}
                    {canEdit && (
                        <div className="glass card mb-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#165DFF]">🔑 Token Absensi Manual</h3>
                                    <p className="text-sm text-[#6A7686]">Berikan token ini kepada peserta yang terkendala scan QR.</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-2xl border border-blue-100 shadow-sm backdrop-blur-sm">
                                    <code className="text-3xl font-mono font-bold text-[#165DFF] tracking-[0.2em]">
                                        {event.qr_token || '????'}
                                    </code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(event.qr_token);
                                            alert('Token disalin!');
                                        }}
                                        className="p-2 hover:bg-blue-50 rounded-lg text-[#165DFF] transition-all"
                                        title="Salin Token"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Info Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="glass card">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                ℹ️ Informasi Event
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                                    <span className="text-[#6A7686] font-medium">📅 Tanggal</span>
                                    <p className="font-bold text-[#080C1A]">
                                        {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                                    <span className="text-[#6A7686] font-medium">⏰ Waktu</span>
                                    <p className="font-bold text-[#080C1A]">{event.time_start} - {event.time_end}</p>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                                    <span className="text-[#6A7686] font-medium">📍 Lokasi</span>
                                    <p className="font-bold text-[#080C1A]">{event.location}</p>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                                    <span className="text-[#6A7686] font-medium">🏷️ Tipe</span>
                                    <p className="font-bold text-[#080C1A] capitalize">{event.type}</p>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                                    <span className="text-[#6A7686] font-medium">⏱️ Toleransi</span>
                                    <p className="font-bold text-[#080C1A]">{event.late_threshold} menit</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass card">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                📊 Statistik Kehadiran
                            </h3>
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="#F1F3F6"
                                            strokeWidth="12"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="#165DFF"
                                            strokeWidth="12"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * attendanceRate) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-4xl font-bold text-[#080C1A]">{attendanceRate}%</span>
                                    </div>
                                </div>
                                <p className="text-[#6A7686] font-medium">Tingkat Kehadiran</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="bg-[#F9FAFB] p-4 rounded-2xl text-center">
                                    <div className="text-2xl font-bold text-[#080C1A]">{event.participants?.length || 0}</div>
                                    <div className="text-xs font-bold text-[#6A7686] uppercase tracking-wider mt-1">Total Peserta</div>
                                </div>
                                <div className="bg-[#DCFCE7]/50 p-4 rounded-2xl text-center border border-[#DCFCE7]">
                                    <div className="text-2xl font-bold text-[#166534]">{attendedCount}</div>
                                    <div className="text-xs font-bold text-[#166534] uppercase tracking-wider mt-1">Sudah Hadir</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="glass card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-xl font-bold text-[#080C1A] mb-6">
                            Daftar Peserta ({event.participants?.length || 0})
                        </h3>

                        {!event.participants || event.participants.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[#6A7686]">Belum ada peserta terdaftar</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">No</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">NIM</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">Nama</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">Departemen</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#6A7686] uppercase tracking-wider">Check-in</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {event.participants.map((participant, index) => (
                                            <tr key={participant.id} className="hover:bg-[#F9FAFB] transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-[#6A7686]">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-[#080C1A]">{participant.nim}</td>
                                                <td className="px-6 py-4 text-sm text-[#080C1A]">{participant.name}</td>
                                                <td className="px-6 py-4 text-sm text-[#6A7686]">{participant.department_name || '-'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {participant.status || participant.permission_status === 'pending' ? (
                                                        getStatusBadge(participant.status, participant.permission_status)
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                                                            BELUM ABSEN
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-[#6A7686]">
                                                    {participant.check_in_time
                                                        ? new Date(participant.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                        : '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
