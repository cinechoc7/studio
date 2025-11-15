'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PackageStatus } from "./types";
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from "./firebase-admin";

const updateStatusSchema = z.object({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(prevState: any, formData: FormData) {
  const adminApp = initializeFirebaseAdmin();
  const firestore = getAdminFirestore(adminApp);
  
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

      transaction.update(docRef, {
        currentStatus: status,
        statusHistory: FieldValue.arrayUnion(newStatusHistoryEntry)
      });
    });
    
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
    const adminApp = initializeFirebaseAdmin();
    const firestore = getAdminFirestore(adminApp);

    const validatedFields = createPackageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Données du formulaire invalides.',
            success: false,
        };
    }

    try {
        const data = validatedFields.data;
        const packageId = `CM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}FR`;
        
        const newPackageData: { [key: string]: any } = {
            adminId: data.adminId,
            currentStatus: 'Pris en charge' as PackageStatus,
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [
              {
                status: 'Pris en charge' as PackageStatus,
                location: data.origin || 'Inconnu',
                timestamp: FieldValue.serverTimestamp(),
              }
            ],
            sender: {},
            recipient: {},
        };

        if (data.senderName) newPackageData.sender.name = data.senderName;
        if (data.senderAddress) newPackageData.sender.address = data.senderAddress;
        if (data.senderEmail) newPackageData.sender.email = data.senderEmail;
        if (data.senderPhone) newPackageData.sender.phone = data.senderPhone;
        
        if (data.recipientName) newPackageData.recipient.name = data.recipientName;
        if (data.recipientAddress) newPackageData.recipient.address = data.recipientAddress;
        if (data.recipientEmail) newPackageData.recipient.email = data.recipientEmail;
        if (data.recipientPhone) newPackageData.recipient.phone = data.recipientPhone;

        if (data.origin) newPackageData.origin = data.origin;
        if (data.destination) newPackageData.destination = data.destination;

        await firestore.collection('packages').doc(packageId).set(newPackageData);
        
        revalidatePath("/admin");

        return { message: `Colis ${packageId} créé avec succès.`, success: true };

    } catch (e: any) {
        console.error("Server Action Error:", e);
        return {
            message: 'une erreur est survenue lors de la creation du colis',
            success: false,
        }
    }
}


const deletePackageSchema = z.object({
    packageId: z.string().min(1, "Package ID is missing."),
});

export async function deletePackageAction(prevState: any, formData: FormData) {
    const adminApp = initializeFirebaseAdmin();
    const firestore = getAdminFirestore(adminApp);
    
    const validatedAuth = deletePackageSchema.safeParse({ 
        packageId: formData.get('packageId'),
    });

    if (!validatedAuth.success) {
        return { message: 'Requête invalide.', success: false };
    }

    const { packageId } = validatedAuth.data;

    try {
        await firestore.collection("packages").doc(packageId).delete();
        revalidatePath('/admin');
        return { message: 'Colis supprimé avec succès.', success: true };
    } catch (error: any) {
        return { message: error.message || 'La suppression du colis a échoué.', success: false };
    }
}


const updatePackageSchema = z.object({
  originalPackageId: z.string().min(1, "L'ID original du colis est manquant."),
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


export async function updatePackageAction(prevState: any, formData: FormData) {
  const adminApp = initializeFirebaseAdmin();
  const firestore = getAdminFirestore(adminApp);
  
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

    // Use dot notation for updating nested fields.
    // Use FieldValue.delete() to remove fields if they are empty.
    updatedFields['sender.email'] = senderEmail ? senderEmail : FieldValue.delete();
    updatedFields['sender.phone'] = senderPhone ? senderPhone : FieldValue.delete();
    updatedFields['recipient.email'] = recipientEmail ? recipientEmail : FieldValue.delete();
    updatedFields['recipient.phone'] = recipientPhone ? recipientPhone : FieldValue.delete();

    await pkgRef.update(updatedFields);
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${originalPackageId}`);

    return { message: `Colis ${originalPackageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    console.error("Error in updatePackageAction:", error);
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
