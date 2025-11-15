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
import { createPackageAction } from '@/lib/actions';
import { Loader2, PlusCircle, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAuth } from '@/firebase';
import type { ContactInfo } from '@/lib/types';
import { Building, User, MapPin } from 'lucide-react';

export function AddPackageDialog() {
  const auth = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [lastSender, setLastSender] = useState<ContactInfo | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const savedSender = localStorage.getItem('lastSender');
    if (savedSender) {
      setLastSender(JSON.parse(savedSender));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await createPackageAction(formData);

    setIsPending(false);

    toast({
      title: result.success ? 'Succès !' : 'Erreur',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });

    if (result.success) {
      const newSender: ContactInfo = {
          name: formData.get('senderName') as string,
          address: formData.get('senderAddress') as string,
          email: formData.get('senderEmail') as string,
          phone: formData.get('senderPhone') as string,
      };
      setLastSender(newSender);
      localStorage.setItem('lastSender', JSON.stringify(newSender));
      
      closeButtonRef.current?.click();
      formRef.current?.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Nouveau Colis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground"> <PackagePlus className="text-primary"/> Créer un nouveau colis</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour enregistrer un nouveau colis. Le code de suivi sera généré automatiquement.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pt-4">
          {auth.currentUser && <input type="hidden" name="adminId" value={auth.currentUser.uid} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Section */}
            <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><Building className="text-primary"/>Informations de l'Expéditeur</h3>
              <div className="space-y-2">
                <Label htmlFor="senderName">Nom Complet</Label>
                <Input id="senderName" name="senderName" placeholder="Ex: John Doe" defaultValue={lastSender?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Adresse Complète</Label>
                <Input id="senderAddress" name="senderAddress" placeholder="Ex: 123 Rue Principale, 75001 Paris" defaultValue={lastSender?.address} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="senderEmail">Email</Label>
                <Input id="senderEmail" name="senderEmail" type="email" placeholder="Ex: expediteur@email.com" defaultValue={lastSender?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Téléphone</Label>
                <Input id="senderPhone" name="senderPhone" type="tel" placeholder="Ex: 0123456789" defaultValue={lastSender?.phone} />
              </div>
            </div>

            {/* Recipient Section */}
            <div className="p-4 space-y-4 border rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><User className="text-primary"/>Informations du Destinataire</h3>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom Complet</Label>
                <Input id="recipientName" name="recipientName" placeholder="Ex: Jane Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Adresse Complète</Label>
                <Input id="recipientAddress" name="recipientAddress" placeholder="Ex: 456 Avenue Secondaire, 13000 Marseille" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email</Label>
                <Input id="recipientEmail" name="recipientEmail" type="email" placeholder="Ex: destinataire@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Téléphone</Label>
                <Input id="recipientPhone" name="recipientPhone" type="tel" placeholder="Ex: 0612345678" />
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
                    <Input id="origin" name="origin" placeholder="Ex: Paris, France" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="destination">Ville de destination</Label>
                    <Input id="destination" name="destination" placeholder="Ex: Marseille, France" />
                </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline" ref={closeButtonRef}>Annuler</Button>
            </DialogClose>
             <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                Créer le Colis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}