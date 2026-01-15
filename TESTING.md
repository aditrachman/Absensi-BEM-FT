# Testing Guide

Panduan untuk testing Sistem Absensi BEM secara manual.

## Test Scenarios

### 1. Authentication Flow

#### Test Case 1.1: Login Success
**Steps:**
1. Buka `http://localhost:3000/login`
2. Input NIM: `admin001`
3. Input Password: `password123`
4. Klik "Login"

**Expected:**
- ✅ Redirect ke `/dashboard`
- ✅ Token tersimpan di localStorage
- ✅ User info tersimpan di localStorage
- ✅ Navbar menampilkan nama user

#### Test Case 1.2: Login Failed
**Steps:**
1. Buka `/login`
2. Input NIM: `admin001`
3. Input Password: `wrongpassword`
4. Klik "Login"

**Expected:**
- ❌ Error message muncul
- ❌ Tidak redirect
- ❌ Token tidak tersimpan

#### Test Case 1.3: Protected Route
**Steps:**
1. Logout (hapus token dari localStorage)
2. Akses langsung `http://localhost:3000/dashboard`

**Expected:**
- ✅ Redirect ke `/login`

---

### 2. Dashboard Flow

#### Test Case 2.1: View Dashboard (Member)
**Steps:**
1. Login sebagai member001
2. Lihat dashboard

**Expected:**
- ✅ Menampilkan nama user
- ✅ Menampilkan 3 quick actions
- ✅ Menampilkan statistik kehadiran
- ✅ Menampilkan upcoming events

#### Test Case 2.2: Statistics Calculation
**Steps:**
1. Login sebagai member yang sudah punya attendance
2. Cek statistik

**Expected:**
- ✅ Total rapat sesuai
- ✅ Hadir, terlambat, izin, sakit, alpha sesuai
- ✅ Persentase kehadiran benar

---

### 3. Event Management Flow

#### Test Case 3.1: View Events List
**Steps:**
1. Login sebagai member
2. Klik "Jadwal Rapat"

**Expected:**
- ✅ Menampilkan list events
- ✅ Filter by type berfungsi
- ✅ Event card menampilkan info lengkap

#### Test Case 3.2: View Event Detail
**Steps:**
1. Di halaman events
2. Klik salah satu event

**Expected:**
- ✅ Menampilkan detail event
- ✅ Menampilkan list participants
- ✅ Menampilkan status kehadiran

#### Test Case 3.3: Create Event (Admin)
**Steps:**
1. Login sebagai admin001
2. Buat event baru via API atau form

**Expected:**
- ✅ Event berhasil dibuat
- ✅ QR code ter-generate
- ✅ Participants ter-assign

---

### 4. QR Code & Attendance Flow

#### Test Case 4.1: Generate QR Code
**Steps:**
1. Login sebagai admin/koordinator
2. Buka event detail
3. Klik "Lihat QR Code"

**Expected:**
- ✅ QR code muncul
- ✅ QR code bisa di-scan
- ✅ QR code berisi token yang valid

#### Test Case 4.2: Scan QR - Success (On Time)
**Steps:**
1. Login sebagai member yang terdaftar di event
2. Klik "Scan Absen"
3. Izinkan akses kamera
4. Scan QR code sebelum batas waktu terlambat

**Expected:**
- ✅ Scan berhasil
- ✅ Status: "hadir"
- ✅ Check-in time tercatat
- ✅ Success message muncul

#### Test Case 4.3: Scan QR - Late
**Steps:**
1. Login sebagai member
2. Scan QR code setelah batas waktu terlambat

**Expected:**
- ✅ Scan berhasil
- ✅ Status: "terlambat"
- ✅ Check-in time tercatat

#### Test Case 4.4: Scan QR - Already Scanned
**Steps:**
1. Login sebagai member yang sudah scan
2. Scan QR code yang sama lagi

**Expected:**
- ❌ Error: "Already checked in"
- ❌ Tidak membuat record baru

#### Test Case 4.5: Scan QR - Not Participant
**Steps:**
1. Login sebagai member yang tidak terdaftar di event
2. Scan QR code

**Expected:**
- ❌ Error: "Not registered for this event"

#### Test Case 4.6: Scan QR - Invalid Token
**Steps:**
1. Scan QR code dengan token invalid/expired

**Expected:**
- ❌ Error: "Invalid or expired QR code"

---

### 5. Permission Flow

#### Test Case 5.1: Submit Permission
**Steps:**
1. Login sebagai member
2. Klik "Pengajuan Izin"
3. Klik "+ Ajukan Izin"
4. Pilih event
5. Pilih jenis: Izin
6. Isi keterangan
7. Upload bukti (optional)
8. Submit

**Expected:**
- ✅ Permission berhasil dibuat
- ✅ Status: "pending"
- ✅ File ter-upload (jika ada)
- ✅ Muncul di riwayat

#### Test Case 5.2: View Permissions (Member)
**Steps:**
1. Login sebagai member
2. Buka halaman permissions

**Expected:**
- ✅ Hanya menampilkan permission milik sendiri
- ✅ Status badge sesuai
- ✅ Detail lengkap

