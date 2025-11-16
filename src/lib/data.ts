
'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { Package, StatusHistory } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- Firestore Initialization ---

let db: import('firebase/firestore').Firestore;

function getFirestoreDB() {
    if (!getApps().length) {
        try {
            initializeApp(firebaseConfig);
        } catch (e) {
            console.error("Error initializing Firebase app for server ops", e);
        }
    }
    if (!db) {
        db = getFirestore(getApp());
    }
    return db;
}


// --- JSON Cache Management ---

const packagesJsonPath = path.resolve(process.cwd(), 'src/lib/packages.json');

async function readPackagesJson(): Promise<Package[]> {
    try {
        const fileContent = await fs.readFile(packagesJsonPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        return [];
    }
}

async function writePackagesJson(packages: Package[]): Promise<void> {
    await fs.writeFile(packagesJsonPath, JSON.stringify(packages, null, 2), 'utf-8');
}

async function synchronizeJsonCache(): Promise<void> {
    console.log("Synchronizing Firestore packages to local JSON cache...");
    const allPackages = await getAllPackagesFromFirestore();
    await writePackagesJson(allPackages);
    console.log("Synchronization complete.");
}


// --- Data Conversion ---

function convertFirestoreTimestamp(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(convertFirestoreTimestamp);
    }
    if (data && typeof data === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[key] = convertFirestoreTimestamp(data[key]);
            }
        }
        return newObj;
    }
    return data;
}


// --- Public Data Access (Reads from JSON Cache) ---

export async function getAllPackages(): Promise<Package[]> {
  return await readPackagesJson();
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  if (!id) return undefined;
  const packages = await readPackagesJson();
  const upperCaseId = id.toUpperCase();
  return packages.find(pkg => pkg.id.toUpperCase() === upperCaseId);
}


// --- Admin Data Access (Writes to Firestore & Updates Cache) ---

async function getAllPackagesFromFirestore(): Promise<Package[]> {
  const db = getFirestoreDB();
  const packagesCol = collection(db, 'packages');
  const q = query(packagesCol, orderBy('createdAt', 'desc'));
  const packageSnapshot = await getDocs(q);
  const packagesList = packageSnapshot.docs.map(doc => convertFirestoreTimestamp({ ...doc.data(), id: doc.id }));
  return packagesList as Package[];
}

export async function addPackage(pkg: Omit<Package, 'createdAt' | 'id'> & { id: string, createdAt?: any }): Promise<void> {
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', pkg.id);
  const finalPackage = {
      ...pkg,
      createdAt: serverTimestamp(),
  };
  await setDoc(docRef, finalPackage);
  await synchronizeJsonCache();
}

export async function deletePackage(id: string): Promise<void> {
  if (!id) throw new Error("ID du colis manquant.");
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', id);
  await deleteDoc(docRef);
  await synchronizeJsonCache();
}

export async function updatePackage(id: string, updatedData: Partial<Omit<Package, 'id'>>): Promise<void> {
    if (!id) throw new Error("ID du colis manquant.");
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    const updatePayload: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(updatedData)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                updatePayload[`${key}.${nestedKey}`] = nestedValue;
            }
        } else {
            updatePayload[key] = value;
        }
    }
    
    await updateDoc(docRef, updatePayload);
    await synchronizeJsonCache();
}

export async function updateStatus(id: string, status: string, location: string): Promise<void> {
    if (!id) throw new Error("ID du colis manquant.");
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    const currentDocSnap = await getDoc(docRef);
    if (!currentDocSnap.exists()) {
        throw new Error("Colis non trouvé.");
    }
    const currentDocData = currentDocSnap.data();

    // Convert existing statusHistory timestamps before adding the new one
    const existingHistory = (currentDocData.statusHistory || []).map(convertFirestoreTimestamp);

    const newStatusEntry: StatusHistory = {
        status: status as any,
        location: location,
        timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newStatusEntry, ...existingHistory];

    await updateDoc(docRef, {
        currentStatus: newStatusEntry.status,
        statusHistory: updatedHistory,
    });
    await synchronizeJsonCache();
}
