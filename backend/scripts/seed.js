const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  let connection;
  try {
    console.log('🌱 Seeding database...');

    connection = await pool.getConnection();

    // Insert departments
    console.log('Creating departments...');
    await connection.query(`
      INSERT INTO departments (name) VALUES
      ('DPH (Dewan Pengurus Harian)'),
      ('PSDM (Pengembangan Sumber Daya Mahasiswa)'),
      ('Harkam (Harmonisasi Kampus)'),
      ('Depag (Departemen Agama)'),
      ('Humas (Hubungan Masyarakat)'),
      ('Mikat (Minat Bakat)'),
      ('Departemen Dalam Negeri'),
      ('Departemen Luar Negeri'),
      ('Departemen Kominfo')
    `);


    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert users
    console.log('Creating users...');
    await connection.query(`
      INSERT INTO users (nim, name, email, password, role, department_id, phone) VALUES
      ('admin001', 'Admin BEM', 'admin@bem.unimma.ac.id', ?, 'admin', 1, '081234567890'),
      ('koord001', 'Koordinator Dalam Negeri', 'koord.dagri@bem.unimma.ac.id', ?, 'koordinator', 2, '081234567891'),
      ('koord002', 'Koordinator Luar Negeri', 'koord.lugri@bem.unimma.ac.id', ?, 'koordinator', 3, '081234567892'),
      ('member001', 'Anggota Satu', 'member1@bem.unimma.ac.id', ?, 'member', 2, '081234567893'),
      ('member002', 'Anggota Dua', 'member2@bem.unimma.ac.id', ?, 'member', 2, '081234567894'),
      ('member003', 'Anggota Tiga', 'member3@bem.unimma.ac.id', ?, 'member', 3, '081234567895'),
      ('member004', 'Anggota Empat', 'member4@bem.unimma.ac.id', ?, 'member', 4, '081234567896'),
      ('member005', 'Anggota Lima', 'member5@bem.unimma.ac.id', ?, 'member', 5, '081234567897')
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);

    // Update coordinator_id
    console.log('Updating coordinators...');
    await connection.query(`UPDATE departments SET coordinator_id = 2 WHERE id = 2`);
    await connection.query(`UPDATE departments SET coordinator_id = 3 WHERE id = 3`);

    console.log('✅ Seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('Admin: admin001 / password123');
    console.log('Koordinator: koord001 / password123');
    console.log('Member: member001 / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Data already exists. Database already seeded.');
      process.exit(0);
    }
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

seed();
