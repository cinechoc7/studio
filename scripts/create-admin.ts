// To run this script:
// 1. Make sure you have `tsx` installed (`npm install -g tsx`)
// 2. Make sure your `.env.local` file has the `FIREBASE_SERVICE_ACCOUNT` variable set.
// 3. Run `tsx scripts/create-admin.ts` from your project root.

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App } from 'firebase-admin/app';
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
    if (getAdminApps().length > 0) {
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
        });
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

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Successfully created new auth user:', user.uid);

    // Now, let's mark this user as an admin in Firestore in two places
    // 1. The 'admins' collection for general user info
    const adminInfoDocRef = adminFirestore.collection('admins').doc(user.uid);
    await adminInfoDocRef.set({
      email: user.email,
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`Successfully created admin info doc for ${user.uid}.`);
    
    // 2. The 'roles_admin' collection to grant the admin role for security rules.
    const adminRoleDocRef = adminFirestore.collection('roles_admin').doc(user.uid);
    await adminRoleDocRef.set({
        isAdmin: true,
        grantedAt: FieldValue.serverTimestamp()
    });
    console.log(`Successfully granted admin role to ${user.uid} in 'roles_admin' collection.`);


    console.log('\nAdmin user created and role granted successfully!');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('User with this email already exists. No action taken.');
    } else {
      console.error('Error creating admin user:', error.message);
    }
  } finally {
    // In a real script, you might want to terminate the process
    process.exit(0);
  }
}

createAdminUser();
