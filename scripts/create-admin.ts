
// To run this script:
// 1. Make sure you have `tsx` installed (`npm install -g tsx`)
// 2. Make sure your `.env.local` file has the `FIREBASE_SERVICE_ACCOUNT` variable set.
// 3. Run `npx tsx scripts/create-admin.ts` from your project root.

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App, deleteApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../src/firebase/config';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeFirebaseAdmin(): App {
    if (getAdminApps().length) {
        return getAdminApps()[0];
    }
    
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your .env.local file.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return initializeAdminApp({
            credential: credential.cert(serviceAccount)
        }, 'admin-script-app'); // Give a unique name to this app instance
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
    }
}


async function createAdminUser() {
  const email = 'admin@colimove.com';
  const password = 'password';

  console.log(`Attempting to create admin user: ${email}...`);

  // We need to initialize a client-side app to use client SDK for user creation
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  const auth = getAuth();
  
  // We need to initialize the admin app to write to Firestore with admin privileges
  const adminApp = initializeFirebaseAdmin();
  const adminFirestore = getAdminFirestore(adminApp);
  const adminAuth = getAdminAuth(adminApp);

  try {
    // Check if user already exists in Firebase Auth
    let userRecord;
    try {
        userRecord = await adminAuth.getUserByEmail(email);
        console.log('User with this email already exists in Firebase Auth:', userRecord.uid);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // User does not exist, so create them
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            userRecord = await adminAuth.getUser(userCredential.user.uid);
            console.log('Successfully created new auth user:', userRecord.uid);
        } else {
            throw error; // Re-throw other errors
        }
    }
    const user = userRecord;

    // Now, let's mark this user as an admin in Firestore in two places
    // 1. The 'admins' collection for general user info
    const adminInfoDocRef = adminFirestore.collection('admins').doc(user.uid);
    await adminInfoDocRef.set({
      email: user.email,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Successfully created/updated admin info doc for ${user.uid}.`);
    
    // 2. The 'roles_admin' collection to grant the admin role for security rules.
    const adminRoleDocRef = adminFirestore.collection('roles_admin').doc(user.uid);
    await adminRoleDocRef.set({
        isAdmin: true,
        grantedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Successfully granted admin role to ${user.uid} in 'roles_admin' collection.`);


    console.log('\nAdmin user processed successfully!');
    console.log('Email:', email);
    console.log('Password:', password, '(if newly created)');

  } catch (error: any) {
      console.error('Error creating or updating admin user:', error.message);
  } finally {
    // Clean up the admin app connection
    if (adminApp) {
        await deleteApp(adminApp);
    }
    // This script can hang if Firebase connections are not closed.
    // Using process.exit() is a forceful way to ensure it terminates.
    process.exit(0);
  }
}

createAdminUser();
