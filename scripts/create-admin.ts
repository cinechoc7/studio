// To run this script:
// 1. Make sure you have `tsx` installed (`npm install -g tsx`)
// 2. Make sure your `.env.local` file has the `FIREBASE_SERVICE_ACCOUNT` variable set.
// 3. Run `tsx scripts/create-admin.ts` from your project root.

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createAdminUser() {
  const email = 'admin@colimove.com';
  const password = 'password';

  console.log(`Attempting to create admin user: ${email}...`);

  // We need to initialize a client-side app to use client SDK for user creation
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Successfully created new auth user:', user.uid);

    // Now, let's mark this user as an admin in Firestore
    const adminDocRef = doc(firestore, 'admins', user.uid);
    await setDoc(adminDocRef, {
      email: user.email,
      createdAt: serverTimestamp()
    });

    console.log(`Successfully marked user ${user.uid} as admin in Firestore.`);
    console.log('\nAdmin user created successfully!');
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
