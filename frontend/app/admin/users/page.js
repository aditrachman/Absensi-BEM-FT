'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UsersManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [formData, setFormData] = useState({
        nim: '',
        name: '',
        email: '',
        password: '',
        role: 'member',
        department_id: '',
        phone: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token || user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [usersRes, deptsRes] = await Promise.all([
                axios.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/users/departments/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            if (editingUser) {
                await axios.put(`${API_URL}/users/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Pengguna berhasil diperbarui!');
            } else {
                const response = await axios.post(`${API_URL}/users`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`Pengguna berhasil dibuat!\nPassword default: ${response.data.user.default_password}`);
            }
            
            setShowForm(false);
            setEditingUser(null);
            setFormData({
                nim: '', name: '', email: '', password: '', role: 'member', department_id: '', phone: ''
            });
            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menyimpan pengguna');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            nim: user.nim,
            name: user.name,
            email: user.email || '',
            password: '',
            role: user.role,
            department_id: user.department_id || '',
            phone: user.phone || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (!confirm('Yakin ingin menghapus pengguna ini?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Pengguna berhasil dihapus!');
            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal menghapus pengguna');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/users/import`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert(`Import selesai!\nBerhasil: ${response.data.results.success}\nGagal: ${response.data.results.failed}`);
            if (response.data.results.errors.length > 0) {
                console.log('Errors:', response.data.results.errors);
            }
            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal mengimport file');
        }
        e.target.value = '';
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/export/excel`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal mengexport data');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.nim.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || user.role === filterRole;
        const matchDept = filterDept === 'all' || user.department_id == filterDept;
        return matchSearch && matchRole && matchDept;
    });

    return (
        <div className="min-h-screen bg-[#EFF2F7]">
            <Navbar />
            
            <div className="pt-24 pb-8">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-[#6A7686] hover:text-[#165DFF] mb-2 flex items-center gap-2 font-medium transition-colors"
                            >
                                ← Kembali ke Dashboard
                            </button>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#080C1A] mb-1">Manajemen Pengguna</h2>
                            <p className="text-[#6A7686]">Kelola akun anggota BEM</p>
                        </div>
                        <div className="flex gap-2">
                            <label className="px-4 py-2.5 border border-[#F3F4F3] rounded-[50px] text-sm font-semibold text-[#080C1A] hover:bg-[#F1F3F6] transition-all cursor-pointer">
                                📤 Import Excel
                                <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                            </label>
                            <button onClick={handleExport} className="px-4 py-2.5 border border-[#F3F4F3] rounded-[50px] text-sm font-semibold text-[#080C1A] hover:bg-[#F1F3F6] transition-all">
                                📥 Export
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingUser(null);
                                    setFormData({
                                        nim: '', name: '', email: '', password: '', role: 'member', department_id: '', phone: ''
                                    });
                                }}
                                className="px-6 py-2.5 bg-[#165DFF] text-white rounded-[50px] font-semibold hover:bg-[#0E4BD9] transition-all"
                            >
                                + Tambah User
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-[24px] border border-[#F3F4F3] p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="🔍 Cari nama atau NIM..."
                                className="input-field"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="input-field"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">Semua Role</option>
                                <option value="admin">Admin</option>
                                <option value="koordinator">Koordinator</option>
                                <option value="member">Member</option>
                            </select>
                            <select
                                className="input-field"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                <option value="all">Semua Departemen</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-[24px] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <h3 className="text-2xl font-bold text-[#080C1A] mb-6">
                                    {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">NIM *</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.nim}
                                                onChange={(e) => setFormData({...formData, nim: e.target.value})}
                                                required
                                                disabled={editingUser}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">Nama Lengkap *</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">Email</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">No. HP</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">Role *</label>
                                            <select
                                                className="input-field"
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                required
                                            >
                                                <option value="member">Member</option>
                                                <option value="koordinator">Koordinator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[#080C1A] text-sm font-medium mb-2">Departemen</label>
                                            <select
                                                className="input-field"
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                            >
                                                <option value="">-- Pilih Departemen --</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[#080C1A] text-sm font-medium mb-2">
                                            Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                                        </label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Default: password123'}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="submit" className="flex-1 btn-primary">
                                            {editingUser ? 'Update' : 'Simpan'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingUser(null);
                                            }}
                                            className="px-8 btn-secondary"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white rounded-[24px] border border-[#F3F4F3] overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#165DFF]/20 border-t-[#165DFF] mb-4"></div>
                                <p className="text-[#6A7686] font-medium">Memuat data...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">👥</div>
                                <p className="text-[#6A7686]">Tidak ada pengguna ditemukan</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F9FAFB] border-b border-[#F3F4F3]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">NIM</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">Nama</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">Departemen</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#6A7686] uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F3F4F3]">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-[#080C1A]">{user.nim}</td>
                                                <td className="px-6 py-4 text-sm text-[#080C1A]">{user.name}</td>
                                                <td className="px-6 py-4 text-sm text-[#6A7686]">{user.email || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        user.role === 'admin' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                                                        user.role === 'koordinator' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                                                        'bg-[#DCFCE7] text-[#166534]'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#6A7686]">{user.department_name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="px-3 py-1.5 bg-[#DBEAFE] text-[#1E40AF] rounded-lg text-xs font-semibold hover:bg-[#165DFF] hover:text-white transition-all"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="px-3 py-1.5 bg-[#FEE2E2] text-[#991B1B] rounded-lg text-xs font-semibold hover:bg-[#ED6B60] hover:text-white transition-all"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-6 bg-[#DBEAFE] border border-[#165DFF] rounded-[24px] p-4">
                        <p className="text-sm text-[#1E40AF]">
                            <strong>Format Excel untuk Import:</strong> Kolom yang diperlukan: <code className="bg-white px-2 py-1 rounded">nim</code>, <code className="bg-white px-2 py-1 rounded">nama</code>, <code className="bg-white px-2 py-1 rounded">role</code>. 
                            Kolom opsional: <code className="bg-white px-2 py-1 rounded">email</code>, <code className="bg-white px-2 py-1 rounded">phone</code>, <code className="bg-white px-2 py-1 rounded">department_id</code>, <code className="bg-white px-2 py-1 rounded">password</code>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
