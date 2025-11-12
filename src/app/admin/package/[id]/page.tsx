'use client';
import { useFirestore, useMemoFirebase } from "@/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Loader2, User, Mail, Phone, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UpdateStatusForm } from "@/components/admin/update-status-form";
import { PackageStatusTimeline } from "@/components/package-status-timeline";
import { useEffect, useState, use } from "react";
import type { Package } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { doc, onSnapshot } from "firebase/firestore";
import { getPackageById } from "@/lib/data";

type AdminPackagePageProps = {
  params: { id: string };
};


export default function AdminPackagePage({ params: paramsProp }: AdminPackagePageProps) {
  const params = use(paramsProp);
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const packageId = params.id;
  const firestore = useFirestore();
  
  useEffect(() => {
    if (!packageId || !firestore) return;

    // For example packages, we can just fetch them once
    if (packageId.startsWith('CM')) {
         const fetchPackage = async () => {
            const foundPackage = await getPackageById(firestore, packageId);
            setPkg(foundPackage || null);
        };
        fetchPackage();
        return;
    }

    // For real packages, set up a real-time listener
    const packageRef = doc(firestore, 'packages', packageId);
    const unsubscribe = onSnapshot(packageRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const convertedData = {
            ...data,
            createdAt: data.createdAt?.toDate(),
            statusHistory: data.statusHistory.map((h: any) => ({
                ...h,
                timestamp: h.timestamp?.toDate()
            }))
        };
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
        <main className="flex flex-1 flex-col items-center justify-center p-4 lg:p-6">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
    )
  }

  if (!pkg) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Aucun colis trouvé avec le code de suivi "{packageId}".
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4"/> Retour au dashboard</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Colis <span className="font-mono text-primary">#{pkg.id}</span>
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mettre à jour le statut</CardTitle>
                    <CardDescription>
                        Sélectionnez un nouveau statut et l'emplacement actuel du colis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateStatusForm packageId={pkg.id} currentStatus={pkg.currentStatus} />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Expéditeur</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{pkg.sender.name}</p>
                                <p className="text-muted-foreground">{pkg.sender.address}</p>
                            </div>
                        </div>
                         {pkg.sender.email && <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${pkg.sender.email}`} className="text-primary hover:underline">{pkg.sender.email}</a>
                        </div>}
                         {pkg.sender.phone && <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{pkg.sender.phone}</span>
                        </div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Destinataire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                         <div className="flex items-start gap-3">
                            <User className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{pkg.recipient.name}</p>
                                <p className="text-muted-foreground">{pkg.recipient.address}</p>
                            </div>
                        </div>
                         {pkg.recipient.email && <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${pkg.recipient.email}`} className="text-primary hover:underline">{pkg.recipient.email}</a>
                        </div>}
                         {pkg.recipient.phone && <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{pkg.recipient.phone}</span>
                        </div>}
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Historique des statuts</CardTitle>
                </CardHeader>
                <CardContent>
                    <PackageStatusTimeline history={pkg.statusHistory} />
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
