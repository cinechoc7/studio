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

const contactSchema = z.object({
    name: z.string().min(2, "Le nom est requis."),
    address: z.string().min(5, "L'adresse est requise."),
    email: z.string().email("L'email est invalide.").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
});

const createPackageSchema = z.object({
  packageId: z.string().min(3, "Le code de suivi est requis et doit contenir au moins 3 caractères.").regex(/^[a-zA-Z0-9-]+$/, "Le code de suivi ne peut contenir que des lettres, des chiffres et des tirets."),
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

    try {
        const { 
            packageId,
            adminId,
            senderName, senderAddress, senderEmail, senderPhone,
            recipientName, recipientAddress, recipientEmail, recipientPhone,
            origin, destination
        } = validatedFields.data;

        const docRef = firestore.collection('packages').doc(packageId);

        const docSnap = await docRef.get();
        if (docSnap.exists) {
            throw new Error(`Le colis avec le code "${packageId}" existe déjà.`);
        }

        const statusHistory = [{
            status: 'Pris en charge',
            location: origin,
            timestamp: FieldValue.serverTimestamp(),
        }];

        const newPackageData = {
            sender: { name: senderName, address: senderAddress, email: senderEmail || undefined, phone: senderPhone || undefined },
            recipient: { name: recipientName, address: recipientAddress, email: recipientEmail || undefined, phone: recipientPhone || undefined },
            origin,
            destination,
            adminId: adminId,
            currentStatus: 'Pris en charge' as PackageStatus,
            statusHistory: statusHistory,
            createdAt: FieldValue.serverTimestamp()
        };
        
        await docRef.set(newPackageData);
        
        revalidatePath("/admin");
        revalidatePath(`/tracking/${packageId}`);

        return { message: `Colis ${packageId} créé avec succès.`, success: true, errors: null };

    } catch (e: any) {
        console.error("Server Action Error:", e);
        if (e.message.includes('existe déjà')) {
             return {
                message: e.message,
                success: false,
                errors: { packageId: [`Ce code de colis existe déjà.`] }
            }
        }
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
    packageId,
    adminId,
    senderName, senderAddress, senderEmail, senderPhone,
    recipientName, recipientAddress, recipientEmail, recipientPhone,
    origin, destination
  } = validatedFields.data;

  try {
    const pkgRef = firestore.collection('packages').doc(originalPackageId);

    // If the ID is being changed, we need to move the document.
    // Firestore doesn't have a 'move' operation, so we do a get/set/delete.
    if (originalPackageId !== packageId) {
      const newPkgRef = firestore.collection('packages').doc(packageId);

      // Check if the new ID already exists to prevent overwriting
      const newDocSnap = await newPkgRef.get();
      if (newDocSnap.exists) {
        throw new Error(`Le code de colis "${packageId}" existe déjà.`);
      }

      const originalDoc = await pkgRef.get();
      if (!originalDoc.exists) {
        throw new Error("Le colis original n'a pas été trouvé.");
      }
      const originalData = originalDoc.data()!;

      const updatedData = {
        ...originalData,
        sender: { name: senderName, address: senderAddress, email: senderEmail || undefined, phone: senderPhone || undefined },
        recipient: { name: recipientName, address: recipientAddress, email: recipientEmail || undefined, phone: recipientPhone || undefined },
        origin,
        destination,
        adminId,
      };

      // Perform the move in a batch write for atomicity
      const batch = firestore.batch();
      batch.set(newPkgRef, updatedData);
      batch.delete(pkgRef);
      await batch.commit();

    } else {
      // If the ID is the same, just update the document
      const updatedFields = {
        sender: { name: senderName, address: senderAddress, email: senderEmail || undefined, phone: senderPhone || undefined },
        recipient: { name: recipientName, address: recipientAddress, email: recipientEmail || undefined, phone: recipientPhone || undefined },
        origin,
        destination,
        adminId,
      };
      await pkgRef.update(updatedFields);
    }
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${originalPackageId}`);
    if (originalPackageId !== packageId) {
      revalidatePath(`/admin/package/${packageId}`);
    }

    return { message: `Colis ${packageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    console.error("Error in updatePackageAction:", error);
     if (error.message.includes('existe déjà')) {
        return {
            message: error.message,
            success: false,
            errors: { packageId: [error.message] }
        }
    }
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
