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
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type PackageTableProps = {
  packages: Package[];
};

export function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'default';
      case 'En cours de transit':
      case 'En cours de livraison':
        return 'secondary';
      case 'Retourné':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/package/${id}`);
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Tous les colis</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Code de Suivi</TableHead>
                    <TableHead className="hidden md:table-cell">Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Dernière mise à jour</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {packages.map((pkg) => (
                    <TableRow key={pkg.id} onClick={() => handleRowClick(pkg.id)} className="cursor-pointer">
                        <TableCell className="font-medium">{pkg.id}</TableCell>
                        <TableCell className="hidden md:table-cell">{pkg.customerName}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(pkg.currentStatus) as any}>{pkg.currentStatus}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(pkg.statusHistory[pkg.statusHistory.length -1].timestamp).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                                <ArrowRight className="h-4 w-4" />
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
