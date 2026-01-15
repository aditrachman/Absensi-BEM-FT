-- Migration: Add new departments
-- Run this if database already seeded

INSERT INTO departments (name) VALUES
('DPH (Dewan Pengurus Harian)'),
('PSDM (Pengembangan Sumber Daya Mahasiswa)'),
('Harkam (Harmonisasi Kampus)'),
('Depag (Departemen Agama)'),
('Humas (Hubungan Masyarakat)'),
('Mikat (Minat Bakat)')
ON DUPLICATE KEY UPDATE name=name;
