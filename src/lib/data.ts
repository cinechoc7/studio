'use client';

import { useState, useEffect } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth } from '@/firebase';

// This is a mock in-memory store.
// In a real app, you would use a database like Firestore.
let packages: Package[] = [];

// Custom event dispatcher to notify about package updates
const packageUpdateEvent = new Event('packagesUpdated');

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hook to get packages and subscribe to updates
export function usePackages() {
    const [packageData, setPackageData] = useState<{ packages: Package[], isLoading: boolean }>({ packages: [], isLoading: true });

    useEffect(() => {
        const fetchPackages = async () => {
            await delay(500); // simulate fetch latency
            setPackageData({ packages: [...packages].sort((a, b) => new Date(b.statusHistory[0].timestamp).getTime() - new Date(a.statusHistory[0].timestamp).getTime()), isLoading: false });
        };

        fetchPackages();

        const handleUpdate = () => fetchPackages();
        window.addEventListener('packagesUpdated', handleUpdate);

        return () => {
            window.removeEventListener('packagesUpdated', handleUpdate);
        };
    }, []);

    return packageData;
}


export async function getPackageById(id: string): Promise<Package | undefined> {
  await delay(200);
  return packages.find(p => p.id.toUpperCase() === id.toUpperCase());
}

export async function createPackage(pkgData: Omit<Package, 'id' | 'currentStatus' | 'statusHistory'>): Promise<Package> {
    await delay(1000);
    
    // Generate a new tracking ID
    const trackingId = `CS${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const newPackage: Package = {
        ...pkgData,
        id: trackingId,
        currentStatus: 'Pris en charge',
        statusHistory: [
            {
                status: 'Pris en charge',
                location: pkgData.origin,
                timestamp: new Date(),
            }
        ]
    };
    packages.unshift(newPackage); // Add to the beginning of the array
    window.dispatchEvent(packageUpdateEvent); // Notify listeners
    return newPackage;
}

export async function updatePackageStatus(id: string, newStatus: PackageStatus, location: string): Promise<Package | null> {
  await delay(1000);
  const packageIndex = packages.findIndex(p => p.id === id);
  if (packageIndex === -1) {
    return null;
  }

  const updatedPackage = { ...packages[packageIndex] };
  updatedPackage.currentStatus = newStatus;
  updatedPackage.statusHistory.unshift({
    status: newStatus,
    location,
    timestamp: new Date(),
  });

  packages[packageIndex] = updatedPackage;
  window.dispatchEvent(packageUpdateEvent);
  return updatedPackage;
}

export async function deletePackage(id: string): Promise<boolean> {
    await delay(500);
    const packageIndex = packages.findIndex(p => p.id === id);
    if (packageIndex === -1) {
        return false;
    }
    
    packages.splice(packageIndex, 1);
    window.dispatchEvent(packageUpdateEvent);
    return true;
}