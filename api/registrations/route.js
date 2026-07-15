// api/registrations/route.js
import {
  db
} from '../_lib/firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const body = req.body;
    const newRef = db.ref('registrations').push();

    await newRef.set({
      id: "reg_" + Date.now(),
      name: body.name,
      phone: body.phone,
      role: "creator",
      avatarUrl: body.avatarUrl || '',
      socials: body.socials || {},
      details: body.details || '',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Pendaftaran ${body.name} berhasil!`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Gagal mendaftar'
    });
  }
}