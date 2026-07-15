// api/admin/registrations/[id].js
import { db, ADMIN_PASSWORD } from '../../_lib/firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const { adminPassword, isApproved } = req.body;

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (isApproved) {
      const regSnap = await db.ref(`registrations/${id}`).once('value');
      const reg = regSnap.val();
      if (!reg) return res.status(404).json({ error: 'Data tidak ditemukan' });

      const newCreatorRef = db.ref('creators').push();
      await newCreatorRef.set({
        id: "cre_" + Date.now(),
        name: reg.name,
        role: "creator",
        bio: reg.details || 'Kreator Minecraft Indonesia',
        avatar: reg.avatarUrl || `https://placehold.co/120x120/141923/00F5FF?text=${reg.name.substring(0,2).toUpperCase()}`,
        socials: reg.socials || {}
      });

      await db.ref(`registrations/${id}`).remove();
      res.status(200).json({ success: true, message: `Pendaftaran ${reg.name} disetujui!` });
    } else {
      await db.ref(`registrations/${id}`).remove();
      res.status(200).json({ success: true, message: 'Pendaftaran ditolak' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memproses' });
  }
}