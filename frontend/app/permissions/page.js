'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { permissions, events } from '@/lib/api';

export default function PermissionsPage() {
    const router = useRouter();
    const [permissionsList, setPermissionsList] = useState([]);
    const [eventsList, setEventsList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        event_id: '',
        type: 'izin',
        reason: '',
        proof_file: null
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            const [permsRes, eventsRes] = await Promise.all([
                permissions.getAll(),
                events.getAll()
            ]);
            setPermissionsList(permsRes.data);
            
            // Filter events that happen in the future or today
            const activeEvents = eventsRes.data.filter(e => {
                const eventDate = new Date(e.date);
                const today = new Date();
                today.setHours(0,0,0,0);
                return eventDate >= today;
            });
            setEventsList(activeEvents);
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await permissions.submit(formData);
            alert('Pengajuan izin berhasil dikirim!');
            setShowForm(false);
            setFormData({ event_id: '', type: 'izin', reason: '', proof_file: null });
            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal mengirim pengajuan');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved':
                return <span className="bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full text-xs font-bold border border-[#DCFCE7] shadow-sm">Disetujui</span>;
            case 'rejected':
                return <span className="bg-[#FEE2E2] text-[#991B1B] px-3 py-1 rounded-full text-xs font-bold border border-[#FEE2E2] shadow-sm">Ditolak</span>;
            default:
                return <span className="bg-[#FEF9C3] text-[#854D0E] px-3 py-1 rounded-full text-xs font-bold border border-[#FEF9C3] shadow-sm">Menunggu</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden">
             {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#165DFF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#30B22D]/10 blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="pt-28 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in-up">
                        <div>
                             <button
                                onClick={() => router.push('/dashboard')}
                                className="text-[#6A7686] hover:text-[#165DFF] mb-2 flex items-center gap-2 font-medium transition-colors"
                            >
                                ← Kembali ke Dashboard
                            </button>
                            <h2 className="text-3xl font-bold text-[#080C1A]">Pengajuan Izin</h2>
                            <p className="text-[#6A7686] text-lg">Kelola izin dan ketidakhadiran rapat</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`px-8 py-4 rounded-[20px] font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                                showForm 
                                    ? 'bg-white text-[#ED6B60] border border-red-100 hover:bg-red-50' 
                                    : 'bg-[#165DFF] text-white shadow-blue-500/30 hover:bg-[#0E4BD9]'
                            }`}
                        >
                            {showForm ? 'Batal Pengajuan' : '+ Buat Izin Baru'}
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="glass card p-8 mb-8 animate-fade-in-up border border-white/60">
                            <h3 className="text-xl font-bold text-[#080C1A] mb-6 flex items-center gap-2">
                                📝 Form Izin
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[#080C1A] text-sm font-bold ml-1">Pilih Rapat</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 bg-white/50 border border-[#F3F4F3] rounded-[20px] text-[#080C1A] font-medium focus:outline-none focus:border-[#165DFF] focus:shadow-lg focus:shadow-blue-500/10 transition-all appearance-none cursor-pointer"
                                                value={formData.event_id}
                                                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Pilih Jadwal Rapat --</option>
                                                {eventsList.map((event) => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.title} • {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6A7686]">
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[#080C1A] text-sm font-bold ml-1">Jenis Izin</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 bg-white/50 border border-[#F3F4F3] rounded-[20px] text-[#080C1A] font-medium focus:outline-none focus:border-[#165DFF] focus:shadow-lg focus:shadow-blue-500/10 transition-all appearance-none cursor-pointer"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                required
                                            >
                                                <option value="izin">Izin (Kegiatan Lain)</option>
                                                <option value="sakit">Sakit</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6A7686]">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[#080C1A] text-sm font-bold ml-1">Alasan Detail</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-white/50 border border-[#F3F4F3] rounded-[20px] text-[#080C1A] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#165DFF] focus:shadow-lg focus:shadow-blue-500/10 transition-all resize-none"
                                        rows="4"
                                        placeholder="Jelaskan alasan ketidakhadiran Anda secara rinci..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[#080C1A] text-sm font-bold ml-1">Upload Bukti (Opsional)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFormData({ ...formData, proof_file: e.target.files[0] })}
                                        />
                                        <div className="w-full px-5 py-4 bg-white/50 border-2 border-dashed border-[#165DFF]/30 rounded-[20px] text-[#165DFF] font-medium group-hover:bg-[#F0F7FF] group-hover:border-[#165DFF] transition-all flex items-center justify-center gap-2">
                                            <span>{formData.proof_file ? '📄 ' + formData.proof_file.name : '📤 Klik untuk upload surat/bukti'}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#6A7686] ml-1">Format: JPG, PNG, PDF (Max 5MB)</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-[#165DFF] text-white rounded-[20px] font-bold shadow-lg shadow-blue-500/30 hover:bg-[#0E4BD9] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Permissions History */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-[#080C1A]">Riwayat Pengajuan</h3>
                        
                        {loading ? (
                            <div className="glass card flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#165DFF]/20 border-t-[#165DFF] mb-4"></div>
                                <p className="text-[#6A7686] font-medium">Memuat riwayat...</p>
                            </div>
                        ) : permissionsList.length === 0 ? (
                            <div className="glass card py-20 text-center">
                                <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
                                <h4 className="text-xl font-bold text-[#080C1A] mb-2">Belum Ada Pengajuan</h4>
                                <p className="text-[#6A7686]">Anda belum pernah mengajukan izin untuk rapat apapun.</p>
                            </div>
                        ) : (
                            permissionsList.map((perm) => (
                                <div key={perm.id} className="glass card group hover:bg-white transition-colors duration-300 animate-fade-in-up">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-[#080C1A]">{perm.event_title}</h4>
                                                {getStatusBadge(perm.status)}
                                            </div>
                                            <p className="text-[#6A7686] flex items-center gap-2">
                                                📅 {new Date(perm.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-[#6A7686] font-semibold uppercase tracking-wider">Tanggal Pengajuan</p>
                                            <p className="font-bold text-[#080C1A]">
                                                {new Date(perm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-bold uppercase tracking-wider mb-1">Jenis Izin</p>
                                                <p className="font-bold text-[#080C1A] capitalize flex items-center gap-2">
                                                    {perm.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#6A7686] font-bold uppercase tracking-wider mb-1">Alasan</p>
                                                <p className="text-[#080C1A] leading-relaxed">{perm.reason}</p>
                                            </div>
                                        </div>

                                        {perm.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs text-[#6A7686] font-bold uppercase tracking-wider mb-1">Catatan Admin</p>
                                                <p className="text-[#080C1A] italic bg-white p-3 rounded-xl border border-gray-200 text-sm">
                                                    "{perm.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
