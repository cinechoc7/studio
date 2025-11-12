'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth, useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
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
  type Firestore,
} from 'firebase/firestore';


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

const examplePackages: Package[] = [
    {
        id: 'CM123456789FR',
        adminId: 'dummy-admin-id',
        sender: { name: 'Boutique de Gadgets', address: '123 Rue de l\'Innovation, 75002 Paris' },
        recipient: { name: 'Jean Dupont', address: '45 Avenue des Champs-Élysées, 75008 Paris' },
        origin: 'Paris, France',
        destination: 'Paris, France',
        currentStatus: 'Livré',
        statusHistory: [
            { status: 'Livré', location: 'Paris, France', timestamp: new Date('2023-10-27T14:00:00Z') },
            { status: 'En cours de livraison', location: 'Centre de distribution Paris', timestamp: new Date('2023-10-27T09:30:00Z') },
            { status: 'Arrivé au hub de distribution', location: 'Hub de Paris', timestamp: new Date('2023-10-26T22:15:00Z') },
            { status: 'En cours d\'acheminement', location: 'Centre de tri, Lyon', timestamp: new Date('2023-10-26T10:00:00Z') },
            { status: 'Pris en charge', location: 'Entrepôt de Lyon', timestamp: new Date('2023-10-25T18:00:00Z') }
        ],
        createdAt: new Date('2023-10-25T18:00:00Z'),
    },
    {
        id: 'CM987654321FR',
        adminId: 'dummy-admin-id',
        sender: { name: 'Librairie Le Savoir', address: '15 Rue de la Paix, 75001 Paris' },
        recipient: { name: 'Marie Curie', address: '22 Rue de la Liberté, 13001 Marseille' },
        origin: 'Paris, France',
        destination: 'Marseille, France',
        currentStatus: 'En cours d\'acheminement',
        statusHistory: [
            { status: 'En cours d\'acheminement', location: 'Sur l\'autoroute A7', timestamp: new Date() },
            { status: 'Arrivé au hub de distribution', location: 'Hub de Lyon', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { status: 'Pris en charge', location: 'Entrepôt de Paris', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
];


// Hook to get packages and subscribe to updates for the current admin
export function usePackages() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const packagesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Query packages where the adminId matches the current user's UID
        return query(collection(firestore, 'packages'), where("adminId", "==", user.uid));
    }, [firestore, user]);
    
    const { data, isLoading: isPackagesLoading, error } = useCollection<Omit<Package, 'statusHistory' | 'id'> & { statusHistory: any[] }>(packagesQuery);

    const packages = useMemo(() => {
        if (!data) return [];
        // If the database returns no packages, show the example packages.
        if (data.length === 0) {
            return examplePackages;
        }
        return data.map(pkg => convertTimestamps(pkg) as Package);
    }, [data]);
    
    useEffect(() => {
        if(error) {
            console.error("Error fetching packages:", error);
        }
    }, [error]);

    // Combine loading states: still loading if user is loading OR if packages are loading
    const isLoading = isUserLoading || (!!user && isPackagesLoading);

    return { packages, isLoading };
}


export async function getPackageById(firestore: Firestore, id: string): Promise<Package | undefined> {
    // First, check if it's an example package
    const examplePkg = examplePackages.find(p => p.id === id);
    if (examplePkg) {
        return examplePkg;
    }

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
        const createdPackage = { id: newId, ...pkgData, ...newPackageData };
        return convertTimestamps(createdPackage) as Package;
    } catch (error) {
        console.error("Error creating package:", error);
        throw error;
    }
}

export async function updatePackageStatus(firestore: Firestore, id: string, newStatus: PackageStatus, location: string): Promise<Package | null> {
    const docRef = doc(firestore, 'packages', id);

    try {
        const docSnap = await getDoc(docRef);
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

        await updateDoc(docRef, {
            currentStatus: newStatus,
            statusHistory: updatedHistory,
        });
        
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
        return true;
    } catch (error) {
        console.error("Error deleting package:", error);
        throw error;
    }
}
