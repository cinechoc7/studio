"use client";

import { updatePackageStatusAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PackageStatus, packageStatuses } from "@/lib/types";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type UpdateStatusFormProps = {
  packageId: string;
  currentStatus: PackageStatus;
};


export function UpdateStatusForm({ packageId, currentStatus }: UpdateStatusFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await updatePackageStatusAction(formData);
    setIsPending(false);

    toast({
        title: result.success ? "Succès" : "Erreur",
        description: result.message,
        variant: result.success ? "default" : "destructive",
    });
  }


  // Filter out the current status from the list of options
  const availableStatuses = packageStatuses.filter(status => status !== currentStatus);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="packageId" value={packageId} />
      
      <div className="space-y-2">
        <Label htmlFor="status">Nouveau statut</Label>
        <Select name="status" defaultValue={availableStatuses[0]}>
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
      
       <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
            {isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            Mettre à jour
        </Button>
    </form>
  );
}
