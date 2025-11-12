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
import { ArrowRight, MoreHorizontal } from "lucide-react";
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
        return 'default'; // Using 'default' for green-like color
      case 'En cours d\'acheminement':
      case 'En cours de livraison':
      case 'Pris en charge':
      case 'Arrivé au hub de distribution':
        return 'secondary'; // Using 'secondary' for blue/yellow-like color
      case 'Retour à l\'expéditeur':
      case 'Tentative de livraison échouée':
      case 'Bloqué au dédouanement':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/package/${id}`);
  };
  
  if (packages.length === 0) {
    return (
        <Alert>
            <AlertTitle>Aucun colis trouvé</AlertTitle>
            <AlertDescription>
                Commencez par créer un nouveau colis pour le voir apparaître ici.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Liste des Colis</CardTitle>
            <CardDescription>Gérez et suivez tous les colis de votre système.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.id}</TableCell>
                        <TableCell>{pkg.recipient.name}</TableCell>
                        <TableCell>{pkg.destination}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(pkg.currentStatus) as any}>{pkg.currentStatus}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(pkg.statusHistory[0].timestamp).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleViewDetails(pkg.id)}>
                                <ArrowRight className="h-4 w-4" />
                                <span className="sr-only">Voir les détails</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
