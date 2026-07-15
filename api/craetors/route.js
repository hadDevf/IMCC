// api/creators/route.js
import {
  db
} from '../_lib/firebase.js';

export default async function handler(req, res) {
  // CORS biar frontend bisa akses
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const snapshot = await db.ref('creators').once('value');
    const data = snapshot.val();

    // Convert object ke array
    const creators = data ? Object.keys(data).map(key => ({
      firebaseKey: key,
      ...data[key]
    })): [];

    res.status(200).json(creators);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Gagal ambil data'
    });
  }
}