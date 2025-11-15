
// To run this script:
// 1. Make sure you have `tsx` installed (`npm install -g tsx`)
// 2. Make sure your `.env.local` file has the `FIREBASE_SERVICE_ACCOUNT` variable set.
// 3. Run `npx tsx scripts/create-admin.ts` from your project root.

import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../src/firebase/config';
import { initializeFirebaseAdmin } from '../src/lib/firebase-admin';


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

  } catch (error: any)      console.error('Error creating or updating admin user:', error.message);
  } finally {
    // This script can hang if Firebase connections are not closed.
    // Using process.exit() is a forceful way to ensure it terminates.
    process.exit(0);
  }
}

createAdminUser();
