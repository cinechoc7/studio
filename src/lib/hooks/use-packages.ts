
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Package } from '@/lib/types';

// This function safely converts Firestore Timestamps to ISO strings
function convertTimestampsToISO(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(item => convertTimestampsToISO(item));
    }
    if (data && typeof data === 'object' && !data.toDate) { // Check it's a plain object
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[key] = convertTimestampsToISO(data[key]);
            }
        }
        return newObj;
    }
    return data;
}


export function usePackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    useEffect(() => {
        // Don't run the query if firestore is not available or user is still loading
        if (!firestore || isUserLoading) {
            // If we're not loading a user, but the user is null, they are logged out.
            // Clear packages and stop loading.
            if (!isUserLoading && !user) {
                setPackages([]);
                setIsLoading(false);
            }
            return;
        }
        
        // If there's no logged-in user, do not attempt to fetch packages.
        if (!user) {
            setPackages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const packagesCollection = collection(firestore, 'packages');
        // This query can be expanded to filter by user.uid if needed:
        // const q = query(packagesCollection, where('adminId', '==', user.uid), orderBy('createdAt', 'desc'));
        const q = query(packagesCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const pkgs = querySnapshot.docs.map(doc => {
                const data = doc.data();
                // We use id from the doc, and spread the rest of the data
                const pkgWithId = { ...data, id: doc.id };
                // Ensure all timestamps are converted to strings for consistency
                return convertTimestampsToISO(pkgWithId) as Package;
            });
            setPackages(pkgs);
            setIsLoading(false);
        }, (error) => {
            // This will catch permission errors if the rules are not set correctly
            console.error("Error fetching packages in real-time:", error);
            setIsLoading(false);
        });

        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();

    }, [firestore, user, isUserLoading]); // Rerun effect if firestore, user, or loading state changes

    return { packages, isLoading, setPackages };
}
