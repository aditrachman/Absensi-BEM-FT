'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ nim: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await auth.login(formData.nim, formData.password);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            router.push('/dashboard');
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Terlalu banyak percobaan login. Silakan tunggu 15 menit.');
            } else {
                setError(err.response?.data?.error || 'Login gagal. Periksa NIM dan Password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F0F2F5]">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#165DFF]/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#30B22D]/20 blur-[120px]" />

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center p-6 relative z-10 animate-fade-in-up">
                
                {/* Visual Section */}
                <div className="hidden md:flex flex-col justify-center p-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#165DFF] to-[#30B22D] rounded-[32px] rotate-3 opacity-20 blur-xl"></div>
                        <div className="relative glass rounded-[32px] p-8 border border-white/60">
                            <h1 className="text-4xl font-bold text-[#080C1A] mb-4">
                                Absensi <br/>
                                <span className="text-[#165DFF]">Digital BEM</span>
                            </h1>
                            <p className="text-[#6A7686] text-lg leading-relaxed">
                                Sistem presensi modern, cepat, dan efisien untuk Fakultas Teknik UNIMMA.
                                Scan QR Code untuk check-in dalam hitungan detik.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="glass rounded-[32px] p-8 md:p-12 w-full max-w-md mx-auto relative shadow-2xl border border-white/60">
                    <div className="text-center mb-10">
                         <div className="w-16 h-16 bg-[#165DFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            <span className="text-white text-3xl">📋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#080C1A]">Selamat Datang</h2>
                        <p className="text-[#6A7686] text-sm mt-2">Masuk untuk mengakses dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 animate-pulse">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#6A7686] uppercase tracking-wider ml-1">NIM</label>
                            <div className={`transition-all duration-300 rounded-[20px] border-2 ${focused === 'nim' ? 'border-[#165DFF] shadow-lg shadow-blue-500/10' : 'border-[#F3F4F3] bg-white/50'}`}>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 bg-transparent outline-none text-[#080C1A] font-medium placeholder:text-gray-400"
                                    placeholder="20.0501.0001"
                                    value={formData.nim}
                                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                    onFocus={() => setFocused('nim')}
                                    onBlur={() => setFocused('')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#6A7686] uppercase tracking-wider ml-1">Password</label>
                            <div className={`transition-all duration-300 rounded-[20px] border-2 ${focused === 'password' ? 'border-[#165DFF] shadow-lg shadow-blue-500/10' : 'border-[#F3F4F3] bg-white/50'}`}>
                                <input
                                    type="password"
                                    className="w-full px-5 py-3 bg-transparent outline-none text-[#080C1A] font-medium placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused('')}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-[20px] font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#165DFF] hover:bg-[#0E4BD9] shadow-blue-500/30'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : 'Masuk Sekarang'}
                        </button>
                    </form>

                    <p className="text-center text-[#6A7686] text-sm mt-8">
                        © 2024 Fakultas Teknik UNIMMA
                    </p>
                </div>
            </div>
        </div>
    );
}
