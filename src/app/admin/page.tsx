'use client';

import { PackageTable } from "@/components/admin/package-table";
import { usePackages } from "@/lib/data";
import { AddPackageDialog } from "@/components/admin/add-package-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
    const { packages, isLoading } = usePackages();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const totalPackages = packages.length;
    const inTransitPackages = packages.filter(p => p.currentStatus === 'En cours de livraison' || p.currentStatus === 'En cours d\'acheminement').length;
    const deliveredPackages = packages.filter(p => p.currentStatus === 'Livré').length;

    return (
        <div className="flex flex-col flex-1 gap-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                <div className="grid gap-1">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard des Colis</h1>
                    <p className="text-muted-foreground">
                        Gérez et suivez tous les colis de votre système.
                    </p>
                </div>
                <div className="ml-auto">
                    <AddPackageDialog />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-base font-bold text-primary">
                            Total Colis
                        </CardTitle>
                        <Package className="w-6 h-6 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-primary">{totalPackages}</div>
                        <p className="text-sm text-muted-foreground">
                            Nombre total de colis gérés
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-base font-bold text-primary">
                            En Transit
                        </CardTitle>
                        <Truck className="w-6 h-6 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-primary">{inTransitPackages}</div>
                         <p className="text-sm text-muted-foreground">
                            Colis actuellement en cours d'acheminement
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-base font-bold text-primary">Livrés</CardTitle>
                        <CheckCircle className="w-6 h-6 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-primary">{deliveredPackages}</div>
                        <p className="text-sm text-muted-foreground">
                            Colis arrivés à destination
                        </p>
                    </CardContent>
                </Card>
            </div>

            <PackageTable packages={packages} />
        </div>
    );
}
