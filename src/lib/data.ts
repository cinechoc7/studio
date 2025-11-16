
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
import { initializeFirebase } from '@/firebase';
import type { Package, StatusHistory } from './types';

function getFirestoreDB() {
    // initializeFirebase is safe to call on the server
    return initializeFirebase().firestore;
}

function convertFirestoreTimestamp(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate();
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

export async function getAllPackages(): Promise<Package[]> {
  const db = getFirestoreDB();
  const packagesCol = collection(db, 'packages');
  const q = query(packagesCol, orderBy('createdAt', 'desc'));
  const packageSnapshot = await getDocs(q);
  const packagesList = packageSnapshot.docs.map(doc => convertFirestoreTimestamp({ ...doc.data(), id: doc.id }));
  return packagesList as Package[];
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  if (!id) return undefined;
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', id.toUpperCase());
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertFirestoreTimestamp({ ...docSnap.data(), id: docSnap.id }) as Package;
  } else {
    return undefined;
  }
}

export async function addPackage(pkg: Omit<Package, 'createdAt' | 'id'> & { id: string, createdAt?: any }): Promise<void> {
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', pkg.id);
  const finalPackage = {
      ...pkg,
      createdAt: serverTimestamp(),
  };
  await setDoc(docRef, finalPackage);
}

export async function deletePackage(id: string): Promise<void> {
  if (!id) throw new Error("ID du colis manquant.");
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', id);
  await deleteDoc(docRef);
}

export async function updatePackage(id: string, updatedData: Partial<Omit<Package, 'id'>>): Promise<void> {
    if (!id) throw new Error("ID du colis manquant.");
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    // To handle nested objects like 'sender' and 'recipient', we prepare the update object
    // with dot notation for specific fields.
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
}

export async function updateStatus(id: string, status: string, location: string): Promise<void> {
    if (!id) throw new Error("ID du colis manquant.");
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    const currentDocSnap = await getDoc(docRef);
    if (!currentDocSnap.exists()) {
        throw new Error("Colis non trouvé.");
    }
    const currentDoc = currentDocSnap.data() as Package;

    const newStatusEntry: StatusHistory = {
        status: status as any,
        location: location,
        timestamp: Timestamp.now()
    };
    
    // Prepend the new status to the existing history
    const updatedHistory = [newStatusEntry, ...(currentDoc.statusHistory || [])];

    await updateDoc(docRef, {
        currentStatus: newStatusEntry.status,
        statusHistory: updatedHistory,
    });
}
