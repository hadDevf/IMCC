// api/admin/registrations/[id].js
import {
  db
} from '../../_lib/firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {
    id
  } = req.query;
  const {
    adminPassword
  } = req.body;

  // Cek password admin
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  if (req.method === 'PUT') {
    try {
      const {
        isApproved
      } = req.body;

      if (isApproved) {
        // Ambil data registrasi
        const regSnap = await db.ref(`registrations/${id}`).once('value');
        const reg = regSnap.val();

        if (!reg) {
          return res.status(404).json({
            error: 'Data tidak ditemukan'
          });
        }

        // Pindah ke creators
        const newCreatorRef = db.ref('creators').push();
        await newCreatorRef.set({
          id: "cre_" + Date.now(),
          name: reg.name,
          role: "creator",
          bio: reg.details || 'Kreator Minecraft Indonesia',
          avatar: reg.avatarUrl || `https://placehold.co/120x120/141923/00F5FF?text=${reg.name.substring(0, 2).toUpperCase()}`,
          socials: reg.socials || {}
        });

        // Hapus dari registrations
        await db.ref(`registrations/${id}`).remove();

        res.status(200).json({
          success: true,
          message: `Pendaftaran ${reg.name} disetujui!`
        });
      } else {
        // Tolak = hapus aja
        await db.ref(`registrations/${id}`).remove();
        res.status(200).json({
          success: true, message: 'Pendaftaran ditolak'
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Gagal memproses'
      });
    }
  } else {
    res.status(405).json({
      error: 'Method not allowed'
    });
  }
}