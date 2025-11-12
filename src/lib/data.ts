'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase-admin/firestore';


function convertTimestamps(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate();
  }
   if (data && typeof data.toDate === 'function') { // For Admin SDK Timestamps
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
    const { user, isUserLoading } = useUser();
    
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
    const docRef = firestore.collection("packages").doc(id);
    try {
        const docSnap = await docRef.get();
        if (docSnap.exists) {
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
    const statusHistory = [{
        status: 'Pris en charge',
        location: pkgData.origin,
        timestamp: new Date(),
    }];

    // Generate a 6-character alphanumeric ID
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const docRef = firestore.collection('packages').doc(newId);


    const newPackageData = {
        ...pkgData,
        adminId: adminId,
        currentStatus: 'Pris en charge',
        statusHistory: statusHistory,
        createdAt: serverTimestamp()
    };
    
    try {
        await docRef.set(newPackageData);
        const createdPackage = { id: newId, ...pkgData, ...newPackageData };
        return convertTimestamps(createdPackage) as Package;
    } catch (error) {
        console.error("Error creating package:", error);
        throw error;
    }
}

export async function updatePackageStatus(firestore: Firestore, id: string, newStatus: PackageStatus, location: string): Promise<Package | null> {
    const docRef = firestore.collection('packages').doc(id);

    try {
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
             throw new Error("Package not found.");
        }

        const currentPackageData = docSnap.data();
        
        const currentPackageStatusHistory = Array.isArray(currentPackageData.statusHistory) ? currentPackageData.statusHistory : [];

        const newStatusHistoryEntry = {
            status: newStatus,
            location,
            timestamp: new Date(),
        };

        const updatedHistory = [newStatusHistoryEntry, ...currentPackageStatusHistory];

        await docRef.update({
            currentStatus: newStatus,
            statusHistory: updatedHistory,
        });
        
        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...convertTimestamps(updatedDoc.data()) } as Package;

    } catch (error) {
        console.error("Error updating package status:", error);
        throw error;
    }
}


export async function deletePackage(firestore: Firestore, id: string): Promise<boolean> {
    const docRef = firestore.collection("packages").doc(id);
    try {
        await docRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting package:", error);
        throw error;
    }
}
