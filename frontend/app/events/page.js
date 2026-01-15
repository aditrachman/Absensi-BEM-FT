'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { events } from '@/lib/api';

export default function EventsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [eventsList, setEventsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        loadEvents();
    }, [router, filter]);

    const loadEvents = async () => {
        try {
            const params = filter !== 'all' ? { type: filter } : {};
            const response = await events.getAll(params);
            setEventsList(response.data);
        } catch (error) {
            console.error('Load events error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">Selesai</span>;
        } else if (eventDate.getTime() === today.getTime()) {
            return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 shadow-sm">Hari Ini</span>;
        } else {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-sm">Mendatang</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="pt-28 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in-up">
                        <div>
                             <button
                                onClick={() => router.push('/dashboard')}
                                className="text-[#6A7686] hover:text-[#165DFF] mb-2 flex items-center gap-2 font-medium transition-colors"
                            >
                                ← Kembali ke Dashboard
                            </button>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#080C1A] mb-2">Jadwal Rapat</h2>
                            <p className="text-[#6A7686] text-lg">Daftar agenda dan kegiatan BEM</p>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'koordinator') && (
                            <button
                                onClick={() => router.push('/events/create')}
                                className="px-8 py-4 bg-[#165DFF] text-white rounded-[50px] font-bold hover:bg-[#0E4BD9] shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all"
                            >
                                + Buat Event Baru
                            </button>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="glass card p-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'pleno', label: 'Pleno' },
                                { value: 'departemen', label: 'Departemen' },
                                { value: 'koordinasi', label: 'Koordinasi' }
                            ].map((filterOption) => (
                                <button
                                    key={filterOption.value}
                                    onClick={() => setFilter(filterOption.value)}
                                    className={`px-6 py-2.5 rounded-[50px] font-semibold transition-all duration-300 ${
                                        filter === filterOption.value
                                            ? 'bg-[#165DFF] text-white shadow-md'
                                            : 'bg-transparent text-[#6A7686] hover:bg-[#F3F4F3]'
                                    }`}
                                >
                                    {filterOption.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Events List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#165DFF]/20 border-t-[#165DFF] mb-6"></div>
                            <p className="text-[#6A7686] font-medium text-lg">Memuat jadwal...</p>
                        </div>
                    ) : eventsList.length === 0 ? (
                        <div className="glass card py-20 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="text-7xl mb-6 opacity-80">📭</div>
                            <h3 className="text-2xl font-bold text-[#080C1A] mb-3">Tidak Ada Rapat</h3>
                            <p className="text-[#6A7686]">Belum ada jadwal rapat untuk kategori ini</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {eventsList.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => router.push(`/events/${event.id}`)}
                                    className="group glass p-6 rounded-[24px] cursor-pointer hover:bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/60"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl md:text-2xl font-bold text-[#080C1A] group-hover:text-[#165DFF] transition-colors">{event.title}</h3>
                                                {getStatusBadge(event)}
                                            </div>
                                            <p className="text-[#6A7686] line-clamp-2">{event.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#165DFF]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
                                                📅
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-semibold uppercase tracking-wider">Tanggal</p>
                                                <p className="font-bold text-[#080C1A]">
                                                     {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#30B22D]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
                                                ⏰
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-semibold uppercase tracking-wider">Waktu</p>
                                                <p className="font-bold text-[#080C1A]">{event.time_start}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FED71F]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
                                                📍
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-semibold uppercase tracking-wider">Lokasi</p>
                                                <p className="font-bold text-[#080C1A] truncate max-w-[120px]">{event.location}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#ED6B60]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform">
                                                👥
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-semibold uppercase tracking-wider">Kehadiran</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-[#080C1A]">
                                                        {event.total_attended || 0} <span className="text-gray-400 font-normal">/ {event.total_participants || 0}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
