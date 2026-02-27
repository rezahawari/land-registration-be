// src/config/initDb.js
const pool = require('./db');

const initDb = async () => {
  try {
    // Query untuk membuat tabel users (sesuai update terakhir pakai email)
    const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nik VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        birth_place VARCHAR(100),
        birth_date DATE,
        gender VARCHAR(20),
        job VARCHAR(100),
        ktp_photo VARCHAR(255),
        kk_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(queryText);
    console.log('✅ Database Migration: Tabel "users" siap digunakan.');

    // Tambahkan di dalam try { ... } pada src/config/initDb.js

    const queryPengajuan = `
      CREATE TABLE IF NOT EXISTS pengajuan (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id), -- Relasi ke tabel users (opsional, jika pakai login)
        status VARCHAR(20) DEFAULT 'pending',
        role VARCHAR(20) NOT NULL,
        owner_name VARCHAR(100) NOT NULL,
        relationship VARCHAR(50),
        provinsi_id VARCHAR(10),
        kota_id VARCHAR(10),
        kecamatan_id VARCHAR(10),
        desa_id VARCHAR(10),
        alamat TEXT,
        luas NUMERIC,
        kondisi VARCHAR(20),
        koordinat VARCHAR(50),
        jenis_doc_hak VARCHAR(50),
        nomor_doc VARCHAR(100),
        tahun_terbit VARCHAR(4),
        riwayat_penguasaan VARCHAR(50),
        ktp_file_path VARCHAR(255),
        kk_file_path VARCHAR(255),
        land_document_file_path VARCHAR(255),
        location_photo_file_path VARCHAR(255),
        uploaded_legal_file_path VARCHAR(255),
        notes TEXT,
        disclaimer_accepted BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(queryPengajuan);
    console.log('✅ Database Migration: Tabel "pengajuan" siap digunakan.');
    
  } catch (error) {
    console.error('❌ Database Migration Gagal:', error.message);
  }
};

module.exports = initDb;