"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePackageStatusAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PackageStatus, packageStatuses } from "@/lib/types";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type UpdateStatusFormProps = {
  packageId: string;
  currentStatus: PackageStatus;
};

const initialState = {
  message: "",
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
            {pending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            Mettre à jour
        </Button>
    );
}

export function UpdateStatusForm({ packageId, currentStatus }: UpdateStatusFormProps) {
  const [state, formAction] = useFormState(updatePackageStatusAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if(state.message) {
        toast({
            title: state.success ? "Succès" : "Erreur",
            description: state.message,
            variant: state.success ? "default" : "destructive",
        });
    }
  }, [state, toast]);

  // Filter out the current status from the list of options
  const availableStatuses = packageStatuses.filter(status => status !== currentStatus);

  return (
    <form action={formAction} className="space-y-4">
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
      
      <SubmitButton />
    </form>
  );
}
