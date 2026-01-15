'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { events, attendance } from '@/lib/api';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            const [eventsRes, statsRes] = await Promise.all([
                events.getAll(),
                attendance.getMy()
            ]);
            const future = eventsRes.data.filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0));
            setUpcomingEvents(future.slice(0, 5));
            setStats(statsRes.data.statistics);
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#165DFF]/20 border-t-[#165DFF]"></div>
            </div>
        );
    }

    const attendanceRate = stats?.total_events > 0
        ? ((parseInt(stats.hadir) + parseInt(stats.terlambat)) / parseInt(stats.total_events) * 100).toFixed(0)
        : 0;

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
             {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />
            
            <div className="pt-28 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-10 animate-fade-in-up">
                        <h1 className="text-[#080C1A] text-2xl md:text-4xl font-bold mb-2">
                            Dashboard
                        </h1>
                        <p className="text-[#6A7686] text-lg">Selamat datang kembali, <span className="font-semibold text-[#165DFF]">{user?.name}</span>!</p>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="glass card hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#165DFF]/10 rounded-2xl flex items-center justify-center text-xl">
                                        📅
                                    </div>
                                    <p className="font-medium text-[#6A7686]">Total Rapat</p>
                                </div>
                                <p className="font-bold text-4xl text-[#080C1A]">{stats.total_events}</p>
                            </div>

                            <div className="glass card hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#30B22D]/10 rounded-2xl flex items-center justify-center text-xl">
                                        ✓
                                    </div>
                                    <p className="font-medium text-[#6A7686]">Hadir</p>
                                </div>
                                <p className="font-bold text-4xl text-[#080C1A]">{stats.hadir}</p>
                            </div>

                            <div className="glass card hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#FED71F]/10 rounded-2xl flex items-center justify-center text-xl">
                                        ⏰
                                    </div>
                                    <p className="font-medium text-[#6A7686]">Terlambat</p>
                                </div>
                                <p className="font-bold text-4xl text-[#080C1A]">{stats.terlambat}</p>
                            </div>

                            <div className="glass card hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#165DFF]/10 rounded-2xl flex items-center justify-center text-xl">
                                        %
                                    </div>
                                    <p className="font-medium text-[#6A7686]">Kehadiran</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-4xl text-[#080C1A]">{attendanceRate}%</p>
                                    {attendanceRate >= 75 && <span className="bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded-full text-xs font-bold">Good</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <button
                            onClick={() => router.push('/scan')}
                            className="group relative overflow-hidden bg-gradient-to-r from-[#165DFF] to-[#0E4BD9] text-white rounded-[32px] p-8 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-white/80 mb-1 text-sm font-medium">Quick Action</p>
                                    <p className="font-bold text-2xl">Scan Absensi</p>
                                </div>
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                                    📷
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                        </button>

                        <button
                            onClick={() => router.push('/events')}
                            className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] p-8 hover:bg-white/80 transition-all duration-300 text-left hover:shadow-lg group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#6A7686] mb-1 font-medium">Lihat</p>
                                    <p className="font-bold text-2xl text-[#080C1A]">Jadwal Rapat</p>
                                </div>
                                <div className="w-14 h-14 bg-[#165DFF]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    📅
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/permissions')}
                            className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] p-8 hover:bg-white/80 transition-all duration-300 text-left hover:shadow-lg group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#6A7686] mb-1 font-medium">Ajukan</p>
                                    <p className="font-bold text-2xl text-[#080C1A]">Izin/Sakit</p>
                                </div>
                                <div className="w-14 h-14 bg-[#FED71F]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    📝
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-xl text-[#080C1A]">Rapat Mendatang</h3>
                                <p className="text-[#6A7686] text-sm">Jadwal rapat terdekat Anda</p>
                            </div>
                            <button
                                onClick={() => router.push('/events')}
                                className="px-5 py-2 bg-[#F1F3F6] text-[#165DFF] rounded-full text-sm font-semibold hover:bg-[#165DFF] hover:text-white transition-all"
                            >
                                Lihat Semua
                            </button>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-16 bg-[#F9FAFB]/50 rounded-2xl border border-dashed border-gray-200">
                                <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
                                <p className="text-[#6A7686] font-medium">Tidak ada rapat mendatang</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => router.push(`/events/${event.id}`)}
                                        className="group relative overflow-hidden bg-white/50 border border-white/50 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#165DFF] to-[#60A5FA] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                                                <span className="text-lg">📋</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[#080C1A] text-base font-bold truncate group-hover:text-[#165DFF] transition-colors">{event.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-[#6A7686] mt-1">
                                                    <span className="flex items-center gap-1">📅 {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="flex items-center gap-1">⏰ {event.time_start}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pl-4 shrink-0">
                                             <span className="hidden md:inline-flex bg-[#DBEAFE]/80 text-[#1E40AF] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                Mendatang
                                            </span>
                                            <span className="md:hidden text-[#6A7686]">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
