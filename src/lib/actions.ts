"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePackageStatus as dbUpdatePackageStatus } from "./data";
import type { PackageStatus } from "./types";
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
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    const { packageId, status, location } = validatedFields.data;

    const updatedPackage = await dbUpdatePackageStatus(packageId, status as PackageStatus, location);

    if (!updatedPackage) {
      return { message: "Package not found.", success: false };
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);

    return { message: `Package status updated to "${status}".`, success: true };
  } catch (error) {
    return { message: "An unexpected error occurred.", success: false };
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
