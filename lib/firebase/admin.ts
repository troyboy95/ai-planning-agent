import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set');
  
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  privateKey.replace(/\\n/g, '\n').replace(/"/g, ''),
    }),
  });
}

const adminApp = getAdminApp();
export const adminAuth      = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
