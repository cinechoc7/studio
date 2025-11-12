import type { Package, PackageStatus } from './types';

// In-memory store for packages
let packages: Package[] = [
  {
    id: 'CS123456789FR',
    customerName: 'Jean Dupont',
    origin: 'Paris, France',
    destination: 'Marseille, France',
    currentStatus: 'En cours de transit',
    statusHistory: [
      { status: 'En cours d\'emballage', location: 'Entrepôt Paris', timestamp: new Date('2024-07-20T10:00:00Z') },
      { status: 'En cours de transit', location: 'Centre de tri, Lyon', timestamp: new Date('2024-07-21T08:30:00Z') },
    ],
  },
  {
    id: 'CS987654321CA',
    customerName: 'Marie Curie',
    origin: 'Lyon, France',
    destination: 'Lille, France',
    currentStatus: 'Livré',
    statusHistory: [
      { status: 'En attente', location: 'Entrepôt Lyon', timestamp: new Date('2024-07-18T14:00:00Z') },
      { status: 'En cours d\'emballage', location: 'Entrepôt Lyon', timestamp: new Date('2024-07-18T16:20:00Z') },
      { status: 'En cours de transit', location: 'Centre de tri, Paris', timestamp: new Date('2024-07-19T11:00:00Z') },
      { status: 'Arrivé au hub', location: 'Hub de Lille', timestamp: new Date('2024-07-20T09:00:00Z') },
      { status: 'En cours de livraison', location: 'Lille', timestamp: new Date('2024-07-20T10:15:00Z') },
      { status: 'Livré', location: 'Lille, France', timestamp: new Date('2024-07-20T13:45:00Z') },
    ],
  },
  {
    id: 'CS555555555DE',
    customerName: 'Louis Pasteur',
    origin: 'Strasbourg, France',
    destination: 'Bordeaux, France',
    currentStatus: 'En attente',
    statusHistory: [
        { status: 'En attente', location: 'Entrepôt Strasbourg', timestamp: new Date('2024-07-22T09:00:00Z') },
    ],
  },
];

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPackages(): Promise<Package[]> {
  await delay(500);
  return [...packages].sort((a, b) => a.id.localeCompare(b.id));
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  await delay(500);
  return packages.find(p => p.id.toUpperCase() === id.toUpperCase());
}

export async function updatePackageStatus(id: string, newStatus: PackageStatus, location: string): Promise<Package | null> {
  await delay(1000);
  const packageIndex = packages.findIndex(p => p.id === id);
  if (packageIndex === -1) {
    return null;
  }

  const updatedPackage = { ...packages[packageIndex] };
  updatedPackage.currentStatus = newStatus;
  updatedPackage.statusHistory.push({
    status: newStatus,
    location,
    timestamp: new Date(),
  });

  // Sort history to show most recent first, which is how we'll display it
  updatedPackage.statusHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  packages[packageIndex] = updatedPackage;
  return updatedPackage;
}
