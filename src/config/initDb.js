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
    
  } catch (error) {
    console.error('❌ Database Migration Gagal:', error.message);
  }
};

module.exports = initDb;