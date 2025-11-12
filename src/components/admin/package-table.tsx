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
import { deletePackageAction } from "@/lib/actions";
import { useEffect, useRef, useState, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { useFormStatus } from "react-dom";
import { VariantProps } from "class-variance-authority";

type PackageTableProps = {
  packages: Package[];
};

const initialState = {
  message: "",
  success: false,
};

function DeletePackageDialog({ packageId }: { packageId: string }) {
    const { toast } = useToast();
    const auth = useAuth();
    const [idToken, setIdToken] = useState('');
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(deletePackageAction, initialState);

    useEffect(() => {
        if (auth.currentUser) {
            auth.currentUser.getIdToken().then(setIdToken);
        }
    }, [auth.currentUser, open]);


    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Succès" : "Erreur",
                description: state.message,
                variant: state.success ? 'default' : 'destructive'
            });
            if (state.success) {
                setOpen(false);
            }
        }
    }, [state, toast]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive hover:bg-destructive/10">
                   <Trash2 className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="packageId" value={packageId} />
                    <input type="hidden" name="idToken" value={idToken} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le colis <span className="font-mono text-foreground font-semibold">{packageId}</span> sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending ? "Suppression..." : "Oui, supprimer"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();
  
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
  
  if (packages.length === 0) {
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
                        {packages.map((pkg) => (
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
