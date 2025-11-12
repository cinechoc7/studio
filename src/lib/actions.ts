'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePackageStatus as dbUpdatePackageStatus, createPackage as dbCreatePackage, deletePackage as dbDeletePackage } from "./data";
import type { PackageStatus, ContactInfo } from "./types";
import { optimizeDeliveryRoute } from "@/ai/flows/optimize-delivery-route";

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
    email: z.string().email("L'email est invalide."),
    phone: z.string().min(10, "Le téléphone est requis."),
});

const createPackageSchema = z.object({
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
    try {
        const validatedFields = createPackageSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
            return {
                message: 'Données du formulaire invalides.',
                errors: validatedFields.error.flatten().fieldErrors,
                success: false,
            };
        }

        const { 
            senderName, senderAddress, senderEmail, senderPhone,
            recipientName, recipientAddress, recipientEmail, recipientPhone,
            origin, destination
        } = validatedFields.data;

        const newPackageData = {
            sender: { name: senderName, address: senderAddress, email: senderEmail, phone: senderPhone },
            recipient: { name: recipientName, address: recipientAddress, email: recipientEmail, phone: recipientPhone },
            origin,
            destination,
        };

        const newPackage = await dbCreatePackage(newPackageData);

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

const deletePackageSchema = z.object({
    packageId: z.string(),
});

export async function deletePackageAction(formData: FormData) {
    try {
        const validatedFields = deletePackageSchema.safeParse({
            packageId: formData.get('packageId'),
        });

        if (!validatedFields.success) {
            // This case should ideally not happen with form actions, but it's good practice.
            console.error('Invalid form data for deletion:', validatedFields.error);
            return;
        }

        const { packageId } = validatedFields.data;

        await dbDeletePackage(packageId);

        revalidatePath("/admin");

    } catch (e) {
        console.error('Server error during package deletion:', e);
        // In a real app, you might want to return an error state to the UI
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