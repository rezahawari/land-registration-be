const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./config/db'); // Import koneksi db
const userRoutes = require('./routes/userRoutes');
const initDb = require('./config/initDb');
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: '*', // Ganti dengan URL Frontend Anda (misal React/Vue default port)
  optionsSuccessStatus: 200,
  methods: "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  credentials: true // Izinkan pengiriman token/cookies lintas domain
};

app.use(cors(corsOptions)); // Pasang Middleware CORS di sini

// Middleware untuk parsing body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', userRoutes);

// Contoh Route Sederhana: Cek Kesehatan Server
app.get('/', (req, res) => {
  res.send('Server Express.js + PostgreSQL berjalan!');
});

// Contoh Route: Ambil waktu sekarang dari Database
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
        message: 'Koneksi DB Berhasil', 
        time: result.rows[0].now 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
  });
});