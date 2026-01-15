'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { events } from '@/lib/api';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pleno',
        date: '',
        time_start: '',
        time_end: '',
        location: '',
        late_threshold: 15
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        if (parsedUser.role === 'member') {
            alert('Hanya Admin dan Koordinator yang bisa edit event');
            router.push('/events');
            return;
        }

        loadEvent();
    }, [params.id, router]);

    const loadEvent = async () => {
        try {
            const response = await events.getById(params.id);
            const event = response.data;
            setFormData({
                title: event.title || '',
                description: event.description || '',
                type: event.type || 'pleno',
                date: event.date || '',
                time_start: event.time_start || '',
                time_end: event.time_end || '',
                location: event.location || '',
                late_threshold: event.late_threshold || 15
            });
        } catch (error) {
            console.error('Load event error:', error);
            alert('Event tidak ditemukan');
            router.push('/events');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await events.update(params.id, formData);
            alert('Event berhasil diupdate!');
            router.push(`/events/${params.id}`);
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal update event');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="container mx-auto px-4 py-8 relative z-10 pt-28">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 animate-fade-in-up">
                        <button
                            onClick={() => router.back()}
                             className="text-[#6A7686] hover:text-[#165DFF] mb-4 flex items-center gap-2 font-medium transition-colors"
                        >
                            ← Kembali
                        </button>
                        <h2 className="text-3xl font-bold text-[#080C1A] mb-2">Edit Event</h2>
                        <p className="text-[#6A7686]">Update informasi event</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass card">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Event</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Judul Event <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        className="input-field"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Tipe Event <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="input-field"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                        >
                                            <option value="pleno">Pleno</option>
                                            <option value="departemen">Departemen</option>
                                            <option value="koordinasi">Koordinasi</option>
                                            <option value="lainnya">Lainnya</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Batas Keterlambatan (menit)
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={formData.late_threshold}
                                            onChange={(e) => setFormData({ ...formData, late_threshold: parseInt(e.target.value) })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Tanggal <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Waktu Mulai <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            value={formData.time_start}
                                            onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Waktu Selesai <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            value={formData.time_end}
                                            onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Lokasi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : '✓ Simpan Perubahan'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-secondary"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
