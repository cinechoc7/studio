"use client";

import type { Package } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, Package as PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type PackageTableProps = {
  packages: Package[];
};

export function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'success';
      case 'En cours d\'acheminement':
      case 'En cours de livraison':
      case 'Pris en charge':
      case 'Arrivé au hub de distribution':
        return 'default';
      case 'Retour à l\'expéditeur':
      case 'Tentative de livraison échouée':
      case 'Bloqué au dédouanement':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/package/${id}`);
  };
  
  if (packages.length === 0) {
    return (
        <Card className="text-center p-12 border-dashed">
             <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                <PackageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Aucun colis pour le moment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Commencez par créer un nouveau colis pour le voir apparaître ici.
            </p>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Liste des Colis</CardTitle>
            <CardDescription>Gérez et suivez tous les colis de votre système.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Code de Suivi</TableHead>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden md:table-cell">Dernière MàJ</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.map((pkg) => (
                        <TableRow key={pkg.id} className="cursor-pointer" onClick={() => handleViewDetails(pkg.id)}>
                            <TableCell className="font-mono text-primary hover:underline">{pkg.id}</TableCell>
                            <TableCell className="font-medium">{pkg.recipient.name}</TableCell>
                            <TableCell>{pkg.destination}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(pkg.currentStatus) as any}>{pkg.currentStatus}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{new Date(pkg.statusHistory[0].timestamp).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                               <ArrowRight className="h-4 w-4 text-muted-foreground" />
                               <span className="sr-only">Voir les détails</span>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
