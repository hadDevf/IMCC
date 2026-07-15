export default async function handler(req, res) {
  // CORS headers biar bisa diakses dari frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      password
    } = req.body;

    // ⚠️ GANTI PASSWORDNYA SESUAI KEINGINAN KAMU!
    const ADMIN_PASSWORD = 'imcc2026_99887766'; // Sama kayak di app.js

    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        message: 'Verifikasi berhasil!',
        // Optional: kirim token JWT kalo mau lebih aman
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Password salah!'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
}