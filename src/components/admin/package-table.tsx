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
import { MoreHorizontal, Package as PackageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePackage as deletePackageAction } from "@/lib/data";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";

type PackageTableProps = {
  packages: Package[];
};

function DeletePackageDialog({ packageId }: { packageId: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const handleDelete = () => {
        startTransition(async () => {
            const success = await deletePackageAction(firestore, packageId);
            if (success) {
                toast({
                    title: "Colis supprimé",
                    description: "Le colis a été supprimé avec succès.",
                });
            } else {
                 toast({
                    title: "Erreur",
                    description: "La suppression du colis a échoué.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:bg-destructive/10">
                   <Trash2 className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Le colis <span className="font-mono text-foreground font-semibold">{packageId}</span> sera définitivement supprimé.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                        {isPending ? "Suppression..." : "Oui, supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


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
                        <TableHead className="hidden md:table-cell">Créé le</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.map((pkg) => (
                        <TableRow key={pkg.id} >
                            <TableCell className="font-mono text-primary hover:underline cursor-pointer" onClick={() => handleViewDetails(pkg.id)}>{pkg.id}</TableCell>
                            <TableCell className="font-medium">{pkg.recipient.name}</TableCell>
                            <TableCell>{pkg.destination}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(pkg.currentStatus) as any}>{pkg.currentStatus}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{new Date(pkg.createdAt as Date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Ouvrir le menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleViewDetails(pkg.id)}>
                                            Voir les détails
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DeletePackageDialog packageId={pkg.id} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
