# Quick Start Guide 🚀

Panduan cepat untuk menjalankan Sistem Absensi BEM dalam 5 menit!

## Prerequisites Checklist

- ✅ Node.js v18+ installed
- ✅ PostgreSQL v14+ installed & running
- ✅ Git installed (optional)

## Step 1: Setup Database (2 menit)

Buka PostgreSQL dan jalankan:

```sql
CREATE DATABASE absensi_bem;
```

## Step 2: Setup Backend (2 menit)

```bash
# Masuk ke folder backend
cd absensi-bem/backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env dengan text editor, sesuaikan:
# DB_PASSWORD=your_postgres_password

# Buat folder uploads
mkdir uploads

# Jalankan migration
npm run migrate

# Jalankan seeder
npm run seed

# Start server
npm run dev
```

✅ Backend running di `http://localhost:5000`

## Step 3: Setup Frontend (1 menit)

Buka terminal baru:

```bash
# Masuk ke folder frontend
cd absensi-bem/frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local

# Start server
npm run dev
```

✅ Frontend running di `http://localhost:3000`

## Step 4: Test Login

Buka browser: `http://localhost:3000`

**Login sebagai Admin:**
- NIM: `admin001`
- Password: `password123`

**Login sebagai Member:**
- NIM: `member001`
- Password: `password123`

## Step 5: Test Fitur Utama

### Sebagai Admin/Koordinator:

1. **Buat Event Rapat:**
   - Klik menu "Jadwal Rapat"
   - Klik "Buat Event" (jika ada)
   - Atau gunakan API langsung

2. **Generate QR Code:**
   - Buka event detail
   - Klik "Lihat QR Code"
   - QR akan muncul

### Sebagai Member:

1. **Scan QR Code:**
   - Klik "Scan Absen" di dashboard
   - Izinkan akses kamera
   - Scan QR code yang sudah di-generate
   - Absensi tercatat!

2. **Ajukan Izin:**
   - Klik "Pengajuan Izin"
   - Klik "+ Ajukan Izin"
   - Isi form dan submit

## Troubleshooting Cepat

### Backend tidak bisa connect ke database?
```bash
# Cek PostgreSQL running
# Windows: buka Services, cari PostgreSQL
# Pastikan status = Running

# Cek kredensial di backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=absensi_bem
DB_USER=postgres
DB_PASSWORD=your_password  # <-- Sesuaikan ini!
```

### Port 5000 atau 3000 sudah dipakai?
```bash
# Backend - ubah di .env
PORT=5001

# Frontend - jalankan dengan port lain
npm run dev -- -p 3001
```

### QR Scanner tidak muncul?
- Pastikan pakai browser Chrome/Firefox/Safari
- Pastikan akses localhost (bukan IP)
- Izinkan akses kamera saat diminta

### Migration error?
```bash
# Drop dan buat ulang database
# Di PostgreSQL:
DROP DATABASE absensi_bem;
CREATE DATABASE absensi_bem;

# Jalankan ulang migration
cd backend
npm run migrate
npm run seed
```

## Test API Langsung (Optional)

Gunakan Postman atau curl:

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"nim\":\"admin001\",\"password\":\"password123\"}"
```

### Get Events (dengan token)
```bash
curl http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Accounts

| Role | NIM | Password | Department |
|------|-----|----------|------------|
| Admin | admin001 | password123 | Pengurus Harian |
| Koordinator | koord001 | password123 | Dalam Negeri |
| Koordinator | koord002 | password123 | Luar Negeri |
| Member | member001 | password123 | Dalam Negeri |
| Member | member002 | password123 | Dalam Negeri |
| Member | member003 | password123 | Luar Negeri |

## Next Steps

Setelah berhasil running:

1. ✅ Explore semua fitur
2. ✅ Baca `FEATURES.md` untuk daftar fitur lengkap
3. ✅ Baca `SETUP.md` untuk setup production
4. ✅ Customize sesuai kebutuhan BEM kamu
5. ✅ Deploy ke production!

## Need Help?

- 📖 Baca dokumentasi lengkap di `README.md`
- 🔧 Cek troubleshooting di `SETUP.md`
- 💡 Lihat fitur yang bisa ditambahkan di `FEATURES.md`

## Production Checklist

Sebelum deploy production:

- [ ] Ganti JWT_SECRET di .env
- [ ] Ganti semua default password
- [ ] Setup HTTPS
- [ ] Setup backup database
- [ ] Enable CORS hanya untuk domain production
- [ ] Setup monitoring & logging
- [ ] Test semua fitur di staging
- [ ] Prepare rollback plan

---

**Selamat! Sistem Absensi BEM sudah siap digunakan! 🎉**
