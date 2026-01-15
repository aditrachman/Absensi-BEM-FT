# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Browser  │  │  Mobile  │  │  Tablet  │  │   PWA    │   │
│  │ (Chrome) │  │ (Safari) │  │  (iPad)  │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTPS
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    FRONTEND LAYER                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Next.js 14 (App Router)                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  Pages   │  │Components│  │   Lib    │         │    │
│  │  ├──────────┤  ├──────────┤  ├──────────┤         │    │
│  │  │ /login   │  │ Navbar   │  │ api.js   │         │    │
│  │  │/dashboard│  │ QRScanner│  │ utils.js │         │    │
│  │  │ /events  │  │ EventCard│  │          │         │    │
│  │  │  /scan   │  │ StatCard │  │          │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │      TailwindCSS + Custom CSS        │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ REST API (axios)
                           │ JWT Token in Header
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                     BACKEND LAYER                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Express.js Server                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │         Middleware Layer             │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │ • CORS                               │          │    │
│  │  │ • Body Parser                        │          │    │
│  │  │ • Auth (JWT Verification)            │          │    │
│  │  │ • Role Authorization                 │          │    │
│  │  │ • Error Handler                      │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │          Routes Layer                │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │ /api/auth      - Authentication      │          │    │
│  │  │ /api/events    - Event Management    │          │    │
│  │  │ /api/attendance- Attendance System   │          │    │
│  │  │ /api/permissions- Permission System  │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │        Business Logic                │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │ • QR Code Generation (qrcode)        │          │    │
│  │  │ • JWT Token Management               │          │    │
│  │  │ • Password Hashing (bcrypt)          │          │    │
│  │  │ • File Upload (multer)               │          │    │
│  │  │ • Validation Logic                   │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ SQL Queries (pg)
                           │ Connection Pool
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    DATABASE LAYER                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL 14+                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  users   │  │departments│ │  events  │         │    │
│  │  ├──────────┤  ├──────────┤  ├──────────┤         │    │
│  │  │ id       │  │ id       │  │ id       │         │    │
│  │  │ nim      │  │ name     │  │ title    │         │    │
│  │  │ name     │  │coord_id  │  │ type     │         │    │
│  │  │ password │  └────┬─────┘  │ qr_token │         │    │
│  │  │ role     │       │        │ date     │         │    │
│  │  │ dept_id  ├───────┘        └────┬─────┘         │    │
│  │  └────┬─────┘                     │               │    │
│  │       │                           │               │    │
│  │       │     ┌─────────────────────┴──────┐        │    │
│  │       │     │                            │        │    │
│  │  ┌────▼─────▼──┐  ┌──────────┐  ┌───────▼──────┐ │    │
│  │  │event_       │  │attendance│  │permissions   │ │    │
│  │  │participants │  ├──────────┤  ├──────────────┤ │    │
│  │  ├─────────────┤  │ id       │  │ id           │ │    │
│  │  │ event_id    │  │ event_id │  │ event_id     │ │    │
│  │  │ user_id     │  │ user_id  │  │ user_id      │ │    │
│  │  └─────────────┘  │ status   │  │ type         │ │    │
│  │                   │ time     │  │ status       │ │    │
│  │                   └──────────┘  └──────────────┘ │    │
│  │                                                   │    │
│  │  ┌──────────────────────────────────────┐        │    │
│  │  │         Indexes & Triggers           │        │    │
│  │  ├──────────────────────────────────────┤        │    │
│  │  │ • idx_users_nim                      │        │    │
│  │  │ • idx_events_qr_token                │        │    │
│  │  │ • idx_attendances_event              │        │    │
│  │  │ • trigger_update_timestamp           │        │    │
│  │  └──────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Authentication Flow

