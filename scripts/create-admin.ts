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

    if (admin.apps.length) {
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
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

  try {
    let userRecord;
    try {
        userRecord = await adminAuth.getUserByEmail(email);
        console.log('User with this email already exists in Firebase Auth:', userRecord.uid);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            userRecord = await adminAuth.getUser(userCredential.user.uid);
            console.log('Successfully created new auth user:', userRecord.uid);
        } else {
            throw error;
        }
    }
    const user = userRecord;

    // Set a custom claim to identify the user as an admin
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set custom claim 'admin:true' for ${user.uid}.`);

    const adminInfoDocRef = adminFirestore.collection('admins').doc(user.uid);
    await adminInfoDocRef.set({
      email: user.email,
      createdAt: new Date(),
    }, { merge: true });
    console.log(`Successfully created/updated admin info doc for ${user.uid}.`);
    
    const adminRoleDocRef = adminFirestore.collection('roles_admin').doc(user.uid);
    await adminRoleDocRef.set({
        isAdmin: true,
        grantedAt: new Date()
    }, { merge: true });
    console.log(`Successfully granted admin role to ${user.uid} in 'roles_admin' collection.`);


    console.log('\nAdmin user processed successfully!');
    console.log('Email:', email);
    console.log('Password:', password, '(if newly created)');

  } catch (error: any) {
      console.error('Error creating or updating admin user:', error.message);
  } finally {
    // Force exit to prevent hanging
    process.exit(0);
  }
}

createAdminUser();
