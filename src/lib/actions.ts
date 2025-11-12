'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePackageStatus as dbUpdatePackageStatus, createPackage as dbCreatePackage, deletePackage as dbDeletePackage } from "./data";
import type { PackageStatus } from "./types";
import { optimizeDeliveryRoute } from "@/ai/flows/optimize-delivery-route";
import { auth } from "firebase-admin";
import { getAuth } from "firebase/auth";
import { headers } from "next/headers";
import { FirebaseError } from "firebase/app";
import { firebaseConfig } from "@/firebase/config";
import { initializeApp, getApps } from 'firebase/app';
import { DecodedIdToken } from "firebase-admin/auth";

// Helper to get admin SDK
async function getAdminAuth() {
  const { cert } = await import('firebase-admin/app');
  const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
  const admin = await import('firebase-admin');

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT for admin operations.');
  }

  // Initialize app if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  }
  return getAdminAuth();
}


// Helper to get current user on server
async function getCurrentUser(idToken: string): Promise<DecodedIdToken | null> {
  if (idToken) {
    try {
        const adminAuth = await getAdminAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
  }
  return null;
}

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

    await dbUpdatePackageStatus(packageId, status as PackageStatus, location);

    revalidatePath("/admin");
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);

    return { message: `Statut du colis mis à jour en "${status}".`, success: true };
  } catch (error) {
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
  idToken: z.string().min(1, "Authentication token is missing."),
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

    const { idToken, ...packageData } = validatedFields.data;

    const user = await getCurrentUser(idToken);

    if (!user) {
        return {
            message: 'Utilisateur non authentifié.',
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

        const newPackage = await dbCreatePackage(newPackageData, user.uid);
        
        revalidatePath("/admin");

        return { message: `Colis ${newPackage.id} créé avec succès.`, success: true, errors: null };

    } catch (e) {
        console.error(e);
        return {
            message: 'Une erreur serveur est survenue lors de la création du colis.',
            success: false,
            errors: null
        }
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
