// src/routes/pengajuanRoutes.js
const express = require('express');
const router = express.Router();
const pengajuanController = require('../controllers/pengajuanController');
const uploadPengajuan = require('../middleware/uploadPengajuan');
const multer = require('multer');

// ---> IMPORT MIDDLEWARE AUTH <---
const verifyToken = require('../middleware/auth');

const uploadFields = uploadPengajuan.fields([
  { name: 'ktp', maxCount: 1 },
  { name: 'kk', maxCount: 1 },
  { name: 'landDocument', maxCount: 1 },
  { name: 'locationPhoto', maxCount: 1 },
  { name: 'uploadedLegalFile', maxCount: 1 }
]);

const uploadMiddleware = (req, res, next) => {
  uploadFields(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: "File terlalu besar",
          errors: [{ field: err.field, message: `File pada field '${err.field}' melebihi batas maksimal 5 MB` }]
        });
      }
      return res.status(400).json({ success: false, message: err.message, errors: [] });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message, errors: [] });
    }
    next();
  });
};

// ---> PASANG VERIFY TOKEN DI SINI <---
// Urutannya: Cek Token -> Cek/Upload File -> Proses Database di Controller
router.post('/store', verifyToken, uploadMiddleware, pengajuanController.createPengajuan);

module.exports = router;