// api/registrations/route.js
import {
  db
} from '../_lib/firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref('registrations').once('value');
      const data = snapshot.val();
      const registrations = data ? Object.keys(data).map(key => ({
        firebaseKey: key,
        ...data[key]
      })): [];
      res.status(200).json(registrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Gagal ambil data'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      const newRef = db.ref('registrations').push();
      await newRef.set({
        id: "reg_" + Date.now(),
        ...body,
        createdAt: new Date().toISOString()
      });
      res.status(201).json({
        success: true, message: `Pendaftaran ${body.name} berhasil!`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Gagal mendaftar'
      });
    }
  } else {
    res.status(405).json({
      error: 'Method not allowed'
    });
  }
}