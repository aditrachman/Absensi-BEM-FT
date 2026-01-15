const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const XLSX = require('xlsx');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

// Get all users (Admin/Koordinator)
router.get('/', auth, authorize('admin', 'koordinator'), async (req, res) => {
    try {
        const { department_id, role, search } = req.query;
        
        let query = `
            SELECT u.id, u.nim, u.name, u.email, u.role, u.phone,
                   u.department_id, d.name as department_name,
                   u.created_at, u.updated_at
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (department_id) {
            query += ` AND u.department_id = ?`;
            params.push(department_id);
        }

        if (role) {
            query += ` AND u.role = ?`;
            params.push(role);
        }

        if (search) {
            query += ` AND (u.name LIKE ? OR u.nim LIKE ? OR u.email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY u.name ASC`;

        const [users] = await pool.query(query, params);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }
});

// Get single user
router.get('/:id', auth, authorize('admin', 'koordinator'), async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.nim, u.name, u.email, u.role, u.phone,
                   u.department_id, d.name as department_name,
                   u.created_at, u.updated_at
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ?
        `, [req.params.id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }
});

// Create new user (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const { nim, name, email, password, role, department_id, phone } = req.body;

        if (!nim || !name || !role) {
            return res.status(400).json({ error: 'NIM, nama, dan role wajib diisi' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE nim = ?', [nim]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'NIM sudah terdaftar' });
        }

        const defaultPassword = password || 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const [result] = await pool.query(`
            INSERT INTO users (nim, name, email, password, role, department_id, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [nim, name, email, hashedPassword, role, department_id, phone]);

        res.status(201).json({
            message: 'Pengguna berhasil dibuat',
            user: {
                id: result.insertId,
                nim,
                name,
                email,
                role,
                department_id,
                phone,
                default_password: defaultPassword
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'NIM atau email sudah terdaftar' });
        }
        res.status(500).json({ error: 'Gagal membuat pengguna' });
    }
});

// Update user (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const { name, email, role, department_id, phone, password } = req.body;
        const userId = req.params.id;

        const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }

        let query = 'UPDATE users SET name = ?, email = ?, role = ?, department_id = ?, phone = ?';
        let params = [name, email, role, department_id, phone];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await pool.query(query, params);
        res.json({ message: 'Pengguna berhasil diperbarui' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Gagal memperbarui pengguna' });
    }
});

// Delete user (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const userId = req.params.id;

        if (userId == req.user.id) {
            return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }
});

// Import users from Excel (Admin only)
router.post('/import', auth, authorize('admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File Excel tidak ditemukan' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ error: 'File Excel kosong' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                if (!row.nim || !row.nama || !row.role) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        error: 'NIM, nama, dan role wajib diisi'
                    });
                    continue;
                }

                const [existing] = await pool.query('SELECT id FROM users WHERE nim = ?', [row.nim]);
                if (existing.length > 0) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        nim: row.nim,
                        error: 'NIM sudah terdaftar'
                    });
                    continue;
                }

                const password = row.password || 'password123';
                const hashedPassword = await bcrypt.hash(password, 10);

                await pool.query(`
                    INSERT INTO users (nim, name, email, password, role, department_id, phone)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    row.nim,
                    row.nama,
                    row.email || null,
                    hashedPassword,
                    row.role,
                    row.department_id || null,
                    row.phone || null
                ]);

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 2,
                    nim: row.nim,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Import selesai',
            results
        });
    } catch (error) {
        console.error('Import users error:', error);
        res.status(500).json({ error: 'Gagal mengimport pengguna' });
    }
});

// Export users to Excel (Admin only)
router.get('/export/excel', auth, authorize('admin'), async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.nim, u.name as nama, u.email, u.role, u.phone,
                   d.name as departemen
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY u.name ASC
        `);

        const worksheet = XLSX.utils.json_to_sheet(users);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({ error: 'Gagal mengexport pengguna' });
    }
});

// Get departments list
router.get('/departments/list', auth, async (req, res) => {
    try {
        const [departments] = await pool.query('SELECT id, name FROM departments ORDER BY name ASC');
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Gagal mengambil data departemen' });
    }
});

module.exports = router;
