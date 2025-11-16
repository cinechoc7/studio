
'use server';

import type { Package } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- JSON Cache Management ---
// The `packages.json` file acts as a fast, read-only cache for public-facing pages.
// It is updated whenever a write operation happens on the admin side.

const packagesJsonPath = path.resolve(process.cwd(), 'src/lib/packages.json');

async function readPackagesJson(): Promise<Package[]> {
    try {
        await fs.access(packagesJsonPath);
        const fileContent = await fs.readFile(packagesJsonPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist, is empty, or has invalid JSON, return empty array.
        return [];
    }
}

// --- Public Data Access (Reads from JSON Cache for performance and to avoid permission issues) ---

export async function getAllPackages(): Promise<Package[]> {
  return await readPackagesJson();
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  if (!id) return undefined;
  const packages = await readPackagesJson();
  const upperCaseId = id.toUpperCase();
  // Ensure we find the package regardless of its creation-time casing
  return packages.find(pkg => pkg.id.toUpperCase() === upperCaseId);
}

