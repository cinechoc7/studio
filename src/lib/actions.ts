'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePackageStatus as dbUpdatePackageStatus, createPackage as dbCreatePackage, deletePackage as dbDeletePackage } from "./data";
import type { PackageStatus } from "./types";
import { optimizeDeliveryRoute } from "@/ai/flows/optimize-delivery-route";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// --- START: Firebase Admin SDK Initialization ---
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    initializeApp({
        credential: cert(serviceAccount)
    });
}
const adminAuth = getAdminAuth();
const firestore = getAdminFirestore();
// --- END: Firebase Admin SDK Initialization ---


const updateStatusSchema = z.object({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(prevState: any, formData: FormData) {
    // This action requires authentication. For simplicity in this context,
    // we're assuming the user is authenticated. In a real app, you'd
    // get the user's session here.
  try {
    const validatedFields = updateStatusSchema.safeParse({
      packageId: formData.get('packageId'),
      status: formData.get('status'),
      location: formData.get('location'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Données du formulaire invalides.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    const { packageId, status, location } = validatedFields.data;
    // In a real app, you would get the adminId from the session.
    // For now, we allow any authenticated user to update. This should be secured.
    const adminId = "SERVER_USER"; // Placeholder
    await dbUpdatePackageStatus(firestore, packageId, status as PackageStatus, location, adminId);

    revalidatePath("/admin");
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);

    return { message: `Statut du colis mis à jour en "${status}".`, success: true };
  } catch (error: any) {
    if (error.message.includes('permission-denied')) {
        return { message: "Permission refusée. Vous n'êtes pas autorisé à modifier ce colis.", success: false };
    }
    return { message: "Une erreur inattendue est survenue.", success: false };
  }
}

const contactSchema = z.object({
    name: z.string().min(2, "Le nom est requis."),
    address: z.string().min(5, "L'adresse est requise."),
    email: z.string().email("L'email est invalide.").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
});

const createPackageSchema = z.object({
  adminId: z.string().min(1, "L'ID administrateur est manquant."),
  senderName: contactSchema.shape.name,
  senderAddress: contactSchema.shape.address,
  senderEmail: contactSchema.shape.email,
  senderPhone: contactSchema.shape.phone,
  recipientName: contactSchema.shape.name,
  recipientAddress: contactSchema.shape.address,
  recipientEmail: contactSchema.shape.email,
  recipientPhone: contactSchema.shape.phone,
  origin: z.string().min(2, "L'origine est requise."),
  destination: z.string().min(2, "La destination est requise."),
});

export async function createPackageAction(prevState: any, formData: FormData) {
    const validatedFields = createPackageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Données du formulaire invalides.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { adminId, ...packageData } = validatedFields.data;
    
    if (!adminId) {
        return { message: 'Utilisateur non authentifié ou invalide.', success: false, errors: null }
    }
    
    try {
        const { 
            senderName, senderAddress, senderEmail, senderPhone,
            recipientName, recipientAddress, recipientEmail, recipientPhone,
            origin, destination
        } = packageData;

        const newPackageData = {
            sender: { name: senderName, address: senderAddress, email: senderEmail || undefined, phone: senderPhone || undefined },
            recipient: { name: recipientName, address: recipientAddress, email: recipientEmail || undefined, phone: recipientPhone || undefined },
            origin,
            destination,
        };
        
        const newPackage = await dbCreatePackage(firestore, newPackageData, adminId);
        
        revalidatePath("/admin");

        return { message: `Colis ${newPackage.id} créé avec succès.`, success: true, errors: null };

    } catch (e: any) {
        console.error("Server Action Error:", e);
        return {
            message: 'Une erreur est survenue lors de la création du colis.',
            success: false,
            errors: null
        }
    }
}


const deletePackageSchema = z.object({
    packageId: z.string().min(1, "Package ID is missing."),
});

export async function deletePackageAction(prevState: any, formData: FormData) {
    const validatedAuth = deletePackageSchema.safeParse({ 
        packageId: formData.get('packageId'),
    });

    if (!validatedAuth.success) {
        return { message: 'Requête invalide.', success: false };
    }

    const { packageId } = validatedAuth.data;

    // In a real app, you would get the adminId from the session
    const adminId = "SERVER_USER"; // Placeholder

    try {
        await dbDeletePackage(firestore, packageId, adminId);
        revalidatePath('/admin');
        return { message: 'Colis supprimé avec succès.', success: true };
    } catch (error: any) {
        if (error.message.includes('permission-denied')) {
            return { message: "Permission refusée. Vous n'êtes pas autorisé à supprimer ce colis.", success: false };
        }
        console.error("Error deleting package:", error);
        return { message: 'La suppression du colis a échoué.', success: false };
    }
}


const optimizeRouteSchema = z.object({
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    waypoints: z.string(),
    currentTrafficConditions: z.string().min(1, 'Traffic conditions are required'),
    currentweatherConditions: z.string().min(1, 'Weather conditions are required'),
});

export async function getOptimizedRouteAction(prevState: any, formData: FormData) {
    try {
        const validatedFields = optimizeRouteSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
            return {
                message: 'Invalid form data.',
                errors: validatedFields.error.flatten().fieldErrors,
                data: null,
            };
        }

        const result = await optimizeDeliveryRoute(validatedFields.data);

        return {
            message: 'Route optimized successfully.',
            errors: null,
            data: result,
        };

    } catch (e) {
        return {
            message: 'An AI error occurred. Please try again.',
            errors: null,
            data: null,
        }
    }
}
