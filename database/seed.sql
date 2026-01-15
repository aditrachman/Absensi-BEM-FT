-- Seed data untuk testing

-- Insert departments
INSERT INTO departments (name) VALUES
('Pengurus Harian'),
('Departemen Dalam Negeri'),
('Departemen Luar Negeri'),
('Departemen PSDM'),
('Departemen Kominfo');

-- Insert users (password: bcrypt hash untuk 'password123')
-- Admin
INSERT INTO users (nim, name, email, password, role, department_id, phone) VALUES
('admin001', 'Admin BEM', 'admin@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'admin', 1, '081234567890');

-- Koordinator
INSERT INTO users (nim, name, email, password, role, department_id, phone) VALUES
('koord001', 'Koordinator Dalam Negeri', 'koord.dagri@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'koordinator', 2, '081234567891'),
('koord002', 'Koordinator Luar Negeri', 'koord.lugri@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'koordinator', 3, '081234567892');

-- Members
INSERT INTO users (nim, name, email, password, role, department_id, phone) VALUES
('member001', 'Anggota Satu', 'member1@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'member', 2, '081234567893'),
('member002', 'Anggota Dua', 'member2@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'member', 2, '081234567894'),
('member003', 'Anggota Tiga', 'member3@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'member', 3, '081234567895'),
('member004', 'Anggota Empat', 'member4@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'member', 4, '081234567896'),
('member005', 'Anggota Lima', 'member5@bem.unimma.ac.id', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'member', 5, '081234567897');

-- Update coordinator_id di departments
UPDATE departments SET coordinator_id = 2 WHERE id = 2;
UPDATE departments SET coordinator_id = 3 WHERE id = 3;

-- Sample events
INSERT INTO events (title, description, type, date, time_start, time_end, location, late_threshold, qr_code, qr_token, created_by, department_id) VALUES
('Rapat Pleno BEM', 'Rapat pleno bulanan seluruh anggota BEM', 'pleno', CURRENT_DATE + INTERVAL '2 days', '19:00', '21:00', 'Ruang Rapat BEM', 15, 'QR_PLENO_001', 'TOKEN_PLENO_001', 1, NULL),
('Rapat Departemen Dagri', 'Evaluasi program kerja departemen', 'departemen', CURRENT_DATE + INTERVAL '3 days', '16:00', '18:00', 'Sekretariat BEM', 10, 'QR_DAGRI_001', 'TOKEN_DAGRI_001', 2, 2);

-- Sample event participants
INSERT INTO event_participants (event_id, user_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 2), (2, 4), (2, 5);