#### Test Case 5.3: Approve Permission (Koordinator)
**Steps:**
1. Login sebagai koordinator
2. Buka halaman permissions
3. Pilih permission dengan status pending
4. Approve dengan notes

**Expected:**
- ✅ Status berubah jadi "approved"
- ✅ Reviewed_by tercatat
- ✅ Reviewed_at tercatat
- ✅ Attendance record ter-create/update dengan status "izin"

#### Test Case 5.4: Reject Permission
**Steps:**
1. Login sebagai koordinator
2. Reject permission dengan notes

**Expected:**
- ✅ Status berubah jadi "rejected"
- ✅ Notes tersimpan
- ✅ Attendance tidak ter-update

---

### 6. Role-Based Access Control

#### Test Case 6.1: Member Access
**Steps:**
1. Login sebagai member
2. Coba akses fitur admin

**Expected:**
- ❌ Tidak bisa create event
- ❌ Tidak bisa approve permission
- ❌ Tidak bisa lihat stats semua user
- ✅ Bisa scan QR
- ✅ Bisa ajukan izin
- ✅ Bisa lihat dashboard sendiri

#### Test Case 6.2: Koordinator Access
**Steps:**
1. Login sebagai koordinator
2. Test akses fitur

**Expected:**
- ✅ Bisa create event departemen
- ✅ Bisa approve permission departemen
- ✅ Bisa lihat stats departemen
- ❌ Tidak bisa manage user
- ❌ Tidak bisa lihat stats departemen lain

#### Test Case 6.3: Admin Access
**Steps:**
1. Login sebagai admin
2. Test akses fitur

**Expected:**
- ✅ Full access semua fitur
- ✅ Bisa create event semua tipe
- ✅ Bisa approve semua permission
- ✅ Bisa lihat stats semua departemen
- ✅ Bisa register user baru

---

## API Testing dengan Postman/curl

### Setup
1. Import collection atau buat manual
2. Set environment variable:
   - `base_url`: http://localhost:5000/api
   - `token`: (akan di-set setelah login)

### Test Sequence

#### 1. Login
```bash
POST {{base_url}}/auth/login
Body:
{
  "nim": "admin001",
  "password": "password123"
}

# Save token dari response
```

#### 2. Get Current User
```bash
GET {{base_url}}/auth/me
Headers:
Authorization: Bearer {{token}}
```

#### 3. Get Events
```bash
GET {{base_url}}/events
Headers:
Authorization: Bearer {{token}}
```

#### 4. Create Event
```bash
POST {{base_url}}/events
Headers:
Authorization: Bearer {{token}}
Body:
{
  "title": "Test Event",
  "type": "pleno",
  "date": "2026-01-20",
  "time_start": "19:00",
  "time_end": "21:00",
  "location": "Test Location",
  "participant_ids": [1, 2, 3]
}
```

#### 5. Get QR Code
```bash
GET {{base_url}}/events/1/qr
Headers:
Authorization: Bearer {{token}}
```

#### 6. Scan Attendance
```bash
POST {{base_url}}/attendance/scan
Headers:
Authorization: Bearer {{token}}
Body:
{
  "qr_token": "token-from-qr",
  "latitude": -7.797068,
  "longitude": 110.370529
}
```

---

## Performance Testing

### Load Test Scenarios

#### 1. Concurrent Logins
- 100 users login simultaneously
- Expected: < 2s response time

#### 2. Concurrent QR Scans
- 50 users scan QR simultaneously
- Expected: < 1s response time, no duplicate records

#### 3. Large Event List
- Event dengan 1000+ participants
- Expected: < 3s load time

---

## Security Testing

### Test Cases

#### 1. SQL Injection
**Test:**
```
NIM: admin001' OR '1'='1
Password: anything
```
**Expected:** ❌ Login failed

#### 2. XSS
**Test:**
```
Event title: <script>alert('XSS')</script>
```
**Expected:** ❌ Script tidak execute

#### 3. JWT Tampering
**Test:**
- Modify JWT token manually
- Send request
**Expected:** ❌ 401 Unauthorized

#### 4. CSRF
**Test:**
- Request tanpa proper origin
**Expected:** ❌ CORS error

---

## Browser Compatibility

Test di browser:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (not supported)

---

## Mobile Testing

Test di device:
- ✅ Android Chrome
- ✅ iOS Safari
- ✅ Responsive design
- ✅ QR scanner di mobile

---

## Checklist Before Production

### Functionality
- [ ] Semua test case passed
- [ ] No console errors
- [ ] No broken links
- [ ] All forms validated

### Security
- [ ] JWT secret changed
- [ ] All passwords changed
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled

### Performance
- [ ] Load time < 3s
- [ ] API response < 1s
- [ ] Images optimized
- [ ] Database indexed

### UX
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error messages clear
- [ ] Success feedback

### Data
- [ ] Database backup setup
- [ ] Migration tested
- [ ] Seed data removed
- [ ] Production data ready

---

## Bug Report Template

```
**Title:** [Brief description]

**Priority:** High/Medium/Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- User Role: Member
- Date: 2026-01-11
```
