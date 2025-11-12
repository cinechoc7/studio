'use client';

import { getPackageById } from "@/lib/data";
import { PackageStatusTimeline } from "@/components/package-status-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Package as PackageIcon, MapPin, Calendar, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import type { Package } from "@/lib/types";

type TrackingPageProps = {
  params: { id: string };
};

export default function TrackingPage({ params }: TrackingPageProps) {
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);

  useEffect(() => {
    async function fetchPackage() {
        const packageData = await getPackageById(params.id);
        setPkg(packageData);
    }
    fetchPackage();
  }, [params.id]);


  if (pkg === undefined) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
    )
  }


  if (!pkg) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Aucun colis trouvé avec le code de suivi "{params.id}". Veuillez vérifier le code et réessayer.
              </AlertDescription>
            </Alert>
            <Button asChild variant="link" className="mt-4 text-primary">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Retour à l'accueil</Link>
            </Button>
        </div>
      </main>
    );
  }

  const isDelivered = pkg.currentStatus === 'Livré';

  return (
    <main className="min-h-screen w-full bg-background py-8 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-8 flex justify-start">
                <Button asChild variant="outline" className="bg-card">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Nouvelle recherche</Link>
                </Button>
            </div>
            
            <Card className="shadow-2xl overflow-hidden">
                <CardHeader className="bg-card">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-primary font-headline">
                        Suivi du Colis <span className="text-accent">#{pkg.id}</span>
                    </CardTitle>
                    <CardDescription>
                        Pour {pkg.recipient.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className={`p-6 ${isDelivered ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                        <h3 className="font-semibold text-lg flex items-center">
                            {isDelivered ? <CheckCircle className="mr-2 h-6 w-6 text-green-600"/> : <PackageIcon className="mr-2 h-6 w-6 text-primary"/>}
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
                                <p className="text-muted-foreground">{new Date(pkg.statusHistory[0].timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric'})}</p>
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
