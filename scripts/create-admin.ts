// To run this script:
// 1. Set the FIREBASE_SERVICE_ACCOUNT environment variable in your `.env.local` file.
//    (You can get this from your Firebase project settings -> Service accounts)
// 2. Run `npm run create-admin` from your project root.

import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../src/firebase/config';

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });


function initializeFirebaseAdmin(): admin.app.App {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    if (admin.apps.length > 0) {
        // Find an existing admin app, or return default
        const existingApp = admin.apps.find(app => app?.name === '__admin__');
        if (existingApp) {
            return existingApp;
        }
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    }, '__admin__');
}


async function createAdminUser() {
  const email = 'admin@colimove.com';
  const password = 'password';

  console.log(`Attempting to create admin user: ${email}...`);

  // Initialize client SDK for user creation
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  const auth = getAuth();
  
  // Initialize admin SDK for setting custom claims and writing to Firestore
  const adminApp = initializeFirebaseAdmin();
  const adminFirestore = getAdminFirestore(adminApp);
  const adminAuth = getAdminAuth(adminApp);

  let userCredential;

  try {
    // Attempt to create the user with the client SDK
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Successfully created new auth user:', userCredential.user.uid);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('User with this email already exists. Skipping creation, proceeding to grant roles...');
    } else {
      console.error('Error creating auth user:', error.message);
      process.exit(1);
    }
  }

  try {
    // Get user by email to ensure we have the UID
    const user = await adminAuth.getUserByEmail(email);
    const uid = user.uid;

    // Set custom claim to identify user as an admin (useful for some security rules)
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set custom claim 'admin:true' for ${uid}.`);

    // Create a document in the 'admins' collection to store public admin info
    const adminInfoDocRef = adminFirestore.collection('admins').doc(uid);
    await adminInfoDocRef.set({
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Successfully created/updated admin info doc for ${uid}.`);
    
    // Create a document in 'roles_admin' to grant the admin role via security rules
    const adminRoleDocRef = adminFirestore.collection('roles_admin').doc(uid);
    await adminRoleDocRef.set({
        isAdmin: true,
        grantedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Successfully granted admin role to ${uid} in 'roles_admin' collection.`);

    console.log('\nAdmin user processed successfully!');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error: any) {
      console.error('Error granting admin roles or creating docs:', error.message);
  } finally {
    // Force exit to prevent hanging
    process.exit(0);
  }
}

createAdminUser();
