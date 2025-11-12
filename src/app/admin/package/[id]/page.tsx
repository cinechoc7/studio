import { getPackageById } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UpdateStatusForm } from "@/components/admin/update-status-form";
import { PackageStatusTimeline } from "@/components/package-status-timeline";

type AdminPackagePageProps = {
  params: { id: string };
};

export default async function AdminPackagePage({ params }: AdminPackagePageProps) {
  const pkg = await getPackageById(params.id);

  if (!pkg) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Aucun colis trouvé avec le code de suivi "{params.id}".
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
          Colis #{pkg.id}
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 flex flex-col gap-4">
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
             <Card>
                <CardHeader>
                    <CardTitle>Détails du colis</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium text-muted-foreground">Client</p>
                            <p>{pkg.customerName}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Statut Actuel</p>
                            <p>{pkg.currentStatus}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Origine</p>
                            <p>{pkg.origin}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Destination</p>
                            <p>{pkg.destination}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-3">
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
