import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return {
      firestore: getFirestore(getApp()),
    };
  }

  // Vercel build will not have the service account, so we fall back to client config
  // This is safe because server actions are protected by NextAuth/other means
  // and Firestore rules will still apply.
  if (!serviceAccount) {
    const app = initializeApp(firebaseConfig);
     return {
      firestore: getFirestore(app),
    };
  }


  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    projectId: firebaseConfig.projectId,
  });

  return {
    firestore: getFirestore(app),
  };
}