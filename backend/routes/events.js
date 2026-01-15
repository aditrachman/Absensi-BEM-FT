const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Get all events
router.get('/', auth, async (req, res) => {
    try {
        const { type, date, department_id } = req.query;
        let query = `
      SELECT e.*, u.name as creator_name, d.name as department_name,
             COUNT(DISTINCT ep.user_id) as total_participants,
             COUNT(DISTINCT a.user_id) as total_attended
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN attendances a ON e.id = a.event_id AND a.status IN ('hadir', 'terlambat')
      WHERE 1=1
    `;
        const params = [];

        if (type) {
            query += ` AND e.type = ?`;
            params.push(type);
        }

        if (date) {
            query += ` AND e.date = ?`;
            params.push(date);
        }

        if (department_id) {
            query += ` AND e.department_id = ?`;
            params.push(department_id);
        }

        // Filter by role
        if (req.user.role === 'koordinator') {
            query += ` AND (e.department_id = ? OR e.type = 'pleno' OR e.created_by = ?)`;
            params.push(req.user.department_id, req.user.id);
        }

        query += ` GROUP BY e.id, u.name, d.name ORDER BY e.date DESC, e.time_start DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.*, u.name as creator_name, d.name as department_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get participants
        const [participants] = await pool.query(
            `SELECT u.id, u.nim, u.name, u.department_id, d.name as department_name,
              COALESCE(a.status, 
                CASE 
                    WHEN p.status = 'pending' THEN p.type 
                    WHEN p.status = 'approved' THEN p.type
                    ELSE NULL 
                END
              ) as status,
              a.check_in_time,
              p.id as permission_id,
              p.status as permission_status,
              p.reason as permission_reason
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN attendances a ON ep.event_id = a.event_id AND ep.user_id = a.user_id
       LEFT JOIN permissions p ON ep.event_id = p.event_id AND ep.user_id = p.user_id
       WHERE ep.event_id = ?
       ORDER BY u.name`,
            [req.params.id]
        );

        res.json({
            ...rows[0],
            participants: participants
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create event
router.post('/', auth, authorize('admin', 'koordinator'), async (req, res) => {
    let connection;
    try {
        const {
            title, description, type, date, time_start, time_end,
            location, late_threshold, latitude, longitude, radius,
            department_id, participant_ids
        } = req.body;

        if (!title || !type || !date || !time_start || !time_end) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Generate QR token
        const qrToken = uuidv4();
        const qrData = JSON.stringify({
            token: qrToken,
            event_id: null,
            timestamp: Date.now()
        });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Insert event
        const [eventResult] = await connection.query(
            `INSERT INTO events (
        title, description, type, date, time_start, time_end, location,
        late_threshold, qr_code, qr_token, latitude, longitude, radius,
        created_by, department_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, description, type, date, time_start, time_end, location,
                late_threshold || 15, qrData, qrToken, latitude, longitude, radius || 100,
                req.user.id, department_id
            ]
        );

        const eventId = eventResult.insertId;

        // AUTO: Add ALL users as participants if no specific participants provided
        let participantsToAdd = participant_ids;

        if (!participantsToAdd || participantsToAdd.length === 0) {
            // Get all users
            const [allUsers] = await connection.query(
                'SELECT id FROM users WHERE role IN ("member", "koordinator", "admin")'
            );
            participantsToAdd = allUsers.map(u => u.id);
        }

        // Insert participants
        if (participantsToAdd && participantsToAdd.length > 0) {
            const values = participantsToAdd.map(userId => [eventId, userId]);
            await connection.query(
                'INSERT INTO event_participants (event_id, user_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();

        // Get created event
        const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);

        res.status(201).json(newEvent[0]);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

// Get QR Code
router.get('/:id/qr', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, qr_token, date, time_start FROM events WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = rows[0];
        const qrData = JSON.stringify({
            token: event.qr_token,
            event_id: event.id,
            title: event.title,
            timestamp: Date.now()
        });

        const qrCodeUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2
        });

        res.json({
            qrCode: qrCodeUrl,
            event: {
                id: event.id,
                title: event.title,
                date: event.date,
                time_start: event.time_start
            }
        });
    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update event
router.put('/:id', auth, authorize('admin', 'koordinator'), async (req, res) => {
    try {
        const { title, description, type, date, time_start, time_end, location, late_threshold } = req.body;

        const [result] = await pool.query(
            `UPDATE events 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           type = COALESCE(?, type),
           date = COALESCE(?, date),
           time_start = COALESCE(?, time_start),
           time_end = COALESCE(?, time_end),
           location = COALESCE(?, location),
           late_threshold = COALESCE(?, late_threshold)
       WHERE id = ?`,
            [title, description, type, date, time_start, time_end, location, late_threshold, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete event
router.delete('/:id', auth, authorize('admin', 'koordinator'), async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM events WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
