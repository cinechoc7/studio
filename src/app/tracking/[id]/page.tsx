'use client';

import { useFirestore } from "@/firebase";
import { PackageStatusTimeline } from "@/components/package-status-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Package as PackageIcon, MapPin, Calendar, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, use } from "react";
import type { Package } from "@/lib/types";
import { doc, onSnapshot } from 'firebase/firestore';

type TrackingPageProps = {
  params: { id: string };
};

function convertTimestamps(data: any): any {
    if (data && typeof data.toDate === 'function') { // Firebase Timestamp
        return data.toDate();
    }
    if (Array.isArray(data)) {
        return data.map(convertTimestamps);
    }
    if (data !== null && typeof data === 'object') {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = convertTimestamps(data[key]);
            return acc;
        }, {} as any);
    }
    return data;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const { id } = use(params);
  const packageId = id.toUpperCase();
  const firestore = useFirestore();

  useEffect(() => {
    if (!packageId || !firestore) return;

    const docRef = doc(firestore, 'packages', packageId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const convertedData = convertTimestamps(data);
        setPkg({ id: docSnap.id, ...convertedData } as Package);
      } else {
        setPkg(null);
      }
      }, (error) => {
        console.error("Error fetching package in real-time:", error);
        setPkg(null);
    });

    return () => unsubscribe();
  }, [packageId, firestore]);


  if (pkg === undefined) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-50">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
    )
  }


  if (!pkg) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-lg text-center">
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de Suivi</AlertTitle>
              <AlertDescription>
                Aucun colis trouvé avec le code de suivi "{packageId}". Veuillez vérifier le code et réessayer.
              </AlertDescription>
            </Alert>
            <Button asChild variant="link" className="mt-6 text-primary">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Retour à l'accueil</Link>
            </Button>
        </div>
      </main>
    );
  }

  const isDelivered = pkg.currentStatus === 'Livré';
  const lastUpdate = pkg.statusHistory && pkg.statusHistory.length > 0
    ? new Date(pkg.statusHistory[0].timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric'})
    : 'N/A';

  return (
    <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 py-12 sm:py-24">
        <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-8 flex justify-start">
                <Button asChild variant="outline" className="bg-card">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Nouvelle recherche</Link>
                </Button>
            </div>
            
            <Card className="shadow-lg overflow-hidden border-t-4 border-primary">
                <CardHeader className="bg-card p-6">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">
                        Suivi du Colis <span className="text-primary font-mono">#{pkg.id}</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                        Livraison pour <span className="font-semibold">{pkg.recipient.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className={`p-6 ${isDelivered ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        <h3 className="font-semibold text-lg flex items-center">
                            {isDelivered ? <CheckCircle className="mr-3 h-7 w-7 text-green-600"/> : <PackageIcon className="mr-3 h-7 w-7 text-primary"/>}
                            Statut Actuel: <span className={`ml-2 font-bold ${isDelivered ? 'text-green-700' : 'text-primary'}`}>{pkg.currentStatus}</span>
                        </h3>
                    </div>

                    <Separator />

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Origine</p>
                                <p className="text-muted-foreground">{pkg.origin}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Destination</p>
                                <p className="text-muted-foreground">{pkg.destination}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Dernière mise à jour</p>
                                <p className="text-muted-foreground">{lastUpdate}</p>
                            </div>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="p-6">
                        <h3 className="font-bold text-xl mb-6 text-foreground">Historique du colis</h3>
                        <PackageStatusTimeline history={pkg.statusHistory} />
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
