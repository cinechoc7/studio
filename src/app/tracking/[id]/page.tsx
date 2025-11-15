'use client';

import { PackageStatusTimeline } from "@/components/package-status-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Package as PackageIcon, MapPin, Calendar, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import type { Package } from "@/lib/types";
import { getPackageById } from "@/lib/data";


type TrackingPageProps = {
  params: { id: string };
};


export default function TrackingPage({ params }: TrackingPageProps) {
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const packageId = params.id.toUpperCase();

  useEffect(() => {
    const fetchPackage = async () => {
        const foundPackage = await getPackageById(packageId);
        setPkg(foundPackage || null);
    };
    fetchPackage();
  }, [packageId]);


  if (pkg === undefined) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
    )
  }


  if (!pkg) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-lg text-center">
            <Alert variant="destructive" className="text-left shadow-lg">
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
    ? new Date(pkg.statusHistory[0].timestamp as Date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric'})
    : 'N/A';

  return (
    <main className="min-h-screen w-full bg-secondary/60 py-12 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-8 flex justify-start">
                <Button asChild variant="outline" className="bg-white shadow-md">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Nouvelle recherche</Link>
                </Button>
            </div>
            
            <Card className="shadow-2xl overflow-hidden border-t-4 border-accent">
                <CardHeader className="bg-card p-6">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
                        Suivi du Colis <span className="text-accent font-mono">#{pkg.id}</span>
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Livraison pour <span className="font-semibold text-foreground">{pkg.recipient.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className={`p-6 ${isDelivered ? 'bg-green-100/10' : 'bg-blue-500/10'}`}>
                        <h3 className="font-bold text-lg flex items-center">
                            {isDelivered ? <CheckCircle className="mr-3 h-8 w-8 text-green-500"/> : <PackageIcon className="mr-3 h-8 w-8 text-primary"/>}
                            <span className="flex flex-col">
                                Statut Actuel:
                                <span className={`text-2xl font-extrabold ${isDelivered ? 'text-green-500' : 'text-primary'}`}>{pkg.currentStatus}</span>
                            </span>
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
                        <h3 className="font-bold text-xl mb-6 text-primary">Historique du colis</h3>
                        <PackageStatusTimeline history={pkg.statusHistory} />
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
