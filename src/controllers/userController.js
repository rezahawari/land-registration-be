const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

// --- REGISTER USER (Pake Email) ---
exports.registerUser = async (req, res) => {
  try {
    // 1. Ambil Data (Sekarang ada email)
    const { email, nik, password, name, birthPlace, birthDate, gender, job } = req.body;

    // 2. Validasi Input Wajib
    if (!email || !password || !nik || !name) {
      return res.status(400).json({
        status: false,
        message: 'Data tidak lengkap! Email, NIK, Nama, dan Password wajib diisi.',
        data: null
      });
    }

    // 3. Cek apakah Email sudah terdaftar
    const emailExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailExist.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'Email sudah terdaftar, gunakan email lain.',
        data: null
      });
    }

    // 4. Cek apakah NIK sudah terdaftar (Opsional, biar tidak duplikat data orang)
    const nikExist = await pool.query('SELECT * FROM users WHERE nik = $1', [nik]);
    if (nikExist.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'NIK sudah terdaftar sebelumnya.',
        data: null
      });
    }

    // 5. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Siapkan File Path
    const ktpPhoto = req.files && req.files['ktpPhoto'] ? req.files['ktpPhoto'][0].path : null;
    const kkPhoto = req.files && req.files['kkPhoto'] ? req.files['kkPhoto'][0].path : null;

    // 7. Insert ke Database (Perhatikan urutan $1, $2, dst)
    const newUser = await pool.query(
      `INSERT INTO users (email, nik, password, name, birth_place, birth_date, gender, job, ktp_photo, kk_photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, email, name, created_at`,
      [email, nik, hashedPassword, name, birthPlace, birthDate, gender, job, ktpPhoto, kkPhoto]
    );

    res.status(201).json({
      status: true,
      message: 'Registrasi berhasil',
      data: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: false,
      message: 'Server Error: ' + err.message,
      data: null
    });
  }
};

// --- LOGIN USER (Pake Email) ---
exports.loginUser = async (req, res) => {
  try {
    // Input sekarang butuh email, bukan nik
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: false,
            message: 'Email dan Password wajib diisi',
            data: null
        });
    }

    // 1. Cari user berdasarkan EMAIL
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Validasi User Tidak Ditemukan
    if (user.rows.length === 0) {
      return res.status(401).json({
        status: false,
        message: 'Email atau Password salah',
        data: null
      });
    }

    // 2. Cek Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({
        status: false,
        message: 'Email atau Password salah',
        data: null
      });
    }

    // 3. Generate Token (Payload boleh ditambah email)
    const token = jwt.sign(
        { id: user.rows[0].id, email: user.rows[0].email }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // Response Sukses
    res.json({
      status: true,
      message: 'Login berhasil',
      data: {
        token: token,
        user: {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].job // Misalnya
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