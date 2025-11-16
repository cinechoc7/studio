
'use server';

import type { Package, StatusHistory } from './types';
import fs from 'fs/promises';
import path from 'path';

// Path to the JSON file
const dataPath = path.join(process.cwd(), 'src/lib/packages.json');

// --- Helper functions to read and write data ---

async function readData(): Promise<Package[]> {
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const packages = JSON.parse(fileContent);
    // Properly parse date strings into Date objects
    return packages.map((pkg: any) => ({
      ...pkg,
      createdAt: new Date(pkg.createdAt),
      statusHistory: pkg.statusHistory.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error reading data file:', error);
    // If the file doesn't exist or is empty, return an empty array
    return [];
  }
}

async function writeData(data: Package[]): Promise<void> {
  try {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 4));
  } catch (error) {
    console.error('Error writing data file:', error);
  }
}

// --- Data manipulation functions ---

export async function getAllPackages(): Promise<Package[]> {
  const packages = await readData();
  return packages.sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime());
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  const packages = await readData();
  const upperId = id.toUpperCase();
  return packages.find(p => p.id.toUpperCase() === upperId);
}

export async function addPackage(pkg: Package): Promise<Package> {
  const packages = await readData();
  packages.unshift(pkg);
  await writeData(packages);
  return pkg;
}

export async function deletePackage(id: string): Promise<boolean> {
  let packages = await readData();
  const initialLength = packages.length;
  packages = packages.filter(p => p.id !== id);
  if (packages.length < initialLength) {
    await writeData(packages);
    return true;
  }
  return false;
}

export async function updatePackage(id: string, updatedData: Partial<Omit<Package, 'id'>>): Promise<Package | null> {
    const packages = await readData();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
        const existingPackage = packages[index];
        const newPackageData = {
            ...existingPackage,
            ...updatedData,
            sender: { ...existingPackage.sender, ...(updatedData.sender || {}) },
            recipient: { ...existingPackage.recipient, ...(updatedData.recipient || {}) },
        };
        packages[index] = newPackageData;
        await writeData(packages);
        return newPackageData;
    }
    return null;
}

export async function updateStatus(id: string, status: string, location: string): Promise<Package | null> {
    const packages = await readData();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
        const pkg = packages[index];
        const newStatusEntry: StatusHistory = {
            status: status as any,
            location: location,
            timestamp: new Date()
        };
        pkg.currentStatus = newStatusEntry.status;
        pkg.statusHistory.unshift(newStatusEntry);
        await writeData(packages);
        return pkg;
    }
    return null;
}
