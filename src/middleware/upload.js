// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- Tambahkan ini

// Tentukan lokasi folder
const uploadDir = 'uploads/';

// <--- LOGIKA BARU: Cek apakah folder ada, jika tidak buat foldernya
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Folder uploads berhasil dibuat!');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    // Kita tolak file, tapi jangan throw error agar bisa dihandle controller
    cb(new Error('Format file harus JPG atau PNG'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

module.exports = upload;