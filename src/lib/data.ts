
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
  serverTimestamp
} from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Package, StatusHistory } from './types';

function getFirestoreDB() {
    return getSdks().firestore;
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
            newObj[key] = convertFirestoreTimestamp(data[key]);
        }
        return newObj;
    }
    return data;
}

export async function getAllPackages(): Promise<Package[]> {
  const db = getFirestoreDB();
  const packagesCol = collection(db, 'packages');
  const packageSnapshot = await getDocs(packagesCol);
  const packagesList = packageSnapshot.docs.map(doc => convertFirestoreTimestamp(doc.data()));
  return packagesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Package[];
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  if (!id) return undefined;
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', id.toUpperCase());
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertFirestoreTimestamp(docSnap.data()) as Package;
  } else {
    return undefined;
  }
}

export async function addPackage(pkg: Omit<Package, 'createdAt'> & { createdAt?: any }): Promise<Package> {
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', pkg.id);
  const finalPackage = {
      ...pkg,
      createdAt: serverTimestamp(),
  };
  await setDoc(docRef, finalPackage);
  // We return the package with a local date for immediate use, though Firestore will have the server timestamp
  return { ...pkg, createdAt: new Date() } as Package;
}

export async function deletePackage(id: string): Promise<boolean> {
  if (!id) return false;
  const db = getFirestoreDB();
  const docRef = doc(db, 'packages', id);
  await deleteDoc(docRef);
  return true;
}

export async function updatePackage(id: string, updatedData: Partial<Omit<Package, 'id'>>): Promise<Package | null> {
    if (!id) return null;
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    // Firestore's updateDoc can't handle nested object replacement well with dot notation for partial updates.
    // Let's get the full doc, merge, and then set.
    const currentDoc = await getPackageById(id);
    if (!currentDoc) {
        return null;
    }
    
    const newPackageData = {
        ...currentDoc,
        ...updatedData,
        sender: { ...currentDoc.sender, ...(updatedData.sender || {}) },
        recipient: { ...currentDoc.recipient, ...(updatedData.recipient || {}) },
    };

    await setDoc(docRef, newPackageData, { merge: true });
    return newPackageData as Package;
}

export async function updateStatus(id: string, status: string, location: string): Promise<Package | null> {
    if (!id) return null;
    const db = getFirestoreDB();
    const docRef = doc(db, 'packages', id);
    
    const currentDoc = await getPackageById(id);
    if (!currentDoc) {
        return null;
    }

    const newStatusEntry: StatusHistory = {
        status: status as any,
        location: location,
        timestamp: new Date() // Will be converted to Firestore Timestamp on save
    };
    
    const updatedHistory = [newStatusEntry, ...currentDoc.statusHistory];

    await updateDoc(docRef, {
        currentStatus: newStatusEntry.status,
        statusHistory: updatedHistory,
    });

    return {
        ...currentDoc,
        currentStatus: newStatusEntry.status,
        statusHistory: updatedHistory
    } as Package;
}
