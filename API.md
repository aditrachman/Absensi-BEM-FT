# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Semua endpoint (kecuali login) memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/login
Login user

**Request:**
```json
{
  "nim": "admin001",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nim": "admin001",
    "name": "Admin BEM",
    "email": "admin@bem.unimma.ac.id",
    "role": "admin",
    "department_id": 1
  }
}
```

### GET /auth/me
Get current user info

**Response:**
```json
{
  "id": 1,
  "nim": "admin001",
  "name": "Admin BEM",
  "email": "admin@bem.unimma.ac.id",
  "role": "admin",
  "department_id": 1,
  "phone": "081234567890",
  "department_name": "Pengurus Harian"
}
```

### POST /auth/register
Register new user (Admin only)

**Request:**
```json
{
  "nim": "member006",
  "name": "Anggota Baru",
  "email": "member6@bem.unimma.ac.id",
  "password": "password123",
  "role": "member",
  "department_id": 2,
  "phone": "081234567899"
}
```

---

## Events Endpoints

### GET /events
Get all events

**Query Parameters:**
- `type` (optional): pleno, departemen, koordinasi, lainnya
- `date` (optional): YYYY-MM-DD
- `department_id` (optional): integer

**Response:**
```json
[
  {
    "id": 1,
    "title": "Rapat Pleno BEM",
    "description": "Rapat pleno bulanan",
    "type": "pleno",
    "date": "2026-01-15",
    "time_start": "19:00:00",
    "time_end": "21:00:00",
    "location": "Ruang Rapat BEM",
    "late_threshold": 15,
    "creator_name": "Admin BEM",
    "department_name": null,
    "total_participants": 8,
    "total_attended": 5
  }
]
```

### GET /events/:id
Get event detail with participants

**Response:**
```json
{
  "id": 1,
  "title": "Rapat Pleno BEM",
  "description": "Rapat pleno bulanan",
  "type": "pleno",
  "date": "2026-01-15",
  "time_start": "19:00:00",
  "time_end": "21:00:00",
  "location": "Ruang Rapat BEM",
  "participants": [
    {
      "id": 1,
      "nim": "admin001",
      "name": "Admin BEM",
      "department_id": 1,
      "department_name": "Pengurus Harian",
      "status": "hadir",
      "check_in_time": "2026-01-15T19:05:00Z"
    }
  ]
}
```

### POST /events
Create new event (Admin/Koordinator only)

**Request:**
```json
{
  "title": "Rapat Departemen",
  "description": "Evaluasi program kerja",
  "type": "departemen",
  "date": "2026-01-20",
  "time_start": "16:00",
  "time_end": "18:00",
  "location": "Sekretariat BEM",
  "late_threshold": 10,
  "latitude": -7.797068,
  "longitude": 110.370529,
  "radius": 100,
  "department_id": 2,
  "participant_ids": [1, 2, 4, 5]
}
```

### PUT /events/:id
Update event (Admin/Koordinator only)

**Request:**
```json
{
  "title": "Rapat Departemen (Updated)",
  "time_start": "17:00"
}
```

### DELETE /events/:id
Delete event (Admin/Koordinator only)

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

### GET /events/:id/qr
Get QR code for event

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "event": {
    "id": 1,
    "title": "Rapat Pleno BEM",
    "date": "2026-01-15",
    "time_start": "19:00:00"
  }
}
```

---

## Attendance Endpoints

### POST /attendance/scan
Scan QR and record attendance

**Request:**
```json
{
  "qr_token": "550e8400-e29b-41d4-a716-446655440000",
  "latitude": -7.797068,
  "longitude": 110.370529,
  "device_info": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "message": "Attendance recorded successfully",
  "attendance": {
    "id": 1,
    "event_id": 1,
    "user_id": 4,
    "status": "hadir",
    "check_in_time": "2026-01-15T19:05:00Z"
  },
  "event": {
    "id": 1,
    "title": "Rapat Pleno BEM",
    "date": "2026-01-15",
    "time_start": "19:00:00"
  }
}
```

### GET /attendance/event/:eventId
Get attendance list for specific event

**Response:**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "user_id": 4,
    "status": "hadir",
    "check_in_time": "2026-01-15T19:05:00Z",
    "nim": "member001",
    "name": "Anggota Satu",
    "department_id": 2,
    "department_name": "Departemen Dalam Negeri"
  }
]
```

### GET /attendance/my
Get my attendance history

**Response:**
```json
{
  "attendances": [
    {
      "id": 1,
      "event_id": 1,
      "user_id": 4,
      "status": "hadir",
      "check_in_time": "2026-01-15T19:05:00Z",
      "title": "Rapat Pleno BEM",
      "type": "pleno",
      "date": "2026-01-15",
      "time_start": "19:00:00",
      "location": "Ruang Rapat BEM"
    }
  ],
  "statistics": {
    "total_events": "10",
    "hadir": "7",
    "terlambat": "2",
    "izin": "1",
    "sakit": "0",
    "alpha": "0"
  }
}
```

### GET /attendance/stats
Get attendance statistics (Admin/Koordinator only)

**Query Parameters:**
- `department_id` (optional): integer
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

**Response:**
```json
[
  {
    "id": 4,
    "nim": "member001",
    "name": "Anggota Satu",
    "department_id": 2,
    "department_name": "Departemen Dalam Negeri",
    "total_events": "10",
    "attended": "9",
    "hadir": "7",
    "terlambat": "2",
    "izin": "1",
    "sakit": "0"
  }
]
```

---

## Permissions Endpoints

### POST /permissions
Submit permission request

**Request (multipart/form-data):**
```
event_id: 1
type: izin
reason: Ada keperluan keluarga
proof_file: [file]
```

**Response:**
```json
{
  "id": 1,
  "event_id": 1,
  "user_id": 4,
  "type": "izin",
  "reason": "Ada keperluan keluarga",
  "proof_file": "1705123456789-bukti.jpg",
  "status": "pending",
  "created_at": "2026-01-13T10:00:00Z"
}
```

### GET /permissions
Get permissions list

**Query Parameters:**
- `status` (optional): pending, approved, rejected
- `event_id` (optional): integer

**Response:**
```json
[
  {
    "id": 1,
    "event_id": 1,
    "user_id": 4,
    "type": "izin",
    "reason": "Ada keperluan keluarga",
    "proof_file": "1705123456789-bukti.jpg",
    "status": "pending",
    "event_title": "Rapat Pleno BEM",
    "event_date": "2026-01-15",
    "time_start": "19:00:00",
    "nim": "member001",
    "user_name": "Anggota Satu",
    "department_id": 2,
    "department_name": "Departemen Dalam Negeri",
    "reviewer_name": null,
    "reviewed_at": null,
    "notes": null,
    "created_at": "2026-01-13T10:00:00Z"
  }
]
```

### PUT /permissions/:id
Approve or reject permission (Admin/Koordinator only)

**Request:**
```json
{
  "status": "approved",
  "notes": "Disetujui"
}
```

**Response:**
```json
{
  "id": 1,
  "event_id": 1,
  "user_id": 4,
  "type": "izin",
  "status": "approved",
  "reviewed_by": 1,
  "reviewed_at": "2026-01-13T11:00:00Z",
  "notes": "Disetujui"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Required fields missing"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "Event not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

## CORS

Default CORS origin: `http://localhost:3000`

Update in `.env`:
```
CORS_ORIGIN=https://your-domain.com
```
