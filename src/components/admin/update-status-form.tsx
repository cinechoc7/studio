"use client";

import { revalidatePackagePaths } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PackageStatus, packageStatuses, StatusHistory } from "@/lib/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

type UpdateStatusFormProps = {
  packageId: string;
  currentStatus: PackageStatus;
};


export function UpdateStatusForm({ packageId, currentStatus }: UpdateStatusFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isPending, setIsPending] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
        toast({ title: "Erreur", description: "La base de données n'est pas disponible.", variant: "destructive"});
        return;
    }

    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const status = formData.get('status') as PackageStatus;
    const location = formData.get('location') as string;

    if (!status || !location) {
        toast({ title: "Erreur", description: "Le statut et l'emplacement sont requis.", variant: "destructive"});
        setIsPending(false);
        return;
    }

    const newStatusEntry: StatusHistory = {
        status,
        location,
        timestamp: new Date().toISOString(),
    };

    try {
        const packageRef = doc(firestore, "packages", packageId);
        
        await updateDoc(packageRef, {
            currentStatus: status,
            statusHistory: arrayUnion(newStatusEntry)
        });
        
        // Revalidate public pages
        await revalidatePackagePaths(packageId);

        toast({
            title: "Succès",
            description: `Statut du colis mis à jour en "${status}".`,
        });

        // Reset form fields after successful submission
        formRef.current?.reset();

    } catch (error: any) {
        console.error("Error updating package status:", error);
        toast({
            title: "Erreur de mise à jour",
            description: error.message || "La mise à jour du statut a échoué.",
            variant: "destructive",
        });
    } finally {
        setIsPending(false);
    }
  }


  // Filter out the current status from the list of options
  const availableStatuses = packageStatuses.filter(status => status !== currentStatus);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="packageId" value={packageId} />
      
      <div className="space-y-2">
        <Label htmlFor="status">Nouveau statut</Label>
        <Select name="status" defaultValue={availableStatuses.length > 0 ? availableStatuses[0] : undefined}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Emplacement actuel</Label>
        <Input 
          id="location" 
          name="location" 
          placeholder="Ex: Centre de tri, Lyon" 
          required 
        />
      </div>
      
       <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/hover">
            {isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            Mettre à jour
        </Button>
    </form>
  );
}
