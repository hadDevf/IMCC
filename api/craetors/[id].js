// api/creators/[id].js
import {
  db,
  ADMIN_PASSWORD
} from '../_lib/firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    id
  } = req.query;

  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref(`creators/${id}`).once('value');
      const data = snapshot.val();
      if (!data) return res.status(404).json({
        error: 'Creator tidak ditemukan'
      });
      res.status(200).json({
        firebaseKey: id, ...data
      });
    } catch (error) {
      res.status(500).json({
        error: 'Gagal ambil data'
      });
    }
  } else if (req.method === 'PUT') {
    const {
      adminPassword,
      ...updatedData
    } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) return res.status(401).json({
      error: 'Unauthorized'
    });
    try {
      await db.ref(`creators/${id}`).update(updatedData);
      res.status(200).json({
        success: true, message: 'Creator diupdate'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Gagal update'
      });
    }
  } else if (req.method === 'DELETE') {
    const {
      adminPassword
    } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) return res.status(401).json({
      error: 'Unauthorized'
    });
    try {
      await db.ref(`creators/${id}`).remove();
      res.status(200).json({
        success: true, message: 'Creator dihapus'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Gagal hapus'
      });
    }
  } else {
    res.status(405).json({
      error: 'Method not allowed'
    });
  }
}