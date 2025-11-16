
'use server';

import type { Package } from './types';
import fs from 'fs/promises';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// --- Firebase Admin Initialization ---

function getFirestoreDB() {
    if (!getApps().length) {
        // This initialization is for server-side operations (like cache syncing)
        // It should use service credentials in a real production environment.
        // For this context, we'll initialize it to allow server-side reads.
        initializeApp({
             // In a real app, you'd use serviceAccountCredentials here
             // For now, let's rely on project context if available
        });
    }
    return getFirestore();
}

// --- JSON Cache Management ---
// The `packages.json` file acts as a fast, read-only cache for public-facing pages.
// It is updated whenever a write operation happens on the admin side.

const packagesJsonPath = path.resolve(process.cwd(), 'src/lib/packages.json');

async function readPackagesJson(): Promise<Package[]> {
    try {
        await fs.access(packagesJsonPath);
        const fileContent = await fs.readFile(packagesJsonPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist, is empty, or has invalid JSON, return empty array.
        return [];
    }
}

async function writePackagesJson(packages: Package[]): Promise<void> {
    await fs.writeFile(packagesJsonPath, JSON.stringify(packages, null, 2), 'utf-8');
}

/**
 * Synchronizes the local packages.json cache with the data from Firestore.
 * This should be triggered after any write operation to Firestore.
 */
export async function synchronizeJsonCache(): Promise<void> {
    try {
        console.log("Synchronizing Firestore packages to local JSON cache...");
        const db = getFirestoreDB();
        const packagesCol = db.collection('packages').orderBy('createdAt', 'desc');
        const snapshot = await packagesCol.get();
        
        const allPackages = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to ISO strings
            const convertedData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (value && value.toDate) { // Check for Firestore Timestamp
                    return value.toDate().toISOString();
                }
                return value;
            }));
            return { ...convertedData, id: doc.id } as Package;
        });

        await writePackagesJson(allPackages);
        console.log("Synchronization complete.");

    } catch (error) {
        console.error("Error during JSON cache synchronization:", error);
        // In a real app, you might want more robust error handling,
        // but for now, we'll log it. The app can still function with a stale cache.
    }
}


// --- Public Data Access (Reads from JSON Cache for performance and to avoid permission issues) ---

export async function getAllPackages(): Promise<Package[]> {
  return await readPackagesJson();
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  if (!id) return undefined;
  const packages = await readPackagesJson();
  const upperCaseId = id.toUpperCase();
  // Ensure we find the package regardless of its creation-time casing
  return packages.find(pkg => pkg.id.toUpperCase() === upperCaseId);
}
