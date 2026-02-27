const pool = require('../config/db');

// Fungsi bantuan untuk men-generate ID PRJ_YYYYMMDD_XXX
const generatePengajuanId = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomStr = Math.floor(100 + Math.random() * 900); // 3 digit random
  return `PRJ_${yyyy}${mm}${dd}_${randomStr}`;
};

exports.createPengajuan = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};
    let errors = [];

    // --- 1. VALIDASI MANUAL ---
    const allowedRoles = ['pemilik', 'waris', 'kuasa'];
    if (!data.role) errors.push({ field: 'role', message: 'Role harus diisi' });
    else if (!allowedRoles.includes(data.role)) errors.push({ field: 'role', message: 'Role tidak valid' });

    if (!data.ownerName) errors.push({ field: 'ownerName', message: 'Nama pemilik harus diisi' });
    
    if (data.role === 'waris' && !data.relationship) {
      errors.push({ field: 'relationship', message: 'Hubungan dengan pemilik harus diisi untuk role waris' });
    }

    if (!data.koordinat || !data.koordinat.includes(',')) {
        errors.push({ field: 'koordinat', message: 'Format koordinat tidak valid' });
    }

    if (data.disclaimerAccepted !== 'true') {
      errors.push({ field: 'disclaimerAccepted', message: 'Anda harus menyetujui disclaimer' });
    }

    // Jika ada error validasi text, return 400
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Data wajib tidak lengkap",
        errors: errors
      });
    }

    // --- 2. AMBIL PATH FILE ---
    // Pastikan pakai optional chaining (?.) untuk menghindari error jika file tidak diupload
    const ktpPath = files['ktp'] ? files['ktp'][0].path : null;
    const kkPath = files['kk'] ? files['kk'][0].path : null;
    const landDocPath = files['landDocument'] ? files['landDocument'][0].path : null;
    const photoPath = files['locationPhoto'] ? files['locationPhoto'][0].path : null;
    const legalPath = files['uploadedLegalFile'] ? files['uploadedLegalFile'][0].path : null;

    // --- 3. INSERT KE DATABASE ---
    const pengajuanId = generatePengajuanId();
    const userId = req.user ? req.user.id : null; // Asumsi ada middleware auth, jika belum set null/dummy

    const query = `
      INSERT INTO pengajuan (
        id, user_id, status, role, owner_name, relationship,
        provinsi_id, kota_id, kecamatan_id, desa_id, alamat, luas, kondisi, koordinat,
        jenis_doc_hak, nomor_doc, tahun_terbit, riwayat_penguasaan,
        ktp_file_path, kk_file_path, land_document_file_path, location_photo_file_path, uploaded_legal_file_path,
        notes, disclaimer_accepted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *;
    `;

    const values = [
      pengajuanId, userId, 'pending', data.role, data.ownerName, data.relationship || null,
      data.provinsi, data.kota, data.kecamatan, data.desa, data.alamat, data.luas, data.kondisi, data.koordinat,
      data.jenisDocHak, data.nomorDoc, data.tahunTerbit, data.riwayatPenguasaan,
      ktpPath, kkPath, landDocPath, photoPath, legalPath,
      data.notes, data.disclaimerAccepted === 'true'
    ];

    const result = await pool.query(query, values);

    // --- 4. RESPONSE SUKSES (Sesuai Template Anda) ---
    res.status(201).json({
      success: true,
      message: "Pengajuan berhasil dikirim. Kami akan segera mengurusnya untuk Anda.",
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
        reference_number: `ABB-${result.rows[0].id}`,
        estimatedReviewTime: "3-5 hari kerja"
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      errors: [{ message: err.message }]
    });
  }
};