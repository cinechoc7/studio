'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deletePackage as dbDeletePackage } from "./data";
import type { PackageStatus } from "./types";
import { optimizeDeliveryRoute } from "@/ai/flows/optimize-delivery-route";
import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- START: Firebase Admin SDK Initialization ---
function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    
    // Check if the service account is available in the environment variables
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your .env.local file.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return initializeApp({
            credential: credential.cert(serviceAccount)
        });
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
    }
}

const adminApp = initializeFirebaseAdmin();
const adminAuth = getAdminAuth(adminApp);
const firestore = getAdminFirestore(adminApp);
// --- END: Firebase Admin SDK Initialization ---


const updateStatusSchema = z.object({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(prevState: any, formData: FormData) {
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

    const docRef = firestore.collection('packages').doc(packageId);

    // Use a transaction to read and write for consistency
    await firestore.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists) {
        throw new Error("Package not found.");
      }

      const newStatusHistoryEntry = {
        status: status,
        location: location,
        timestamp: FieldValue.serverTimestamp(),
      };

      // Prepend the new status to the existing history array
      transaction.update(docRef, {
        currentStatus: status,
        statusHistory: FieldValue.arrayUnion(newStatusHistoryEntry)
      });
    });
    
    // After updating, prepend the new status to the history
    const docSnap = await docRef.get();
    const pkgData = docSnap.data();
    if(pkgData) {
        const history = pkgData.statusHistory || [];
        history.sort((a: any, b: any) => b.timestamp.toMillis() - a.timestamp.toMillis());
        await docRef.update({ statusHistory: history });
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);

    return { message: `Statut du colis mis à jour en "${status}".`, success: true };
  } catch (error: any) {
    console.error("Error in updatePackageStatusAction:", error);
    return { message: error.message || "Une erreur inattendue est survenue.", success: false };
  }
}

const createPackageSchema = z.object({
  adminId: z.string(),
  senderName: z.string().optional(),
  senderAddress: z.string().optional(),
  senderEmail: z.string().optional(),
  senderPhone: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  recipientEmail: z.string().optional(),
  recipientPhone: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
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

    try {
        const { 
            adminId,
            senderName, senderAddress, senderEmail, senderPhone,
            recipientName, recipientAddress, recipientEmail, recipientPhone,
            origin, destination
        } = validatedFields.data;

        // Generate a unique package ID
        const packageId = `CM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}FR`;

        const docRef = firestore.collection('packages').doc(packageId);

        const statusHistory = [{
            status: 'Pris en charge',
            location: origin || 'Inconnu',
            timestamp: FieldValue.serverTimestamp(),
        }];

        const newPackageData = {
            sender: { 
                name: senderName || 'Non spécifié', 
                address: senderAddress || 'Non spécifiée',
                ...(senderEmail && { email: senderEmail }),
                ...(senderPhone && { phone: senderPhone }),
            },
            recipient: { 
                name: recipientName || 'Non spécifié', 
                address: recipientAddress || 'Non spécifiée',
                ...(recipientEmail && { email: recipientEmail }),
                ...(recipientPhone && { phone: recipientPhone }),
            },
            origin: origin || 'Non spécifié',
            destination: destination || 'Non spécifié',
            adminId: adminId,
            currentStatus: 'Pris en charge' as PackageStatus,
            statusHistory: statusHistory,
            createdAt: FieldValue.serverTimestamp()
        };
        
        await docRef.set(newPackageData);
        
        revalidatePath("/admin");

        return { message: `Colis ${packageId} créé avec succès.`, success: true, errors: null };

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

    try {
        await dbDeletePackage(firestore, packageId);
        revalidatePath('/admin');
        return { message: 'Colis supprimé avec succès.', success: true };
    } catch (error: any) {
        return { message: error.message || 'La suppression du colis a échoué.', success: false };
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


const updatePackageSchema = createPackageSchema.extend({
  originalPackageId: z.string().min(1, "L'ID original du colis est manquant."),
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
    adminId,
    senderName, senderAddress, senderEmail, senderPhone,
    recipientName, recipientAddress, recipientEmail, recipientPhone,
    origin, destination
  } = validatedFields.data;

  try {
    const pkgRef = firestore.collection('packages').doc(originalPackageId);
    
     const updatedFields: Record<string, any> = {
        'sender.name': senderName || 'Non spécifié',
        'sender.address': senderAddress || 'Non spécifiée',
        'recipient.name': recipientName || 'Non spécifié',
        'recipient.address': recipientAddress || 'Non spécifiée',
        origin: origin || 'Non spécifié',
        destination: destination || 'Non spécifié',
        adminId,
    };

    // Conditionally add email and phone fields to avoid saving undefined
    if (senderEmail) updatedFields['sender.email'] = senderEmail;
    else updatedFields['sender.email'] = FieldValue.delete();
    
    if (senderPhone) updatedFields['sender.phone'] = senderPhone;
    else updatedFields['sender.phone'] = FieldValue.delete();
    
    if (recipientEmail) updatedFields['recipient.email'] = recipientEmail;
    else updatedFields['recipient.email'] = FieldValue.delete();
    
    if (recipientPhone) updatedFields['recipient.phone'] = recipientPhone;
    else updatedFields['recipient.phone'] = FieldValue.delete();

    await pkgRef.update(updatedFields);
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${originalPackageId}`);

    return { message: `Colis ${originalPackageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    console.error("Error in updatePackageAction:", error);
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
