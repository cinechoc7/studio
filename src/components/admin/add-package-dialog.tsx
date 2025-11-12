'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { Loader2, PlusCircle, User, Mail, Phone, MapPin, Building, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAuth } from '@/firebase';
import type { ContactInfo } from '@/lib/types';

const initialState = {
  message: '',
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
      Créer le Colis
    </Button>
  );
}

export function AddPackageDialog() {
  const auth = useAuth();
  const [state, formAction] = useActionState(createPackageAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [idToken, setIdToken] = useState('');
  const [lastSender, setLastSender] = useState<ContactInfo | null>(null);

  useEffect(() => {
    // Load last sender from localStorage
    const savedSender = localStorage.getItem('lastSender');
    if (savedSender) {
      setLastSender(JSON.parse(savedSender));
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
        auth.currentUser.getIdToken().then(setIdToken);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Succès !' : 'Erreur',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        // Get sender data from the submitted form that was successful
        const formData = new FormData(formRef.current!);
        const newSender: ContactInfo = {
            name: formData.get('senderName') as string,
            address: formData.get('senderAddress') as string,
            email: formData.get('senderEmail') as string,
            phone: formData.get('senderPhone') as string,
        };
        // Save to state and localStorage
        setLastSender(newSender);
        localStorage.setItem('lastSender', JSON.stringify(newSender));

        // Reset only recipient and itinerary fields
        const recipientName = formRef.current?.elements.namedItem('recipientName') as HTMLInputElement;
        const recipientAddress = formRef.current?.elements.namedItem('recipientAddress') as HTMLInputElement;
        const recipientEmail = formRef.current?.elements.namedItem('recipientEmail') as HTMLInputElement;
        const recipientPhone = formRef.current?.elements.namedItem('recipientPhone') as HTMLInputElement;
        const origin = formRef.current?.elements.namedItem('origin') as HTMLInputElement;
        const destination = formRef.current?.elements.namedItem('destination') as HTMLInputElement;

        if (recipientName) recipientName.value = '';
        if (recipientAddress) recipientAddress.value = '';
        if (recipientEmail) recipientEmail.value = '';
        if (recipientPhone) recipientPhone.value = '';
        if (origin) origin.value = '';
        if (destination) destination.value = '';
        
        closeButtonRef.current?.click();
      }
    }
  }, [state, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Colis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"> <PackagePlus /> Créer un nouveau colis</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour enregistrer un nouveau colis et générer son code de suivi.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-6 pt-4">
          <input type="hidden" name="idToken" value={idToken} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><Building className="text-primary"/>Informations de l'Expéditeur</h3>
              <div className="space-y-2">
                <Label htmlFor="senderName">Nom Complet</Label>
                <Input id="senderName" name="senderName" placeholder="Ex: John Doe" defaultValue={lastSender?.name} required />
                {state.errors?.senderName && <p className="text-sm text-destructive">{state.errors.senderName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Adresse Complète</Label>
                <Input id="senderAddress" name="senderAddress" placeholder="Ex: 123 Rue Principale, 75001 Paris" defaultValue={lastSender?.address} required />
                {state.errors?.senderAddress && <p className="text-sm text-destructive">{state.errors.senderAddress}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="senderEmail">Email (Optionnel)</Label>
                <Input id="senderEmail" name="senderEmail" type="email" placeholder="Ex: expediteur@email.com" defaultValue={lastSender?.email} />
                {state.errors?.senderEmail && <p className="text-sm text-destructive">{state.errors.senderEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Téléphone (Optionnel)</Label>
                <Input id="senderPhone" name="senderPhone" type="tel" placeholder="Ex: 0123456789" defaultValue={lastSender?.phone} />
                {state.errors?.senderPhone && <p className="text-sm text-destructive">{state.errors.senderPhone}</p>}
              </div>
            </div>

            {/* Recipient Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><User className="text-primary"/>Informations du Destinataire</h3>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom Complet</Label>
                <Input id="recipientName" name="recipientName" placeholder="Ex: Jane Smith" required />
                {state.errors?.recipientName && <p className="text-sm text-destructive">{state.errors.recipientName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Adresse Complète</Label>
                <Input id="recipientAddress" name="recipientAddress" placeholder="Ex: 456 Avenue Secondaire, 13000 Marseille" required />
                {state.errors?.recipientAddress && <p className="text-sm text-destructive">{state.errors.recipientAddress}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email (Optionnel)</Label>
                <Input id="recipientEmail" name="recipientEmail" type="email" placeholder="Ex: destinataire@email.com" />
                {state.errors?.recipientEmail && <p className="text-sm text-destructive">{state.errors.recipientEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Téléphone (Optionnel)</Label>
                <Input id="recipientPhone" name="recipientPhone" type="tel" placeholder="Ex: 0612345678" />
                {state.errors?.recipientPhone && <p className="text-sm text-destructive">{state.errors.recipientPhone}</p>}
              </div>
            </div>
          </div>
          
          <Separator />

          {/* Itinerary Section */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground"><MapPin className="text-primary"/>Itinéraire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin">Ville d'origine</Label>
                    <Input id="origin" name="origin" placeholder="Ex: Paris, France" required />
                    {state.errors?.origin && <p className="text-sm text-destructive">{state.errors.origin}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="destination">Ville de destination</Label>
                    <Input id="destination" name="destination" placeholder="Ex: Marseille, France" required />
                    {state.errors?.destination && <p className="text-sm text-destructive">{state.errors.destination}</p>}
                </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" ref={closeButtonRef}>Annuler</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
