
'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Package } from "./types";
import { 
    addPackage, 
    deletePackage, 
    updatePackage, 
    updateStatus,
    getAllPackages as getAllPackagesFromDb,
    getPackageById as getPackageByIdFromDb
} from "./data";

// --- Server Actions ---

export async function getPackagesAction(): Promise<Package[]> {
    return getAllPackagesFromDb();
}

export async function getPackageByIdAction(id: string): Promise<Package | undefined> {
    return getPackageByIdFromDb(id);
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
        // Revalidate detail pages to ensure they can be accessed immediately
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
        // It's a good practice to revalidate tracking pages too in case links are shared
        revalidatePath(`/tracking/${packageId}`);
        revalidatePath(`/admin/package/${packageId}`);

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
    revalidatePath(`/tracking/${originalPackageId}`);

    return { message: `Colis ${originalPackageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
