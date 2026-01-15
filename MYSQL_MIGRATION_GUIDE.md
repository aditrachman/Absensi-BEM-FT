# MySQL Migration Guide

Panduan lengkap untuk menggunakan MySQL instead of PostgreSQL.

## 📋 Yang Sudah Diupdate

✅ Database schema (schema.sql) - MySQL syntax
✅ package.json - mysql2 instead of pg
✅ database.js - MySQL connection pool
✅ .env.example - MySQL default port & config

## 🔄 Files yang Perlu Diganti

Karena MySQL menggunakan array destructuring `[rows]` instead of `result.rows`, ada beberapa file yang perlu diupdate:

### Option 1: Manual Update (Recommended)

Update semua query di file-file berikut dari:
```javascript
const result = await pool.query('SELECT...', [params]);
const data = result.rows;
```

Menjadi:
```javascript
const [rows] = await pool.query('SELECT...', [params]);
const data = rows;
```

### Option 2: Gunakan File MySQL Version

Saya sudah buat file alternatif:
- `auth-mysql.js` - Sudah compatible dengan MySQL
- `auth-mysql.js` middleware - Sudah compatible dengan MySQL

**Cara pakai:**
```bash
# Backup file original
cd backend/routes
copy auth.js auth-postgres.js

# Ganti dengan MySQL version
copy auth-mysql.js auth.js

# Sama untuk middleware
cd ../middleware
copy auth.js auth-postgres.js
copy auth-mysql.js auth.js
```

## 🛠️ Update Manual untuk File Lain

### 1. routes/events.js

Ganti semua:
```javascript
// PostgreSQL
const result = await pool.query('SELECT...', [params]);
return result.rows;

// MySQL
const [rows] = await pool.query('SELECT...', [params]);
return rows;
```

Contoh spesifik:
```javascript
// Line ~20 - Get all events
const [rows] = await pool.query(query, params);
res.json(rows);

// Line ~60 - Get event by ID
const [rows] = await pool.query(`SELECT...`, [req.params.id]);
if (rows.length === 0) {
  return res.status(404).json({ error: 'Event not found' });
}

// Line ~80 - Get participants
const [participants] = await pool.query(`SELECT...`, [req.params.id]);

res.json({
  ...rows[0],
  participants: participants
});
```

### 2. routes/attendance.js

Update query results:
```javascript
// Line ~20 - Get event by QR token
const [eventRows] = await pool.query(
  'SELECT * FROM events WHERE qr_token = ? AND is_active = true',
  [qr_token]
);

if (eventRows.length === 0) {
  return res.status(404).json({ error: 'Invalid or expired QR code' });
}

const event = eventRows[0];

// Line ~40 - Check participant
const [participantRows] = await pool.query(
  'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
  [event.id, req.user.id]
);

if (participantRows.length === 0) {
  return res.status(403).json({ error: 'You are not registered for this event' });
}

// Line ~50 - Check duplicate
const [attendanceRows] = await pool.query(
  'SELECT * FROM attendances WHERE event_id = ? AND user_id = ?',
  [event.id, req.user.id]
);

if (attendanceRows.length > 0) {
  return res.status(400).json({ error: 'Already checked in for this event' });
}

// Line ~70 - Insert attendance
const [result] = await pool.query(
  `INSERT INTO attendances (
    event_id, user_id, status, check_in_time, latitude, longitude, device_info, ip_address
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [event.id, req.user.id, status, now, latitude, longitude, device_info, req.ip]
);

// Get inserted record
const [newAttendance] = await pool.query(
  'SELECT * FROM attendances WHERE id = ?',
  [result.insertId]
);

res.status(201).json({
  message: 'Attendance recorded successfully',
  attendance: newAttendance[0],
  event: { id: event.id, title: event.title, date: event.date, time_start: event.time_start }
});
```

### 3. routes/permissions.js

Update query results:
```javascript
// Line ~40 - Check participant
const [participantRows] = await pool.query(
  'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
  [event_id, req.user.id]
);

if (participantRows.length === 0) {
  return res.status(403).json({ error: 'You are not registered for this event' });
}

// Line ~50 - Check existing
const [existingRows] = await pool.query(
  'SELECT * FROM permissions WHERE event_id = ? AND user_id = ?',
  [event_id, req.user.id]
);

if (existingRows.length > 0) {
  return res.status(400).json({ error: 'Permission already submitted for this event' });
}

// Line ~60 - Insert permission
const [result] = await pool.query(
  `INSERT INTO permissions (event_id, user_id, type, reason, proof_file)
   VALUES (?, ?, ?, ?, ?)`,
  [event_id, req.user.id, type, reason, proof_file]
);

// Get inserted record
const [newPermission] = await pool.query(
  'SELECT * FROM permissions WHERE id = ?',
  [result.insertId]
);

res.status(201).json(newPermission[0]);
```

## 🔧 Parameter Placeholders

### PostgreSQL menggunakan $1, $2, $3
```javascript
pool.query('SELECT * FROM users WHERE nim = $1 AND role = $2', [nim, role])
```

### MySQL menggunakan ?
```javascript
pool.query('SELECT * FROM users WHERE nim = ? AND role = ?', [nim, role])
```

**Find & Replace:**
- `$1` → `?`
- `$2` → `?`
- `$3` → `?`
- dst...

## 📝 Checklist Update

- [ ] Update `backend/config/database.js` ✅ (Sudah)
- [ ] Update `backend/package.json` ✅ (Sudah)
- [ ] Update `backend/.env.example` ✅ (Sudah)
- [ ] Update `database/schema.sql` ✅ (Sudah)
- [ ] Update `backend/middleware/auth.js`
- [ ] Update `backend/routes/auth.js`
- [ ] Update `backend/routes/events.js`
- [ ] Update `backend/routes/attendance.js`
- [ ] Update `backend/routes/permissions.js`
- [ ] Update `backend/scripts/migrate.js`
- [ ] Update `backend/scripts/seed.js`

## 🚀 Quick Fix Script

Buat file `fix-mysql.sh` atau jalankan manual:

```bash
# Di folder backend/routes
# Find & replace $1, $2, etc dengan ?

# Contoh dengan sed (Linux/Mac):
sed -i 's/\$1/?/g' auth.js
sed -i 's/\$2/?/g' auth.js
# ... dst

# Atau pakai text editor dengan Find & Replace All
```

## ✅ Testing

Setelah update semua file:

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup database
mysql -u root -p
CREATE DATABASE absensi_bem;
EXIT;

# 3. Run migration
npm run migrate

# 4. Run seeder
npm run seed

# 5. Start server
npm run dev

# 6. Test API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nim":"admin001","password":"password123"}'
```

## 🐛 Common Errors & Solutions

### Error: ER_NOT_SUPPORTED_AUTH_MODE
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

### Error: Cannot find module 'mysql2'
```bash
npm install mysql2
```

### Error: Access denied
```bash
# Check .env file
DB_USER=root
DB_PASSWORD=your_actual_password
```

### Error: Unknown database
```sql
CREATE DATABASE absensi_bem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📚 Resources

- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [MySQL vs PostgreSQL](https://www.postgresqltutorial.com/postgresql-vs-mysql/)
- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)

---

**Note:** Jika terlalu ribet update manual, saya bisa buatkan semua file MySQL version yang lengkap. Tinggal bilang! 😊
