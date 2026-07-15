// api/creators/route.js
import { db } from '../_lib/firebase.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const snapshot = await db.ref('creators').once('value');
      const data = snapshot.val();
      const creators = data ? Object.keys(data).map(key => ({
        firebaseKey: key,
        ...data[key]
      })) : [];
      res.status(200).json(creators);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Gagal ambil data' });
    }
  } else if (req.method === 'POST') {
    // Buat creator baru (admin only)
    try {
      const { adminPassword, ...creatorData } = req.body;
      
      if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const newRef = db.ref('creators').push();
      await newRef.set({
        ...creatorData,
        id: "cre_" + Date.now()
      });
      
      res.status(201).json({ success: true, message: 'Creator ditambahkan' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Gagal menambahkan' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}