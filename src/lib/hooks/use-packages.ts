
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Package } from '@/lib/types';
import { Timestamp } from "firebase/firestore";

function convertFirestoreTimestamp(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(convertFirestoreTimestamp);
    }
    if (data && typeof data === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[key] = convertFirestoreTimestamp(data[key]);
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

    useEffect(() => {
        if (!firestore) return;

        setIsLoading(true);
        const packagesCollection = collection(firestore, 'packages');
        const q = query(packagesCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const pkgs = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return convertFirestoreTimestamp(data) as Package;
            });
            setPackages(pkgs);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching packages:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    return { packages, isLoading, setPackages };
}
