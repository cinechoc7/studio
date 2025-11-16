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
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Package as PackageIcon, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePackageAction } from "@/lib/actions";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { VariantProps } from "class-variance-authority";
import { EditPackageDialog } from "./edit-package-dialog";
import { Loader2 } from "lucide-react";
import { usePackages } from "@/lib/data";


function DeletePackageDialog({ packageId, onPackageDeleted }: { packageId: string, onPackageDeleted: (id: string) => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        setIsPending(true);
        const result = await deletePackageAction(packageId);
        setIsPending(false);

        toast({
            title: result.success ? "Succès" : "Erreur",
            description: result.message,
            variant: result.success ? 'default' : 'destructive'
        });

        if (result.success) {
            onPackageDeleted(packageId);
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive hover:bg-destructive/10">
                   <Trash2 className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Le colis <span className="font-mono text-foreground font-semibold">{packageId}</span> sera définitivement supprimé.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <Button onClick={handleDelete} variant="destructive" disabled={isPending}>
                         {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</> : "Oui, supprimer"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function PackageTable() {
  const router = useRouter();
  const { packages: initialPackages, isLoading, setPackages } = usePackages();
  
  const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
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

  const handlePackageDeleted = (id: string) => {
    setPackages(currentPackages => currentPackages.filter(p => p.id !== id));
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (initialPackages.length === 0) {
    return (
        <Card className="text-center p-12 border-dashed bg-secondary/30">
             <div className="mx-auto bg-card w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                <PackageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-primary">Aucun colis pour le moment</h3>
            <p className="mt-2 text-base text-muted-foreground">
                Commencez par créer un nouveau colis pour le voir apparaître ici.
            </p>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                        <TableHead>Code de Suivi</TableHead>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden md:table-cell">Créé le</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialPackages.map((pkg) => (
                        <TableRow key={pkg.id} >
                            <TableCell className="font-mono text-primary hover:underline cursor-pointer font-semibold" onClick={() => handleViewDetails(pkg.id)}>{pkg.id}</TableCell>
                            <TableCell className="font-medium">{pkg.recipient.name}</TableCell>
                            <TableCell>{pkg.destination}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(pkg.currentStatus)}>{pkg.currentStatus}</Badge>
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
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <EditPackageDialog pkg={pkg} asTrigger />
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DeletePackageDialog packageId={pkg.id} onPackageDeleted={handlePackageDeleted} />
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
