// src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Gunakan secret key yang sama dengan yang ada di userController saat login
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari header 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // Format token biasanya: "Bearer <token_string>"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Jika tidak ada token, tolak aksesnya
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan. Silakan login terlebih dahulu.',
      data: null
    });
  }

  try {
    // 3. Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Simpan data hasil decode (berisi id dan email user) ke dalam object request (req)
    req.user = decoded;
    
    // 5. Lanjut ke proses berikutnya (controller/upload)
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.',
      data: null
    });
  }
};

module.exports = verifyToken;