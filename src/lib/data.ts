'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Package } from './types';
import { revalidatePath } from 'next/cache';

let memoryPackages: Package[] = [
    {
        id: 'CM123456789FR',
        adminId: 'demo-user',
        sender: { name: 'Boutique de Gadgets', address: '123 Rue de l\'Innovation, 75002 Paris', email: 'contact@gadget.com', phone: '0123456789' },
        recipient: { name: 'Jean Dupont', address: '45 Avenue des Champs-Élysées, 75008 Paris', email: 'jean.dupont@email.com', phone: '0612345678' },
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
        adminId: 'demo-user',
        sender: { name: 'Librairie Le Savoir', address: '15 Rue de la Paix, 75001 Paris', email: 'librairie@savoir.fr', phone: '0198765432' },
        recipient: { name: 'Marie Curie', address: '22 Rue de la Liberté, 13001 Marseille', email: 'marie.curie@email.fr', phone: '0687654321' },
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

// This is a simple event emitter to notify components of data changes.
const createNanoEvents = () => ({
  events: {} as Record<string, Function[]>,
  emit(event: string) {
    (this.events[event] || []).forEach(cb => cb());
  },
  on(event: string, cb: Function) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () => (this.events[event] = (this.events[event] || []).filter(i => i !== cb));
  }
});
const emitter = createNanoEvents();

export const dataChanged = () => emitter.emit('changed');


export function usePackages() {
    const [packages, setPackages] = useState(memoryPackages);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial data fetch
        const sortedPackages = [...memoryPackages].sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime());
        setPackages(sortedPackages);
        setIsLoading(false);

        // Listen for changes
        const unsubscribe = emitter.on('changed', () => {
            const sorted = [...memoryPackages].sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime());
            setPackages(sorted);
        });

        return unsubscribe;
    }, []);

    return { packages, isLoading };
}


export async function getPackages(): Promise<Package[]> {
    return Promise.resolve(memoryPackages.sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
}

export async function getPackageById(id: string): Promise<Package | undefined> {
    const pkg = memoryPackages.find(p => p.id === id);
    return Promise.resolve(pkg);
}

export async function addPackage(pkg: Package) {
    memoryPackages.push(pkg);
    dataChanged();
    return Promise.resolve(pkg);
}

export async function deletePackage(id: string) {
    const index = memoryPackages.findIndex(p => p.id === id);
    if (index > -1) {
        memoryPackages.splice(index, 1);
        dataChanged();
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

export async function updatePackage(id: string, updatedData: Partial<Package>) {
    const index = memoryPackages.findIndex(p => p.id === id);
    if (index > -1) {
        memoryPackages[index] = { ...memoryPackages[index], ...updatedData };
        dataChanged();
        return Promise.resolve(memoryPackages[index]);
    }
    return Promise.resolve(null);
}

export async function updateStatus(id: string, status: string, location: string) {
     const index = memoryPackages.findIndex(p => p.id === id);
     if (index > -1) {
        const pkg = memoryPackages[index];
        const newStatusEntry = {
            status,
            location,
            timestamp: new Date()
        };
        pkg.currentStatus = newStatusEntry.status as any;
        pkg.statusHistory.unshift(newStatusEntry as any);
        dataChanged();
        return Promise.resolve(pkg);
     }
     return Promise.resolve(null);
}
