'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading...</p>
            </div>
        </div>
    );
}
