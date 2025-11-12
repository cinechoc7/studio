'use client';

import { useState, useEffect } from 'react';
import type { Package, PackageStatus, ContactInfo } from './types';
import { useAuth } from '@/firebase';

// This is a mock in-memory store.
// In a real app, you would use a database like Firestore.
let packages: Package[] = [
  {
    id: 'CS123456789FR',
    sender: {
        name: 'Expéditeur SA',
        address: '123 Rue de la Logistique, 75001 Paris, France',
        email: 'contact@expediteur.fr',
        phone: '0123456789'
    },
    recipient: {
        name: 'Jean Dupont',
        address: '456 Avenue du Soleil, 13008 Marseille, France',
        email: 'jean.dupont@email.com',
        phone: '0612345678'
    },
    origin: 'Paris, France',
    destination: 'Marseille, France',
    currentStatus: 'En cours d\'acheminement',
    statusHistory: [
      { status: 'Pris en charge', location: 'Entrepôt Paris', timestamp: new Date('2024-07-21T10:00:00Z') },
      { status: 'En cours d\'acheminement', location: 'Centre de tri, Lyon', timestamp: new Date('2024-07-22T08:30:00Z') },
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  },
  {
    id: 'CS987654321CA',
    sender: {
        name: 'Tech Innov',
        address: '789 Boulevard de l\'Innovation, 69002 Lyon, France',
        email: 'sales@techinnov.com',
        phone: '0472000000'
    },
    recipient: {
        name: 'Marie Curie',
        address: '101 Rue de la Science, 59000 Lille, France',
        email: 'marie.curie@labo.com',
        phone: '0787654321'
    },
    origin: 'Lyon, France',
    destination: 'Lille, France',
    currentStatus: 'Livré',
    statusHistory: [
      { status: 'Pris en charge', location: 'Entrepôt Lyon', timestamp: new Date('2024-07-18T16:20:00Z') },
      { status: 'En cours d\'acheminement', location: 'Centre de tri, Paris', timestamp: new Date('2024-07-19T11:00:00Z') },
      { status: 'Arrivé au hub de distribution', location: 'Hub de Lille', timestamp: new Date('2024-07-20T09:00:00Z') },
      { status: 'En cours de livraison', location: 'Lille', timestamp: new Date('2024-07-20T10:15:00Z') },
      { status: 'Livré', location: 'Lille, France', timestamp: new Date('2024-07-20T13:45:00Z') },
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  },
];

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
            setPackageData({ packages: [...packages].sort((a, b) => a.id.localeCompare(b.id)), isLoading: false });
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
