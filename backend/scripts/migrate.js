const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function migrate() {
    let connection;
    try {
        console.log('🔄 Running database migration...');

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split SQL statements by semicolon
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'SET FOREIGN_KEY_CHECKS = 0' && stmt !== 'SET FOREIGN_KEY_CHECKS = 1');

        connection = await pool.getConnection();

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✓ Foreign key checks disabled');

        console.log(`Executing ${statements.length} SQL statements...`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await connection.query(statement);
                    console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
                } catch (err) {
                    // Ignore specific errors
                    if (err.code === 'ER_TABLE_EXISTS_ERROR' ||
                        err.code === 'ER_DUP_KEYNAME' ||
                        err.code === 'ER_DUP_ENTRY' ||
                        err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                        console.log(`⚠ Statement ${i + 1} skipped (${err.code})`);
                    } else {
                        console.error(`Error in statement ${i + 1}:`, err.message);
                        throw err;
                    }
                }
            }
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✓ Foreign key checks enabled');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

migrate();
