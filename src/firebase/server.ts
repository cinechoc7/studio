import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This file is intended for server-side use only.

export function initializeFirebase() {
  if (!getApps().length) {
    // When running on the server, we can directly use the config object.
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  
  // If already initialized, return the SDKs for the existing app.
  return getSdks(getApp());
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
