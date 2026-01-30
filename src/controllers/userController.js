// src/controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

exports.registerUser = async (req, res) => {
  try {
    const { nik, password, name, birthPlace, birthDate, gender, job } = req.body;
    
    // Cek apakah file ada (untuk menghindari error undefined)
    const ktpPhoto = req.files && req.files['ktpPhoto'] ? req.files['ktpPhoto'][0].path : null;
    const kkPhoto = req.files && req.files['kkPhoto'] ? req.files['kkPhoto'][0].path : null;

    // Validasi NIK Unik
    const userExist = await pool.query('SELECT * FROM users WHERE nik = $1', [nik]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'NIK sudah terdaftar',
        data: null
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert Database
    const newUser = await pool.query(
      `INSERT INTO users (nik, password, name, birth_place, birth_date, gender, job, ktp_photo, kk_photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, nik, name, job, created_at`,
      [nik, hashedPassword, name, birthPlace, birthDate, gender, job, ktpPhoto, kkPhoto]
    );

    // RESPONSE SUKSES
    res.status(201).json({
      status: true,
      message: 'Registrasi berhasil',
      data: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    // RESPONSE ERROR SERVER
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server: ' + err.message,
      data: null
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { nik, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE nik = $1', [nik]);
    
    // Validasi User Tidak Ditemukan
    if (user.rows.length === 0) {
      return res.status(401).json({
        status: false,
        message: 'NIK atau Password salah',
        data: null
      });
    }

    // Validasi Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({
        status: false,
        message: 'NIK atau Password salah',
        data: null
      });
    }

    // Generate Token
    const token = jwt.sign({ id: user.rows[0].id, nik: user.rows[0].nik }, JWT_SECRET, { expiresIn: '1h' });

    // RESPONSE SUKSES
    res.json({
      status: true,
      message: 'Login berhasil',
      data: {
        token: token,
        user: {
            id: user.rows[0].id,
            name: user.rows[0].name,
            nik: user.rows[0].nik
        }
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan pada server',
      data: null
    });
  }
};