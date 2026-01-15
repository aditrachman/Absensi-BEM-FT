const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Login Rate Limiter
const loginLimiter = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

const { check, validationResult } = require('express-validator');

// Login
router.post('/login', [
    loginLimiter,
    check('nim', 'NIM is required').not().isEmpty(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { nim, password } = req.body;

        if (!nim || !password) {
            return res.status(400).json({ error: 'NIM and password required' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM users WHERE nim = ?',
            [nim]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, nim: user.nim, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nim: user.nim,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.nim, u.name, u.email, u.role, u.department_id, u.phone,
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
            [req.user.id]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register (Admin only)
router.post('/register', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { nim, name, email, password, role, department_id, phone } = req.body;

        if (!nim || !name || !password || !role) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (nim, name, email, password, role, department_id, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nim, name, email, hashedPassword, role, department_id, phone]
        );

        const [newUser] = await pool.query(
            'SELECT id, nim, name, email, role, department_id FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newUser[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'NIM or email already exists' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
