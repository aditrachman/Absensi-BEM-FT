const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Get all departments
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM departments ORDER BY name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
