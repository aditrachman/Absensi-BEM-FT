const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
    let connection;
    try {
        console.log('🔧 Fixing user passwords...');

        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('Generated hash:', hashedPassword);

        connection = await pool.getConnection();

        // Update all users with correct password
        const [result] = await connection.query(
            'UPDATE users SET password = ?',
            [hashedPassword]
        );

        console.log(`✅ Updated ${result.affectedRows} users`);

        // Verify
        const [users] = await connection.query('SELECT nim, LEFT(password, 20) as pwd_preview FROM users');
        console.log('\nUsers:');
        users.forEach(u => console.log(`  ${u.nim}: ${u.pwd_preview}...`));

        console.log('\n✅ All passwords fixed!');
        console.log('You can now login with:');
        console.log('  NIM: admin001 / Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

fixPasswords();
