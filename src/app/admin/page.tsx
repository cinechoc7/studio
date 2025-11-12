'use client';

import { PackageTable } from "@/components/admin/package-table";
import { usePackages } from "@/lib/data";
import { AddPackageDialog } from "@/components/admin/add-package-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
    const { packages, isLoading } = usePackages();

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const totalPackages = packages.length;
    const inTransitPackages = packages.filter(p => p.currentStatus === 'En cours de livraison' || p.currentStatus === 'En cours de transit').length;
    const deliveredPackages = packages.filter(p => p.currentStatus === 'Livré').length;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard des Colis</h1>
                <div className="ml-auto">
                    <AddPackageDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Colis
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPackages}</div>
                        <p className="text-xs text-muted-foreground">
                            Nombre total de colis gérés
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            En Transit
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inTransitPackages}</div>
                         <p className="text-xs text-muted-foreground">
                            Colis actuellement en cours d'acheminement
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Livrés</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveredPackages}</div>
                        <p className="text-xs text-muted-foreground">
                            Colis arrivés à destination
                        </p>
                    </CardContent>
                </Card>
            </div>

            <PackageTable packages={packages} />
        </main>
    );
}
