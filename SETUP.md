# Setup Guide - Sistem Absensi BEM

## Prerequisites

- Node.js (v18 atau lebih baru)
- PostgreSQL (v14 atau lebih baru)
- npm atau yarn

## Setup Database

1. Install PostgreSQL dan buat database baru:
```sql
CREATE DATABASE absensi_bem;
```

2. Buat user database (opsional):
```sql
CREATE USER bem_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE absensi_bem TO bem_user;
```

## Setup Backend

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Buat folder uploads:
```bash
mkdir uploads
```

4. Copy dan edit file .env:
```bash
copy .env.example .env
```

Edit file `.env` dengan kredensial database Anda:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=absensi_bem
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

CORS_ORIGIN=http://localhost:3000
```

5. Jalankan migration:
```bash
npm run migrate
```

6. Jalankan seeder:
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

## Setup Frontend

1. Buka terminal baru, masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy dan edit file .env:
```bash
copy .env.example .env.local
```

Edit file `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start frontend server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Testing

1. Buka browser dan akses `http://localhost:3000`

2. Login dengan kredensial default:
   - **Admin**: NIM `admin001` / Password `password123`
   - **Koordinator**: NIM `koord001` / Password `password123`
   - **Member**: NIM `member001` / Password `password123`

## Fitur yang Bisa Ditest

### Sebagai Member:
- ✅ Login
- ✅ Lihat dashboard dengan statistik kehadiran
- ✅ Lihat jadwal rapat
- ✅ Scan QR Code untuk absen (perlu QR dari admin/koordinator)
- ✅ Ajukan izin/sakit
- ✅ Lihat riwayat pengajuan izin

### Sebagai Koordinator:
- ✅ Semua fitur member
- ✅ Buat event rapat departemen
- ✅ Generate QR Code untuk rapat
- ✅ Lihat daftar kehadiran
- ✅ Approve/reject pengajuan izin

### Sebagai Admin:
- ✅ Semua fitur koordinator
- ✅ Buat event rapat untuk semua departemen
- ✅ Lihat statistik kehadiran semua anggota
- ✅ Export laporan
- ✅ Manajemen user

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL sudah running
- Cek kredensial di file .env
- Pastikan database sudah dibuat

### Port Already in Use
- Backend: Ubah PORT di .env
- Frontend: Jalankan dengan `npm run dev -- -p 3001`

### QR Scanner Not Working
- Pastikan menggunakan HTTPS atau localhost
- Izinkan akses kamera di browser
- Test di browser yang support (Chrome, Firefox, Safari)

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Gunakan PM2 atau similar process manager
3. Setup reverse proxy dengan Nginx
4. Enable HTTPS

### Frontend
1. Build production: `npm run build`
2. Deploy ke Vercel/Netlify atau
3. Serve dengan: `npm start`

### Database
1. Gunakan managed PostgreSQL (Supabase, Railway, dll)
2. Backup database secara berkala
3. Enable SSL connection

## Support

Jika ada masalah, cek:
1. Console browser untuk error frontend
2. Terminal backend untuk error API
3. PostgreSQL logs untuk error database

## Next Steps

Setelah MVP berjalan, bisa tambahkan:
- Notifikasi real-time
- GPS validation yang lebih akurat
- Export laporan Excel/PDF
- Dashboard analytics dengan grafik
- Email notifications
- Mobile app (React Native)
