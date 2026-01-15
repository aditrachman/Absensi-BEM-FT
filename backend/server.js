const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security Middleware
app.use(helmet());

// Global Rate Limiting
// Global Rate Limiting (Applied to /api routes only)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Increased limit
    message: 'Too many requests from this IP, please try again later.'
});
// app.use(limiter); // Removed global application

// Middleware (CORS compatible with HTTPS & Local Network)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        // Allow localhost and local network IPs (HTTP and HTTPS)
        // Regex now permits https://192.168...
        if (origin.match(/^https?:\/\/localhost/) || origin.match(/^https?:\/\/192\.168\./)) {
            return callback(null, true);
        }
        
        if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Routes
app.use('/api', limiter); // Apply rate limiting to all API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3001;

// HTTP Server
const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HTTP Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Accessible on network: http://0.0.0.0:${PORT}`);
});

// HTTPS Server (Optional, if certs exist)
const fs = require('fs');

try {
    const https = require('https');
    const keyPath = path.join(__dirname, 'server.key');
    const certPath = path.join(__dirname, 'server.crt');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const privateKey = fs.readFileSync(keyPath, 'utf8');
        const certificate = fs.readFileSync(certPath, 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        
        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
             const msg = `🔒 HTTPS Server running on port ${HTTPS_PORT}\n`;
             console.log(msg);
             fs.appendFileSync('backend.log', msg);
        });
        httpsServer.on('error', (err) => {
            fs.appendFileSync('backend.log', `HTTPS Error: ${err.message}\n`);
        });
    } else {
        const msg = `⚠️ Certificates not found at: ${keyPath}\n`;
        console.log(msg);
        fs.appendFileSync('backend.log', msg);
    }
} catch (e) {
    const msg = `HTTPS not enabled: ${e.message}\nstack: ${e.stack}\n`;
    console.log(msg);
    fs.appendFileSync('backend.log', msg);
}


