// api/_lib/firebase.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();
const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
const IMAGE_API_URL = process.env.IMAGE_API_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export {
  db,
  IMAGE_API_KEY,
  IMAGE_API_URL,
  ADMIN_PASSWORD
};