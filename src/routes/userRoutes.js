const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Route Register dengan upload 2 file
router.post('/register', upload.fields([
  { name: 'ktpPhoto', maxCount: 1 }, 
  { name: 'kkPhoto', maxCount: 1 }
]), userController.registerUser);

// Route Login
router.post('/login', userController.loginUser);

module.exports = router;