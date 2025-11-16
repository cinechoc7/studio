'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { revalidatePackagePaths } from '@/lib/actions';
import { Loader2, Barcode, Pencil, Building, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import type { Package } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface EditPackageDialogProps {
    pkg: Package;
    asTrigger?: boolean;
}

export function EditPackageDialog({ pkg, asTrigger = false }: EditPackageDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const isExamplePackage = pkg.id.startsWith('CM') && pkg.adminId === 'dummy-admin-id';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const updatedFields = {
        'sender.name': data.senderName,
        'sender.address': data.senderAddress,
        'sender.email': data.senderEmail,
        'sender.phone': data.senderPhone,
        'recipient.name': data.recipientName,
        'recipient.address': data.recipientAddress,
        'recipient.email': data.recipientEmail,
        'recipient.phone': data.recipientPhone,
        'origin': data.origin,
        'destination': data.destination,
    };
    
    try {
        const packageRef = doc(firestore, "packages", pkg.id);
        await updateDoc(packageRef, updatedFields);
        await revalidatePackagePaths(pkg.id);

        toast({
            title: 'Succès !',
            description: `Colis ${pkg.id} mis à jour avec succès.`
        });

        setIsPending(false);
        setOpen(false);

    } catch (error: any) {
        console.error("Error updating package:", error);
        toast({
            title: 'Erreur de mise à jour',
            description: error.message || 'Une erreur est survenue.',
            variant: 'destructive'
        });
        setIsPending(false);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground"> <Pencil className="text-primary"/> Modifier le colis</DialogTitle>
          <DialogDescription>
            Modifiez les informations du colis. Le code de suivi ne peut pas être modifié.
          </DialogDescription>
        </DialogHeader>
        { isExamplePackage ? (
            <div className="py-8 text-center text-muted-foreground">
                <p>Les colis d'exemple ne peuvent pas être modifiés.</p>
                <p className="text-sm">Veuillez créer un nouveau colis pour tester la fonctionnalité d'édition.</p>
            </div>
        ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pt-4">
           <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><Barcode className="text-primary"/>Code de suivi</h3>
                 <div className="space-y-2">
                    <Label htmlFor="packageId">Code de suivi (non modifiable)</Label>
                    <Input id="packageId" name="packageId" defaultValue={pkg.id} readOnly disabled />
                </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Section */}
            <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><Building className="text-primary"/>Informations de l'Expéditeur</h3>
              <div className="space-y-2">
                <Label htmlFor="senderName">Nom Complet</Label>
                <Input id="senderName" name="senderName" defaultValue={pkg.sender.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Adresse Complète</Label>
                <Input id="senderAddress" name="senderAddress" defaultValue={pkg.sender.address} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="senderEmail">Email</Label>
                <Input id="senderEmail" name="senderEmail" type="email" defaultValue={pkg.sender.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Téléphone</Label>
                <Input id="senderPhone" name="senderPhone" type="tel" defaultValue={pkg.sender.phone} />
              </div>
            </div>

            {/* Recipient Section */}
            <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><User className="text-primary"/>Informations du Destinataire</h3>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom Complet</Label>
                <Input id="recipientName" name="recipientName" defaultValue={pkg.recipient.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Adresse Complète</Label>
                <Input id="recipientAddress" name="recipientAddress" defaultValue={pkg.recipient.address} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email</Label>
                <Input id="recipientEmail" name="recipientEmail" type="email" defaultValue={pkg.recipient.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Téléphone</Label>
                <Input id="recipientPhone" name="recipientPhone" type="tel" defaultValue={pkg.recipient.phone} />
              </div>
            </div>
          </div>
          
          <Separator />

          {/* Itinerary Section */}
          <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
             <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><MapPin className="text-primary"/>Itinéraire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin">Ville d'origine</Label>
                    <Input id="origin" name="origin" defaultValue={pkg.origin} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="destination">Ville de destination</Label>
                    <Input id="destination" name="destination" defaultValue={pkg.destination} />
                </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline" ref={closeButtonRef}>Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
  );

  if (asTrigger) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger disabled={isExamplePackage} className={cn("relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", isExamplePackage && "cursor-not-allowed opacity-50")}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Modifier</span>
            </DialogTrigger>
            {dialogContent}
        </Dialog>
      )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isExamplePackage}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier le Colis
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
