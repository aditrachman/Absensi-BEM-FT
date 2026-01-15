# Quick Start Guide - MySQL Version 🚀

Panduan cepat untuk menjalankan Sistem Absensi BEM dengan MySQL dalam 5 menit!

## Prerequisites Checklist

- ✅ Node.js v18+ installed
- ✅ MySQL v8.0+ installed & running
- ✅ Git installed (optional)

## Step 1: Setup Database (2 menit)

### Buka MySQL Command Line atau MySQL Workbench:

```sql
-- Login ke MySQL
mysql -u root -p

-- Buat database
CREATE DATABASE absensi_bem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- (Optional) Buat user khusus
CREATE USER 'bem_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON absensi_bem.* TO 'bem_user'@'localhost';
FLUSH PRIVILEGES;

-- Keluar
EXIT;
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
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=absensi_bem
# DB_USER=root
# DB_PASSWORD=your_mysql_password

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

## Perbedaan dengan PostgreSQL

### 1. Package yang Digunakan
- PostgreSQL: `pg`
- MySQL: `mysql2`

### 2. Syntax SQL
- **Auto Increment:**
  - PostgreSQL: `SERIAL`
  - MySQL: `AUTO_INCREMENT`

- **Boolean:**
  - PostgreSQL: `BOOLEAN`
  - MySQL: `BOOLEAN` atau `TINYINT(1)`

- **Enum:**
  - PostgreSQL: `CHECK (column IN (...))`
  - MySQL: `ENUM('value1', 'value2')`

- **Timestamp Update:**
  - PostgreSQL: Trigger function
  - MySQL: `ON UPDATE CURRENT_TIMESTAMP`

### 3. Connection Pool
- PostgreSQL: `new Pool()`
- MySQL: `mysql.createPool()`

### 4. Query Execution
- PostgreSQL: `pool.query()` returns `{ rows: [...] }`
- MySQL: `pool.query()` returns `[rows, fields]`

## Troubleshooting MySQL

### Error: Access denied for user
```bash
# Reset MySQL root password atau buat user baru
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Error: Client does not support authentication protocol
```bash
# Gunakan mysql_native_password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Error: ER_NOT_SUPPORTED_AUTH_MODE
```bash
# Update authentication method
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
```

### Port 3306 sudah dipakai?
```bash
# Cek service MySQL
# Windows: Services -> MySQL -> Status
# Atau ganti port di my.ini/my.cnf
```

### Migration error?
```bash
# Drop dan buat ulang database
mysql -u root -p
DROP DATABASE absensi_bem;
CREATE DATABASE absensi_bem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Jalankan ulang migration
cd backend
npm run migrate
npm run seed
```

## Verifikasi Database

```sql
-- Login ke MySQL
mysql -u root -p

-- Gunakan database
USE absensi_bem;

-- Cek tabel yang sudah dibuat
SHOW TABLES;

-- Cek data users
SELECT id, nim, name, role FROM users;

-- Cek departments
SELECT * FROM departments;
```

Expected output:
```
+----+-----------+---------------------------+-------------+
| id | nim       | name                      | role        |
+----+-----------+---------------------------+-------------+
|  1 | admin001  | Admin BEM                 | admin       |
|  2 | koord001  | Koordinator Dalam Negeri  | koordinator |
|  3 | koord002  | Koordinator Luar Negeri   | koordinator |
|  4 | member001 | Anggota Satu              | member      |
+----+-----------+---------------------------+-------------+
```

## Test API dengan MySQL

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"nim\":\"admin001\",\"password\":\"password123\"}"

# Response akan berisi token
```

## MySQL Workbench (Optional)

Jika pakai MySQL Workbench:
1. Buka MySQL Workbench
2. Connect ke localhost
3. Buka database `absensi_bem`
4. Bisa lihat tabel dan data secara visual

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

## MySQL vs PostgreSQL - Kapan Pakai Apa?

### Pakai MySQL jika:
- ✅ Sudah familiar dengan MySQL
- ✅ Hosting support MySQL (shared hosting)
- ✅ Butuh compatibility dengan WordPress/PHP apps
- ✅ Read-heavy workload

### Pakai PostgreSQL jika:
- ✅ Butuh advanced features (JSON, arrays, etc)
- ✅ Complex queries & analytics
- ✅ Write-heavy workload
- ✅ Better for large scale apps

**Untuk sistem absensi BEM, keduanya sama-sama bagus!** 🎉

---

**Selamat! Sistem Absensi BEM dengan MySQL sudah siap digunakan! 🎉**
