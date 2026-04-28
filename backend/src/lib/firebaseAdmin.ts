import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Inicialização do Firebase Admin
// Certifique-se de que a variável FIREBASE_SERVICE_ACCOUNT_JSON ou as individuais estejam no .env
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}')),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
  }
}

export default admin;