```
┌──────┐                ┌─────────┐              ┌──────────┐
│Client│                │ Backend │              │ Database │
└──┬───┘                └────┬────┘              └────┬─────┘
   │                         │                        │
   │ POST /auth/login        │                        │
   │ {nim, password}         │                        │
   ├────────────────────────>│                        │
   │                         │                        │
   │                         │ SELECT * FROM users    │
   │                         │ WHERE nim = ?          │
   │                         ├───────────────────────>│
   │                         │                        │
   │                         │ User data              │
   │                         │<───────────────────────┤
   │                         │                        │
   │                         │ bcrypt.compare()       │
   │                         │ jwt.sign()             │
   │                         │                        │
   │ {token, user}           │                        │
   │<────────────────────────┤                        │
   │                         │                        │
   │ Store token in          │                        │
   │ localStorage            │                        │
   │                         │                        │
```

### 2. QR Code Scan Flow

```
┌──────┐                ┌─────────┐              ┌──────────┐
│Client│                │ Backend │              │ Database │
└──┬───┘                └────┬────┘              └────┬─────┘
   │                         │                        │
   │ Scan QR Code            │                        │
   │ (html5-qrcode)          │                        │
   │                         │                        │
   │ POST /attendance/scan   │                        │
   │ {qr_token, lat, lng}    │                        │
   ├────────────────────────>│                        │
   │                         │                        │
   │                         │ Validate QR token      │
   │                         │ SELECT * FROM events   │
   │                         ├───────────────────────>│
   │                         │                        │
   │                         │ Event data             │
   │                         │<───────────────────────┤
   │                         │                        │
   │                         │ Check participant      │
   │                         │ Check duplicate        │
   │                         │ Calculate status       │
   │                         │ (hadir/terlambat)      │
   │                         │                        │
   │                         │ INSERT INTO attendances│
   │                         ├───────────────────────>│
   │                         │                        │
   │                         │ Success                │
   │                         │<───────────────────────┤
   │                         │                        │
   │ {success, attendance}   │                        │
   │<────────────────────────┤                        │
   │                         │                        │
   │ Show success message    │                        │
   │                         │                        │
```

### 3. Permission Approval Flow

```
┌────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│ Member │         │Koordinator│         │ Backend │         │ Database │
└───┬────┘         └─────┬────┘         └────┬────┘         └────┬─────┘
    │                    │                   │                   │
    │ Submit Permission  │                   │                   │
    │ POST /permissions  │                   │                   │
    ├────────────────────┼──────────────────>│                   │
    │                    │                   │                   │
    │                    │                   │ INSERT permission │
    │                    │                   ├──────────────────>│
    │                    │                   │                   │
    │                    │                   │ Success           │
    │                    │                   │<──────────────────┤
    │                    │                   │                   │
    │ Success            │                   │                   │
    │<───────────────────┼───────────────────┤                   │
    │                    │                   │                   │
    │                    │ GET /permissions  │                   │
    │                    │ (status=pending)  │                   │
    │                    ├──────────────────>│                   │
    │                    │                   │                   │
    │                    │                   │ SELECT permissions│
    │                    │                   ├──────────────────>│
    │                    │                   │                   │
    │                    │                   │ Pending list      │
    │                    │                   │<──────────────────┤
    │                    │                   │                   │
    │                    │ Pending list      │                   │
    │                    │<──────────────────┤                   │
    │                    │                   │                   │
    │                    │ PUT /permissions/1│                   │
    │                    │ {status:approved} │                   │
    │                    ├──────────────────>│                   │
    │                    │                   │                   │
    │                    │                   │ UPDATE permission │
    │                    │                   │ INSERT attendance │
    │                    │                   ├──────────────────>│
    │                    │                   │                   │
    │                    │                   │ Success           │
    │                    │                   │<──────────────────┤
    │                    │                   │                   │
    │                    │ Success           │                   │
    │                    │<──────────────────┤                   │
    │                    │                   │                   │
```

## Component Architecture

### Frontend Components Hierarchy

