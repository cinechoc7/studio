'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePackageStatus as dbUpdatePackageStatus, createPackage as dbCreatePackage, deletePackage as dbDeletePackage } from "./data";
import type { PackageStatus } from "./types";
import { optimizeDeliveryRoute } from "@/ai/flows/optimize-delivery-route";
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore as getClientFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from "@/firebase/config";
import type { DecodedIdToken } from "firebase-admin/auth";


// Helper to get admin SDK for server-side auth verification
async function getAdminAuth() {
  const { cert } = await import('firebase-admin/app');
  const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
  const admin = await import('firebase-admin');

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT for admin operations. Ensure it is set in your environment variables.');
  }

  // Initialize app if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  }
  return getAdminAuth();
}

// Helper to get client SDK firestore instance
function getFirestore() {
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    return getClientFirestore(getApps()[0]);
}

// Helper to get current user on server from an ID token
async function getCurrentUser(idToken: string): Promise<DecodedIdToken | null> {
  if (!idToken) return null;
  try {
    const adminAuth = await getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if the user is an admin
    const firestore = getFirestore();
    const adminDocRef = doc(firestore, 'admins', decodedToken.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
        console.warn(`User ${decodedToken.uid} is not an admin.`);
        return null;
    }
    
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// Schema for form actions that require authentication
const authSchema = z.object({
  idToken: z.string().min(1, "Authentication token is missing."),
});

const updateStatusSchema = authSchema.extend({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(prevState: any, formData: FormData) {
    const validatedAuth = authSchema.safeParse({ idToken: formData.get('idToken') });
    if (!validatedAuth.success) {
        return { message: 'Authentification requise.', success: false };
    }

    const user = await getCurrentUser(validatedAuth.data.idToken);
    if (!user) {
        return { message: 'Session invalide ou expirée.', success: false };
    }

  try {
    const validatedFields = updateStatusSchema.safeParse({
      packageId: formData.get('packageId'),
      status: formData.get('status'),
      location: formData.get('location'),
      idToken: formData.get('idToken'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Données du formulaire invalides.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    const { packageId, status, location } = validatedFields.data;
    const firestore = getFirestore();
    await dbUpdatePackageStatus(firestore, packageId, status as PackageStatus, location, user.uid);

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

    // Basic check to ensure adminId is present.
    // The real security check happens in Firestore rules.
    if (!adminId) {
        return {
            message: 'Utilisateur non authentifié ou invalide.',
            success: false,
            errors: null
        }
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
        
        const firestore = getFirestore();
        // Pass the adminId to the database function
        const newPackage = await dbCreatePackage(firestore, newPackageData, adminId);
        
        revalidatePath("/admin");

        return { message: `Colis ${newPackage.id} créé avec succès.`, success: true, errors: null };

    } catch (e: any) {
        console.error(e);
        // Check for permission denied error from Firestore rules
        if (e.message.includes('permission-denied') || e.code === 'permission-denied') {
             return {
                message: 'Permission refusée. Assurez-vous que vous êtes un administrateur connecté.',
                success: false,
                errors: null
            }
        }
        return {
            message: 'Une erreur serveur est survenue lors de la création du colis.',
            success: false,
            errors: null
        }
    }
}


const deletePackageSchema = authSchema.extend({
    packageId: z.string().min(1, "Package ID is missing."),
});

export async function deletePackageAction(prevState: any, formData: FormData) {
    const validatedAuth = deletePackageSchema.safeParse({ 
        idToken: formData.get('idToken'),
        packageId: formData.get('packageId'),
    });

    if (!validatedAuth.success) {
        return { message: 'Requête invalide.', success: false };
    }

    const { idToken, packageId } = validatedAuth.data;

    const user = await getCurrentUser(idToken);
    if (!user) {
        return { message: 'Session invalide ou expirée.', success: false };
    }

    try {
        const firestore = getFirestore();
        await dbDeletePackage(firestore, packageId, user.uid);
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
