const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDF files are allowed'));
    }
});

// Submit permission request
router.post('/', auth, upload.single('proof_file'), async (req, res) => {
    try {
        const { event_id, type, reason } = req.body;
        const proof_file = req.file ? req.file.filename : null;

        if (!event_id || !type || !reason) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Check if user is participant
        const [participantRows] = await pool.query(
            'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
            [event_id, req.user.id]
        );

        if (participantRows.length === 0) {
            return res.status(403).json({ error: 'You are not registered for this event' });
        }

        // Check if already submitted
        const [existingRows] = await pool.query(
            'SELECT * FROM permissions WHERE event_id = ? AND user_id = ?',
            [event_id, req.user.id]
        );

        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Permission already submitted for this event' });
        }

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
    } catch (error) {
        console.error('Submit permission error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get permissions
router.get('/', auth, async (req, res) => {
    try {
        const { status, event_id } = req.query;

        let query = `
      SELECT p.*, 
             e.title as event_title, e.date as event_date, e.time_start,
             u.nim, u.name as user_name, u.department_id,
             d.name as department_name,
             r.name as reviewer_name
      FROM permissions p
      JOIN events e ON p.event_id = e.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users r ON p.reviewed_by = r.id
      WHERE 1=1
    `;

        const params = [];

        // Filter by role
        if (req.user.role === 'member') {
            query += ` AND p.user_id = ?`;
            params.push(req.user.id);
        } else if (req.user.role === 'koordinator') {
            query += ` AND (u.department_id = ? OR e.type = 'pleno')`;
            params.push(req.user.department_id);
        }

        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        if (event_id) {
            query += ` AND p.event_id = ?`;
            params.push(event_id);
        }

        query += ` ORDER BY p.created_at DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve/Reject permission
router.put('/:id', auth, authorize('admin', 'koordinator'), async (req, res) => {
    let connection;
    try {
        const { status, notes } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update permission
        const [permissionResult] = await connection.query(
            `UPDATE permissions 
       SET status = ?, notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
            [status, notes, req.user.id, req.params.id]
        );

        if (permissionResult.affectedRows === 0) {
            throw new Error('Permission not found');
        }

        // Get updated permission
        const [permission] = await connection.query(
            'SELECT * FROM permissions WHERE id = ?',
            [req.params.id]
        );

        // If approved, update or create attendance record
        if (status === 'approved') {
            await connection.query(
                `INSERT INTO attendances (event_id, user_id, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?`,
                [permission[0].event_id, permission[0].user_id, permission[0].type, permission[0].type]
            );
        }

        await connection.commit();
        res.json(permission[0]);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Update permission error:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
