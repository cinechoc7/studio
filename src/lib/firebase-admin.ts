'use server';

import { initializeApp, getApps, getApp, App, deleteApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export function initializeFirebaseAdmin(): App {
    if (getApps().length) {
        // In a serverless environment, the app instance might persist across function invocations.
        // It's safer to get the existing app instance.
        return getApp('__admin__');
    }
    
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. This is required for server-side actions.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return initializeApp({
            credential: credential.cert(serviceAccount)
        }, '__admin__'); // Give a unique name to avoid conflicts
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string. Error: ${e.message}`);
    }
}
