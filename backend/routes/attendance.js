const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Scan QR & Record Attendance
router.post('/scan', auth, async (req, res) => {
    try {
        const { qr_token, latitude, longitude, device_info } = req.body;

        if (!qr_token) {
            return res.status(400).json({ error: 'QR token required' });
        }

        // Parse QR token (could be JSON or plain UUID)
        let actualToken = qr_token;
        try {
            const parsed = JSON.parse(qr_token);
            if (parsed.token) {
                actualToken = parsed.token;
            }
        } catch (e) {
            // Not JSON, use as-is (plain UUID)
            actualToken = qr_token;
        }

        // Get event by QR token
        const [eventRows] = await pool.query(
            'SELECT * FROM events WHERE qr_token = ? AND is_active = true',
            [actualToken]
        );

        if (eventRows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired QR code' });
        }

        const event = eventRows[0];

        // Check if user is participant
        const [participantRows] = await pool.query(
            'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
            [event.id, req.user.id]
        );

        if (participantRows.length === 0) {
            return res.status(403).json({ error: 'You are not registered for this event' });
        }

        // Check if already attended
        const [attendanceRows] = await pool.query(
            'SELECT * FROM attendances WHERE event_id = ? AND user_id = ?',
            [event.id, req.user.id]
        );

        if (attendanceRows.length > 0) {
            return res.status(400).json({ error: 'Already checked in for this event' });
        }

        // Calculate status (hadir or terlambat)
        const now = new Date();
        const eventDateTime = new Date(`${event.date} ${event.time_start}`);
        const lateThreshold = new Date(eventDateTime.getTime() + event.late_threshold * 60000);

        let status = 'hadir';
        if (now > lateThreshold) {
            status = 'terlambat';
        }

        // GPS validation (optional - simplified)
        // In production, implement proper distance calculation

        // Record attendance
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
            event: {
                id: event.id,
                title: event.title,
                date: event.date,
                time_start: event.time_start
            }
        });
    } catch (error) {
        console.error('Scan attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get attendance for specific event
router.get('/event/:eventId', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, u.nim, u.name, u.department_id, d.name as department_name
       FROM attendances a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE a.event_id = ?
       ORDER BY a.check_in_time`,
            [req.params.eventId]
        );

        res.json(rows);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get my attendance history
router.get('/my', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, e.title, e.type, e.date, e.time_start, e.location
       FROM attendances a
       JOIN events e ON a.event_id = e.id
       WHERE a.user_id = ?
       ORDER BY e.date DESC, e.time_start DESC`,
            [req.user.id]
        );

        // Get statistics
        const [stats] = await pool.query(
            `SELECT 
         COUNT(*) as total_events,
         COUNT(CASE WHEN status = 'hadir' THEN 1 END) as hadir,
         COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat,
         COUNT(CASE WHEN status = 'izin' THEN 1 END) as izin,
         COUNT(CASE WHEN status = 'sakit' THEN 1 END) as sakit,
         COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha
       FROM attendances
       WHERE user_id = ?`,
            [req.user.id]
        );

        res.json({
            attendances: rows,
            statistics: stats[0]
        });
    } catch (error) {
        console.error('Get my attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get attendance statistics (Admin/Koordinator)
router.get('/stats', auth, async (req, res) => {
    try {
        const { department_id, start_date, end_date } = req.query;

        let query = `
      SELECT 
        u.id, u.nim, u.name, u.department_id, d.name as department_name,
        COUNT(DISTINCT ep.event_id) as total_events,
        COUNT(DISTINCT CASE WHEN a.status IN ('hadir', 'terlambat') THEN a.event_id END) as attended,
        COUNT(DISTINCT CASE WHEN a.status = 'hadir' THEN a.event_id END) as hadir,
        COUNT(DISTINCT CASE WHEN a.status = 'terlambat' THEN a.event_id END) as terlambat,
        COUNT(DISTINCT CASE WHEN a.status = 'izin' THEN a.event_id END) as izin,
        COUNT(DISTINCT CASE WHEN a.status = 'sakit' THEN a.event_id END) as sakit
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN event_participants ep ON u.id = ep.user_id
      LEFT JOIN attendances a ON u.id = a.user_id AND ep.event_id = a.event_id
      LEFT JOIN events e ON ep.event_id = e.id
      WHERE u.role IN ('member', 'koordinator')
    `;

        const params = [];

        if (department_id) {
            query += ` AND u.department_id = ?`;
            params.push(department_id);
        }

        if (start_date) {
            query += ` AND e.date >= ?`;
            params.push(start_date);
        }

        if (end_date) {
            query += ` AND e.date <= ?`;
            params.push(end_date);
        }

        query += ` GROUP BY u.id, u.nim, u.name, u.department_id, d.name ORDER BY u.name`;

        const [rows] = await pool.query(query, params);

        res.json(rows);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
