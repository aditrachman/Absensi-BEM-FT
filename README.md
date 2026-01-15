# 📋 Sistem Absensi BEM Fakultas Teknik UNIMMA

Sistem absensi digital untuk rapat dan kegiatan BEM dengan fitur QR Code scanning, manajemen izin, dan dashboard monitoring real-time.

![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Fitur Utama

- ✅ **Authentication** - Login dengan NIM, 3 role (Member, Koordinator, Admin)
- ✅ **Event Management** - CRUD rapat/kegiatan dengan tipe berbeda
- ✅ **QR Code System** - Generate & scan QR code unik per event
- ✅ **Attendance Tracking** - Real-time dengan auto-detect status (Hadir/Terlambat)
- ✅ **Permission System** - Pengajuan izin/sakit dengan approval workflow
- ✅ **Dashboard** - Statistik kehadiran dan monitoring per role
- ✅ **Responsive Design** - Mobile-friendly UI dengan TailwindCSS

## 🚀 Quick Start

**Butuh 5 menit untuk setup!**

### PostgreSQL Version
Lihat [QUICKSTART.md](QUICKSTART.md)

### MySQL Version
Lihat [QUICKSTART_MYSQL.md](QUICKSTART_MYSQL.md)

```bash
# 1. Setup database
# PostgreSQL: createdb absensi_bem
# MySQL: CREATE DATABASE absensi_bem;

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan DB credentials
npm run migrate && npm run seed
npm run dev

# 3. Frontend (terminal baru)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# 4. Open browser
# http://localhost:3000
# Login: admin001 / password123
```

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Auth:** JWT (jsonwebtoken)
- **QR Code:** qrcode library
- **File Upload:** multer

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TailwindCSS
- **QR Scanner:** html5-qrcode
- **HTTP Client:** axios
- **Charts:** Chart.js (ready)

## 📁 Struktur Project

```
absensi-bem/
├── backend/              # REST API Server
│   ├── config/          # Database config
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API endpoints
│   ├── scripts/         # Migration & seed
│   └── server.js        # Entry point
│
├── frontend/            # Next.js App
│   ├── app/            # Pages (App Router)
│   ├── components/     # React components
│   ├── lib/           # API client & utils
│   └── globals.css    # Styles
│
├── database/           # SQL files
│   ├── schema.sql     # Database schema
│   └── seed.sql       # Sample data
│
└── docs/              # Documentation
    ├── API.md         # API documentation
    ├── FEATURES.md    # Feature list
    ├── SETUP.md       # Setup guide
    └── TESTING.md     # Testing guide
```

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Member** | Scan QR, lihat jadwal, ajukan izin, lihat stats pribadi |
| **Koordinator** | + Create event departemen, approve izin, lihat stats departemen |
| **Admin** | + Full access, manage users, lihat stats semua departemen |

## 📊 Database Schema

7 tabel utama dengan relasi:
- `users` - User accounts
- `departments` - BEM departments
- `events` - Rapat/kegiatan
- `event_participants` - Peserta wajib
- `attendances` - Rekam kehadiran
- `permissions` - Pengajuan izin

Lihat [database/schema.sql](database/schema.sql) untuk detail lengkap.

## 🔐 Security

- ✅ JWT authentication dengan 7 days expiry
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Role-based access control
- ✅ QR code dengan unique token & one-time validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation
- ✅ Audit trail (device info, IP, timestamp)

## 📝 Default Accounts

| Role | NIM | Password | Department |
|------|-----|----------|------------|
| Admin | admin001 | password123 | Pengurus Harian |
| Koordinator | koord001 | password123 | Dalam Negeri |
| Member | member001 | password123 | Dalam Negeri |

⚠️ **PENTING:** Ganti semua password sebelum production!

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Setup dalam 5 menit
- **[SETUP.md](SETUP.md)** - Panduan setup lengkap
- **[API.md](API.md)** - API documentation
- **[FEATURES.md](FEATURES.md)** - Daftar fitur & roadmap
- **[TESTING.md](TESTING.md)** - Testing guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview

## 🎯 Roadmap

### ✅ Phase 1 - MVP (Complete)
- Authentication & authorization
- Event management
- QR code system
- Attendance tracking
- Permission workflow
- Dashboard & statistics

### 🚧 Phase 2 - Enhancements (Planned)
- GPS validation
- Email/WhatsApp notifications
- Export Excel/PDF
- Advanced analytics
- User management panel
- Recurring events

### 💡 Phase 3 - Advanced (Future)
- Mobile app (React Native)
- Calendar integration
- Telegram bot
- AI-powered analytics

Lihat [FEATURES.md](FEATURES.md) untuk detail lengkap.

## 🧪 Testing

```bash
# Manual testing
# Lihat TESTING.md untuk test scenarios

# API testing dengan curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nim":"admin001","password":"password123"}'
```

## 🚀 Deployment

### Production Checklist
- [ ] Ganti JWT_SECRET
- [ ] Ganti semua default password
- [ ] Setup HTTPS
- [ ] Configure CORS
- [ ] Setup database backup
- [ ] Enable rate limiting
- [ ] Setup monitoring

### Recommended Hosting
- **Backend:** Railway, Heroku, VPS
- **Frontend:** Vercel, Netlify
- **Database:** Supabase, Railway, PlanetScale

## 🐛 Troubleshooting

**Database connection error?**
- Cek PostgreSQL running
- Cek credentials di `.env`

**Port already in use?**
- Backend: Ubah `PORT` di `.env`
- Frontend: `npm run dev -- -p 3001`

**QR scanner not working?**
- Gunakan Chrome/Firefox/Safari
- Izinkan akses kamera
- Pastikan localhost (bukan IP)

Lihat [SETUP.md](SETUP.md) untuk troubleshooting lengkap.

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Silakan:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- 📖 Baca dokumentasi di folder docs/
- 🐛 Report bugs via Issues
- 💡 Request features via Issues
- 📧 Contact: [your-email]

## 🎉 Acknowledgments

Dibuat berdasarkan PRD Sistem Absensi BEM dengan fokus pada:
- User experience yang intuitif
- Security & anti-fraud
- Real-time monitoring
- Scalability & maintainability

---

**Status:** ✅ MVP Complete & Ready for Testing

**Version:** 1.0.0

**Last Updated:** January 11, 2026

Made with ❤️ for BEM Fakultas Teknik UNIMMA
