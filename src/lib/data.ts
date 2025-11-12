'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth, useFirestore, useCollection, initializeFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  Firestore,
  where,
  getFirestore,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Custom event dispatcher to notify about package updates
const packageUpdateEvent = new Event('packagesUpdated');

// Helper to get a stable firestore instance, initializing if needed.
const getDb = () => {
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    return getFirestore(getApps()[0]);
}

function convertTimestamps(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = convertTimestamps(data[key]);
      return acc;
    }, {} as any);
  }
  return data;
}


// Hook to get packages and subscribe to updates for the current admin
export function usePackages() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuth();
    
    const packagesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Query packages where the adminId matches the current user's UID
        return query(collection(firestore, 'packages'), where("adminId", "==", user.uid), orderBy('createdAt', 'desc'));
    }, [firestore, user]);
    
    const { data, isLoading: isPackagesLoading, error } = useCollection<Omit<Package, 'statusHistory' | 'id'> & { statusHistory: any[] }>(packagesQuery);

    const packages = useMemo(() => {
        if (!data) return [];
        return data.map(pkg => convertTimestamps(pkg) as Package);
    }, [data]);
    
    useEffect(() => {
        if(error) {
            console.error("Error fetching packages:", error);
        }
    }, [error]);

    return { packages, isLoading: isUserLoading || isPackagesLoading };
}


export async function getPackageById(firestore: Firestore, id: string): Promise<Package | undefined> {
    const docRef = doc(firestore, "packages", id);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const convertedData = convertTimestamps(data);
            return { id: docSnap.id, ...convertedData } as Package;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error("Error getting package by ID:", error);
        return undefined;
    }
}

export async function createPackage(pkgData: Omit<Package, 'id' | 'currentStatus' | 'statusHistory' | 'adminId' | 'createdAt'>, adminId: string): Promise<Package> {
    const firestore = getDb(); // Get a stable firestore instance
    
    const statusHistory = [{
        status: 'Pris en charge',
        location: pkgData.origin,
        timestamp: new Date(),
    }];

    // Generate a 6-character alphanumeric ID
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const docRef = doc(firestore, 'packages', newId);


    const newPackageData = {
        ...pkgData,
        adminId: adminId,
        currentStatus: 'Pris en charge',
        statusHistory: statusHistory,
        createdAt: serverTimestamp()
    };
    
    try {
        await setDoc(docRef, newPackageData);
        // This won't work in a server action, but we keep it for potential client-side calls
        if (typeof window !== 'undefined') {
            window.dispatchEvent(packageUpdateEvent);
        }
        return { id: newId, ...pkgData, ...convertTimestamps(newPackageData)} as Package;
    } catch (error) {
        console.error("Error creating package:", error);
        throw error;
    }
}

export async function updatePackageStatus(firestore: Firestore, id: string, newStatus: PackageStatus, location: string, adminId: string): Promise<Package | null> {
    const docRef = doc(firestore, 'packages', id);

    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().adminId !== adminId) {
             throw new Error("permission-denied");
        }

        const currentPackageData = docSnap.data();
        
        const currentPackageStatusHistory = Array.isArray(currentPackageData.statusHistory) ? currentPackageData.statusHistory : [];

        const newStatusHistoryEntry = {
            status: newStatus,
            location,
            timestamp: new Date(),
        };

        const updatedHistory = [newStatusHistoryEntry, ...currentPackageStatusHistory];

        await updateDoc(docRef, {
            currentStatus: newStatus,
            statusHistory: updatedHistory,
        });
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(packageUpdateEvent);
        }
        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...convertTimestamps(updatedDoc.data()) } as Package;

    } catch (error) {
        console.error("Error updating package status:", error);
        throw error;
    }
}


export async function deletePackage(firestore: Firestore, id: string, adminId: string): Promise<boolean> {
    const docRef = doc(firestore, "packages", id);
    try {
         const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().adminId !== adminId) {
             throw new Error("permission-denied");
        }
        await deleteDoc(docRef);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(packageUpdateEvent);
        }
        return true;
    } catch (error) {
        console.error("Error deleting package:", error);
        throw error;
    }
}

// Function to create initial user (run from a temporary script or setup page)
export async function createInitialAdminUser(auth: any, email: string, pass: string) {
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        console.log("Admin user created:", userCredential.user.uid);
        
        const firestore = getFirestore();
        // Add a document to `admins` collection to mark this user as an admin
        const adminDocRef = doc(firestore, 'admins', userCredential.user.uid);
        await setDoc(adminDocRef, {
            email: userCredential.user.email,
            createdAt: serverTimestamp()
        });
        console.log("Admin role set in Firestore.");
        
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists.');
            return null;
        }
        console.error("Error creating initial admin user:", error);
        throw error;
    }
}
