'use server';

import { revalidatePath } from 'next/cache';

// Note: Most write operations have been moved to client components to ensure
// they run with user authentication context, resolving permission issues.
// Server actions are now primarily used for revalidation where necessary.

/**
 * Revalidates the cache for paths related to packages.
 * This can be called from client components after a successful Firestore write.
 * @param packageId The ID of the package that was changed.
 */
export async function revalidatePackagePaths(packageId: string) {
  if (packageId) {
    revalidatePath('/admin');
    revalidatePath(`/admin/package/${packageId}`);
    revalidatePath(`/tracking/${packageId}`);
  } else {
    revalidatePath('/admin');
  }
}