```
App (layout.js)
│
├── LoginPage
│   └── LoginForm
│
├── DashboardPage
│   ├── Navbar
│   ├── QuickActions
│   │   ├── ScanButton
│   │   ├── EventsButton
│   │   └── PermissionsButton
│   ├── StatisticsCard
│   └── UpcomingEvents
│       └── EventCard[]
│
├── EventsPage
│   ├── Navbar
│   ├── FilterButtons
│   └── EventsList
│       └── EventCard[]
│
├── ScanPage
│   ├── Navbar
│   ├── QRScanner (html5-qrcode)
│   └── ResultDisplay
│
└── PermissionsPage
    ├── Navbar
    ├── PermissionForm
    │   ├── EventSelect
    │   ├── TypeSelect
    │   ├── ReasonTextarea
    │   └── FileUpload
    └── PermissionsList
        └── PermissionCard[]
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Transport Security                            │
│  ┌────────────────────────────────────────────┐        │
│  │ • HTTPS/TLS encryption                     │        │
│  │ • Secure headers                           │        │
│  │ • CORS configuration                       │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 2: Authentication                                │
│  ┌────────────────────────────────────────────┐        │
│  │ • JWT tokens (7 days expiry)               │        │
│  │ • Bcrypt password hashing (10 rounds)      │        │
│  │ • Token validation on each request         │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 3: Authorization                                 │
│  ┌────────────────────────────────────────────┐        │
│  │ • Role-based access control (RBAC)         │        │
│  │ • Route-level authorization                │        │
│  │ • Resource-level permissions               │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 4: Data Validation                               │
│  ┌────────────────────────────────────────────┐        │
│  │ • Input sanitization                       │        │
│  │ • SQL injection prevention                 │        │
│  │ • XSS protection                           │        │
│  │ • File upload validation                   │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 5: QR Code Security                              │
│  ┌────────────────────────────────────────────┐        │
│  │ • Unique token per event (UUID)            │        │
│  │ • One-time scan validation                 │        │
│  │ • Token expiry check                       │        │
│  │ • Encrypted payload                        │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 6: Audit & Logging                               │
│  ┌────────────────────────────────────────────┐        │
│  │ • Device info logging                      │        │
│  │ • IP address tracking                      │        │
│  │ • Timestamp recording                      │        │
│  │ • Action audit trail                       │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│         Developer Machine               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Frontend    │  │   Backend    │   │
│  │ localhost:   │  │ localhost:   │   │
│  │   3000       │  │   5000       │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      PostgreSQL                  │  │
│  │      localhost:5432              │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌─────────▼────────┐
│   Vercel/       │    │   Railway/       │
│   Netlify       │    │   Heroku         │
│                 │    │                  │
│  Frontend       │    │  Backend API     │
│  (Static)       │    │  (Node.js)       │
│                 │    │                  │
│  - Next.js      │    │  - Express       │
│  - CDN          │    │  - PM2           │
│  - Auto SSL     │    │  - Auto SSL      │
└─────────────────┘    └────────┬─────────┘
                                │
                     ┌──────────▼──────────┐
                     │   Supabase/         │
                     │   Railway           │
                     │                     │
                     │  PostgreSQL         │
                     │  (Managed)          │
                     │                     │
                     │  - Auto backup      │
                     │  - SSL enabled      │
                     │  - Connection pool  │
                     └─────────────────────┘
```

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────┐
│         Caching Layers                  │
├─────────────────────────────────────────┤
│                                         │
│  Browser Cache                          │
│  ├─ Static assets (images, CSS, JS)    │
│  └─ API responses (short TTL)          │
│                                         │
│  CDN Cache (Vercel/Netlify)            │
│  ├─ Static pages                       │
│  └─ Images & assets                    │
│                                         │
│  Application Cache (Future)            │
│  ├─ Redis for session data             │
│  └─ Redis for frequent queries         │
│                                         │
│  Database                               │
│  ├─ Query result cache                 │
│  └─ Connection pooling                 │
│                                         │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │Backend  │      │Backend  │     │Backend  │
   │Instance │      │Instance │     │Instance │
   │   #1    │      │   #2    │     │   #3    │
   └────┬────┘      └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                    ┌────▼────┐
                    │Database │
                    │ Primary │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │Database │
                    │ Replica │
                    └─────────┘
```

---

**Note:** Diagram ini menunjukkan arsitektur sistem secara high-level. Untuk implementasi detail, lihat source code di masing-masing folder.
