'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Package, PackageStatus } from "./types";

// In-memory data store moved here to be accessible by server actions
let memoryPackages: Package[] = [
    {
        id: 'CM123456789FR',
        adminId: 'dummy-admin-id',
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
        adminId: 'dummy-admin-id',
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

// --- Server-side data manipulation functions ---

async function addPackage(pkg: Package) {
    memoryPackages.unshift(pkg);
    return Promise.resolve(pkg);
}

async function deletePackage(id: string) {
    const index = memoryPackages.findIndex(p => p.id === id);
    if (index > -1) {
        memoryPackages.splice(index, 1);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

async function updatePackage(id: string, updatedData: Partial<Package>) {
    const index = memoryPackages.findIndex(p => p.id === id);
    if (index > -1) {
        const existingPackage = memoryPackages[index];
        const newPackageData = {
            ...existingPackage,
            ...updatedData,
            sender: {
                ...existingPackage.sender,
                ...(updatedData.sender || {})
            },
            recipient: {
                ...existingPackage.recipient,
                ...(updatedData.recipient || {})
            }
        };
        memoryPackages[index] = newPackageData;
        return Promise.resolve(memoryPackages[index]);
    }
    return Promise.resolve(null);
}

async function updateStatus(id: string, status: string, location: string) {
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
        return Promise.resolve(pkg);
     }
     return Promise.resolve(null);
}

async function getPackageById(id: string): Promise<Package | undefined> {
    const pkg = memoryPackages.find(p => p.id === id.toUpperCase());
    return Promise.resolve(pkg);
}

// --- Server Actions ---

export async function getPackagesAction(): Promise<Package[]> {
    return Promise.resolve(memoryPackages.sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
}

export async function getPackageByIdAction(id: string): Promise<Package | undefined> {
    return getPackageById(id);
}


const updateStatusSchema = z.object({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(formData: FormData) {
  try {
    const validatedFields = updateStatusSchema.safeParse({
      packageId: formData.get('packageId'),
      status: formData.get('status'),
      location: formData.get('location'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Données du formulaire invalides.',
        success: false,
      };
    }
    
    const { packageId, status, location } = validatedFields.data;
    await updateStatus(packageId, status, location);
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);

    return { message: `Statut du colis mis à jour en "${status}".`, success: true };
  } catch (error: any) {
    return { message: error.message || "Une erreur inattendue est survenue.", success: false };
  }
}


const createPackageSchema = z.object({
  adminId: z.string(),
  senderName: z.string().optional(),
  senderAddress: z.string().optional(),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderPhone: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  recipientPhone: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
});


export async function createPackageAction(formData: FormData) {
    const validatedFields = createPackageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.flatten());
        return {
            message: 'Données du formulaire invalides.',
            success: false,
        };
    }

    try {
        const data = validatedFields.data;
        const packageId = `CM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}FR`;
        const now = new Date();

        const newPackageData: Package = {
            id: packageId,
            adminId: "demo-user",
            currentStatus: 'Pris en charge',
            createdAt: now,
            statusHistory: [
              {
                status: 'Pris en charge',
                location: data.origin || 'Inconnu',
                timestamp: now,
              }
            ],
            sender: {
                name: data.senderName || 'Non spécifié',
                address: data.senderAddress || 'Non spécifiée',
                email: data.senderEmail || '',
                phone: data.senderPhone || ''
            },
            recipient: {
                name: data.recipientName || 'Non spécifié',
                address: data.recipientAddress || 'Non spécifiée',
                email: data.recipientEmail || '',
                phone: data.recipientPhone || ''
            },
            origin: data.origin || 'Non spécifié',
            destination: data.destination || 'Non spécifié',
        };

        await addPackage(newPackageData);
        revalidatePath("/admin");
        revalidatePath(`/admin/package/${packageId}`);
        revalidatePath(`/tracking/${packageId}`);
        return { message: `Colis ${packageId} créé avec succès.`, success: true };
    } catch (e: any) {
        return {
            message: e.message || 'une erreur est survenue lors de la creation du colis',
            success: false,
        }
    }
}


export async function deletePackageAction(packageId: string) {
    if (!packageId) {
        return { message: 'Requête invalide, ID du colis manquant.', success: false };
    }

    try {
        await deletePackage(packageId);
        revalidatePath('/admin');
        return { message: 'Colis supprimé avec succès.', success: true };
    } catch (error: any) {
        return { message: error.message || 'La suppression du colis a échoué.', success: false };
    }
}


const updatePackageSchema = z.object({
  originalPackageId: z.string().min(1, "L'ID original du colis est manquant."),
  senderName: z.string().optional(),
  senderAddress: z.string().optional(),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderPhone: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  recipientPhone: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
});


export async function updatePackageAction(prevState: any, formData: FormData) {
  const validatedFields = updatePackageSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Données du formulaire invalides.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const {
    originalPackageId,
    ...data
  } = validatedFields.data;

  try {
    const updatedFields: Partial<Package> = {
        sender: {
            name: data.senderName || 'Non spécifié',
            address: data.senderAddress || 'Non spécifiée',
            email: data.senderEmail || '',
            phone: data.senderPhone || ''
        },
        recipient: {
            name: data.recipientName || 'Non spécifié',
            address: data.recipientAddress || 'Non spécifiée',
            email: data.recipientEmail || '',
            phone: data.recipientPhone || ''
        },
        origin: data.origin || 'Non spécifié',
        destination: data.destination || 'Non spécifié',
    };

    await updatePackage(originalPackageId, updatedFields);
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${originalPackageId}`);

    return { message: `Colis ${originalPackageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
