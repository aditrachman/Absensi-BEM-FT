'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm' : 'bg-transparent'
        }`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#165DFF] to-[#0E4BD9] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-lg">📋</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-[#080C1A] leading-tight">Absensi BEM</h1>
                            {user && (
                                <span className="text-[10px] text-[#6A7686] font-bold tracking-wider uppercase bg-[#F1F3F6] px-2 py-0.5 rounded-full">
                                    {user.role}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <span className="hidden md:block text-sm font-semibold text-[#080C1A]">
                                    Hi, {user.name.split(' ')[0]}
                                </span>
                                
                                {/* Admin Menu */}
                                {user.role === 'admin' && (
                                    <button
                                        onClick={() => router.push('/admin/users')}
                                        className="hidden md:flex bg-white/50 hover:bg-white border border-white/50 text-[#165DFF] px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                    >
                                        👥 Costumers
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-50 hover:bg-red-100 text-[#ED6B60] p-2 md:px-5 md:py-2 rounded-full md:rounded-[20px] text-sm font-bold transition-all border border-red-100 hover:border-red-200"
                                    title="Logout"
                                >
                                    <span className="hidden md:inline">Logout</span>
                                    <span className="md:hidden">🚪</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
