'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PackageStatus } from "./types";
import { getFirestore, doc, runTransaction, FieldValue, getDoc, arrayUnion, serverTimestamp, collection, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";


const updateStatusSchema = z.object({
  packageId: z.string(),
  status: z.string(),
  location: z.string().min(1, "Location is required"),
});

export async function updatePackageStatusAction(prevState: any, formData: FormData) {
  const { firestore } = initializeFirebase();
  
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

    const docRef = doc(firestore, 'packages', packageId);

    await runTransaction(firestore, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) {
        throw new Error("Package not found.");
      }

      const newStatusHistoryEntry = {
        status: status,
        location: location,
        timestamp: new Date(), // Use client-side date for simplicity here, will be converted by serverTimestamp
      };

      transaction.update(docRef, {
        currentStatus: status,
        statusHistory: arrayUnion(newStatusHistoryEntry)
      });
    });
    
    // Sort the history array after update
    const docSnap = await getDoc(docRef);
    const pkgData = docSnap.data();
    if(pkgData) {
        const history = (pkgData.statusHistory || []).map((h: any) => ({...h, timestamp: h.timestamp.toDate ? h.timestamp.toDate() : h.timestamp}));
        history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        await updateDoc(docRef, { 
            statusHistory: history.map(h => ({...h, timestamp: serverTimestamp()}))
        });
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
  adminId: z.string().min(1, "Admin ID is required."),
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
    const { firestore } = initializeFirebase();

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
        
        const newPackageData: { [key: string]: any } = {
            id: packageId,
            adminId: data.adminId,
            currentStatus: 'Pris en charge' as PackageStatus,
            createdAt: serverTimestamp(),
            statusHistory: [
              {
                status: 'Pris en charge' as PackageStatus,
                location: data.origin || 'Inconnu',
                timestamp: serverTimestamp(),
              }
            ],
            sender: {
                name: data.senderName || 'Non spécifié',
                address: data.senderAddress || 'Non spécifiée',
            },
            recipient: {
                name: data.recipientName || 'Non spécifié',
                address: data.recipientAddress || 'Non spécifiée',
            },
            origin: data.origin || 'Non spécifié',
            destination: data.destination || 'Non spécifié',
        };

        if (data.senderEmail) newPackageData.sender.email = data.senderEmail;
        if (data.senderPhone) newPackageData.sender.phone = data.senderPhone;
        if (data.recipientEmail) newPackageData.recipient.email = data.recipientEmail;
        if (data.recipientPhone) newPackageData.recipient.phone = data.recipientPhone;

        await setDoc(doc(firestore, 'packages', packageId), newPackageData);
        
        revalidatePath("/admin");

        return { message: `Colis ${packageId} créé avec succès.`, success: true };

    } catch (e: any) {
        console.error("Server Action Error:", e);
        return {
            message: e.message || 'une erreur est survenue lors de la creation du colis',
            success: false,
        }
    }
}


const deletePackageSchema = z.object({
    packageId: z.string().min(1, "Package ID is missing."),
});

export async function deletePackageAction(prevState: any, formData: FormData) {
    const { firestore } = initializeFirebase();
    
    const validatedAuth = deletePackageSchema.safeParse({ 
        packageId: formData.get('packageId'),
    });

    if (!validatedAuth.success) {
        return { message: 'Requête invalide.', success: false };
    }

    const { packageId } = validatedAuth.data;

    try {
        await deleteDoc(doc(firestore, "packages", packageId));
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
  const { firestore } = initializeFirebase();
  
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
    const pkgRef = doc(firestore, 'packages', originalPackageId);
    
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
    // Use a special value to remove fields if they are empty, but since we are not using admin SDK anymore, we just update with empty string or not include them
    updatedFields['sender.email'] = senderEmail || "";
    updatedFields['sender.phone'] = senderPhone || "";
    updatedFields['recipient.email'] = recipientEmail || "";
    updatedFields['recipient.phone'] = recipientPhone || "";

    await updateDoc(pkgRef, updatedFields);
    
    revalidatePath("/admin");
    revalidatePath(`/admin/package/${originalPackageId}`);

    return { message: `Colis ${originalPackageId} mis à jour avec succès.`, success: true, errors: null };
  } catch (error: any) {
    console.error("Error in updatePackageAction:", error);
    return { message: error.message || 'Une erreur est survenue lors de la mise à jour.', success: false, errors: null };
  }
}
