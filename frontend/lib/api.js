import axios from 'axios';

// Dynamically determine API URL
// Frontend bisa HTTPS, tapi Backend tetap HTTP (port 5000) atau HTTPS (port 5001)
const API_URL = (() => {
    if (typeof window !== 'undefined') {
         const hostname = window.location.hostname;
         if (hostname.startsWith('192.168.') || hostname !== 'localhost') {
             // Mobile/Network access: Use HTTPS on port 3001
             return `https://${hostname}:3001/api`; 
         }
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
})();


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (nim, password) => api.post('/auth/login', { nim, password }),
    me: () => api.get('/auth/me'),
    register: (data) => api.post('/auth/register', data),
};

export const events = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
    getQR: (id) => api.get(`/events/${id}/qr`),
};

export const attendance = {
    scan: (data) => api.post('/attendance/scan', data),
    getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
    getMy: () => api.get('/attendance/my'),
    getStats: (params) => api.get('/attendance/stats', { params }),
};

export const permissions = {
    submit: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        return api.post('/permissions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getAll: (params) => api.get('/permissions', { params }),
    update: (id, data) => api.put(`/permissions/${id}`, data),
};

export default api;
