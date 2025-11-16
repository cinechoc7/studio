'use client';

import { useState, useEffect } from 'react';
import type { Package } from './types';
import { getPackagesAction, getPackageByIdAction } from './actions';

export function usePackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            setIsLoading(true);
            const pkgs = await getPackagesAction();
            setPackages(pkgs);
            setIsLoading(false);
        };
        
        fetchPackages();
    }, []);

    // This hook will now update automatically thanks to revalidatePath
    // in the server actions, which triggers a refetch.
    return { packages, isLoading, setPackages };
}

export async function getPackageById(id: string): Promise<Package | undefined> {
    return getPackageByIdAction(id);
}
