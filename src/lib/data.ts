'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth, useFirestore, useCollection, initializeFirebase } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  Firestore,
} from 'firebase/firestore';

// Custom event dispatcher to notify about package updates
const packageUpdateEvent = new Event('packagesUpdated');


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


// Hook to get packages and subscribe to updates
export function usePackages() {
    const firestore = useFirestore();
    const packagesCollection = collection(firestore, 'packages');
    const q = query(packagesCollection, orderBy('createdAt', 'desc'));
    
    const { data, isLoading, error } = useCollection<Omit<Package, 'statusHistory' | 'id'> & { statusHistory: any[] }>(q as any);

    const packages = useMemo(() => {
        if (!data) return [];
        return data.map(pkg => convertTimestamps(pkg) as Package);
    }, [data]);
    
    useEffect(() => {
        if(error) {
            console.error("Error fetching packages:", error);
        }
    }, [error]);

    return { packages, isLoading };
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

export async function createPackage(firestore: Firestore, pkgData: Omit<Package, 'id' | 'currentStatus' | 'statusHistory' | 'adminId' | 'createdAt'>, adminId: string): Promise<Package> {
    const packagesCollection = collection(firestore, 'packages');
    
    const statusHistory = [{
        status: 'Pris en charge',
        location: pkgData.origin,
        timestamp: new Date(),
    }];

    const newPackageData = {
        ...pkgData,
        adminId: adminId,
        currentStatus: 'Pris en charge',
        statusHistory: statusHistory,
        createdAt: serverTimestamp()
    };
    
    try {
        const docRef = await addDoc(packagesCollection, newPackageData);
        window.dispatchEvent(packageUpdateEvent);
        return { id: docRef.id, ...pkgData, ...convertTimestamps(newPackageData)} as Package;
    } catch (error) {
        console.error("Error creating package:", error);
        throw error;
    }
}

export async function updatePackageStatus(firestore: Firestore, id: string, newStatus: PackageStatus, location: string): Promise<Package | null> {
    const docRef = doc(firestore, 'packages', id);

    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }

        const currentPackageData = docSnap.data();
        
        // Ensure statusHistory is an array
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
        
        window.dispatchEvent(packageUpdateEvent);
        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...convertTimestamps(updatedDoc.data()) } as Package;

    } catch (error) {
        console.error("Error updating package status:", error);
        throw error;
    }
}


export async function deletePackage(firestore: Firestore, id: string): Promise<boolean> {
    const docRef = doc(firestore, "packages", id);
    try {
        await deleteDoc(docRef);
        window.dispatchEvent(packageUpdateEvent);
        return true;
    } catch (error) {
        console.error("Error deleting package:", error);
        return false;
    }
}
