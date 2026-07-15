// api/_lib/firebase.js
import admin from 'firebase-admin';

// Inisialisasi sekali aja
if (!admin.apps.length) {
  // Ambil dari environment variables Vercel
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

export {
  db
};