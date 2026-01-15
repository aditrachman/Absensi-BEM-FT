const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query(
            'SELECT id, nim, name, email, role, department_id FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            throw new Error();
        }

        req.user = rows[0];
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

module.exports = { auth, authorize };
