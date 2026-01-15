'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { events } from '@/lib/api';
import api from '@/lib/api';

export default function CreateEventPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pleno',
        date: '',
        time_start: '',
        time_end: '',
        location: '',
        late_threshold: 15,
        department_id: '',
        latitude: '',
        longitude: '',
        radius: 100
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Only admin and koordinator can create events
        if (parsedUser.role === 'member') {
            alert('Hanya Admin dan Koordinator yang bisa membuat event');
            router.push('/dashboard');
            return;
        }

        // Auto-fill department for koordinator
        if (parsedUser.department_id) {
            setFormData(prev => ({ ...prev, department_id: parsedUser.department_id }));
        }

        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            // Load departments
            const deptRes = await api.get('/api/departments');
            setDepartments(deptRes.data || []);

            // Load users for participants
            const usersRes = await api.get('/api/users');
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Load data error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const eventData = {
                ...formData,
                participant_ids: selectedParticipants,
                department_id: formData.department_id || null,
                latitude: formData.latitude || null,
                longitude: formData.longitude || null
            };

            await events.create(eventData);
            alert('Event berhasil dibuat!');
            router.push('/events');
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal membuat event');
        } finally {
            setLoading(false);
        }
    };

    const handleParticipantToggle = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllParticipants = () => {
        setSelectedParticipants(users.map(u => u.id));
    };

    const clearAllParticipants = () => {
        setSelectedParticipants([]);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#EFF2F7]">
            <Navbar />

            <div className="pt-24 pb-8">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="text-[#165DFF] hover:underline mb-2 flex items-center text-sm font-semibold"
                            >
                                ← Kembali
                            </button>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#080C1A] mb-1">Buat Event Baru</h2>
                            <p className="text-[#6A7686]">Buat rapat atau kegiatan BEM</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-[24px] border border-[#F3F4F3] p-6 md:p-8">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#165DFF]/10 rounded-lg flex items-center justify-center text-sm">📝</span>
                                Informasi Dasar
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                        Judul Event *
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Contoh: Rapat Pleno Januari 2026"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-[#F3F4F3] rounded-[24px] text-[#080C1A] placeholder:text-[#6A7686] focus:outline-none focus:border-[#165DFF] transition-all duration-200 resize-none"
                                        rows="3"
                                        placeholder="Deskripsi singkat tentang event"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Tipe Event *
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
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Departemen
                                        </label>
                                        <select
                                            className="input-field"
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        >
                                            <option value="">-- Semua Departemen --</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-[#6A7686] mt-1 ml-1">Pilih departemen penyelenggara</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Card */}
                        <div className="bg-white rounded-[24px] border border-[#F3F4F3] p-6 md:p-8">
                             <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#FED71F]/10 rounded-lg flex items-center justify-center text-sm">📅</span>
                                Waktu & Lokasi
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Tanggal *
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
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Waktu Mulai *
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
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Waktu Selesai *
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
                                    <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                        Lokasi *
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Contoh: Ruang Rapat BEM"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                        Batas Keterlambatan (menit)
                                    </label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        placeholder="15"
                                        value={formData.late_threshold}
                                        onChange={(e) => setFormData({ ...formData, late_threshold: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                    <p className="text-xs text-[#6A7686] mt-1 ml-1">
                                        Status "Terlambat" jika check-in melebihi batas ini
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* GPS Location Card (Optional) */}
                        <div className="bg-white rounded-[24px] border border-[#F3F4F3] p-6 md:p-8">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#30B22D]/10 rounded-lg flex items-center justify-center text-sm">📍</span>
                                Lokasi GPS (Opsional)
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="-7.797068"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="110.370529"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Radius (meter)
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="100"
                                            value={formData.radius}
                                            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-[#6A7686] ml-1">
                                    💡 GPS digunakan untuk memvalidasi posisi peserta saat absen (fitur opsional)
                                </p>
                            </div>
                        </div>

                        {/* Participants Card */}
                        <div className="bg-white rounded-[24px] border border-[#F3F4F3] p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-[#080C1A] flex items-center gap-2">
                                    <span className="w-8 h-8 bg-[#ED6B60]/10 rounded-lg flex items-center justify-center text-sm">👥</span>
                                    Peserta Wajib ({selectedParticipants.length})
                                </h3>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        onClick={selectAllParticipants}
                                        className="text-sm text-[#165DFF] font-semibold hover:underline"
                                    >
                                        Pilih Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAllParticipants}
                                        className="text-sm text-[#ED6B60] font-semibold hover:underline"
                                    >
                                        Hapus Semua
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {users.map(u => (
                                    <label
                                        key={u.id}
                                        className={`flex items-center p-3 border rounded-[16px] cursor-pointer transition-all ${selectedParticipants.includes(u.id)
                                                ? 'border-[#165DFF] bg-[#DBEAFE]/30'
                                                : 'border-[#F3F4F3] hover:border-[#165DFF]/50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipants.includes(u.id)}
                                            onChange={() => handleParticipantToggle(u.id)}
                                            className="mr-3 w-5 h-5 accent-[#165DFF] rounded"
                                        />
                                        <div>
                                            <div className="font-semibold text-[#080C1A]">{u.name}</div>
                                            <div className="text-xs text-[#6A7686] mt-0.5">{u.nim} • {u.role}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary"
                            >
                                {loading ? 'Membuat Event...' : 'Buat Event'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 btn-secondary"
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
