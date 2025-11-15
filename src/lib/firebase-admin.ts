
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export function initializeFirebaseAdmin(): App {
    // Check if an admin app already exists to avoid re-initialization.
    // We filter by a unique name prefix to avoid conflicts with client-side apps.
    const adminApps = getApps().filter(app => app.name.startsWith('__admin__'));
    if (adminApps.length > 0) {
        return adminApps[0];
    }
    
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. This is required for server-side actions.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        // Initialize the app with a unique name to prevent conflicts if this function
        // were to be called in a different context.
        return initializeApp({
            credential: credential.cert(serviceAccount)
        }, `__admin__${Date.now()}`); 
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string. Error: ${e.message}`);
    }
}
