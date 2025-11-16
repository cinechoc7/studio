'use client';

import { useState, useEffect } from 'react';
import type { Package } from '@/lib/types';
import { getPackagesAction } from '@/lib/actions';

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

    // The component using this hook will re-render when `setPackages` is called.
    // Revalidation from server actions will trigger data refetch in components that need it.
    return { packages, isLoading, setPackages };
}
