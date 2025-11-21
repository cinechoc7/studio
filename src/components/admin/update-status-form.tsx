
"use client";

import { revalidatePackagePaths } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageStatus, packageStatuses, StatusHistory } from "@/lib/types";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type UpdateStatusFormProps = {
  packageId: string;
  currentStatus: PackageStatus;
};


export function UpdateStatusForm({ packageId, currentStatus }: UpdateStatusFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<PackageStatus | string>("")
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
        toast({ title: "Erreur", description: "La base de données n'est pas disponible.", variant: "destructive"});
        return;
    }

    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const status = newStatus;
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
        
        await revalidatePackagePaths(packageId);

        toast({
            title: "Succès",
            description: `Statut du colis mis à jour en "${status}".`,
        });

        formRef.current?.reset();
        setNewStatus("");

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="packageId" value={packageId} />
      
      <div className="space-y-2">
        <Label htmlFor="status">Nouveau statut</Label>
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                 <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {newStatus
                        ? newStatus
                        : "Sélectionner ou saisir un statut..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput 
                        placeholder="Rechercher ou créer un statut..." 
                        onValueChange={(value) => setNewStatus(value)}
                        value={newStatus}
                     />
                    <CommandList>
                        <CommandEmpty>
                            <Button variant="ghost" className="w-full justify-start p-2 h-auto" onClick={() => setOpen(false)}>
                                Utiliser le statut : "{newStatus}"
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {packageStatuses.map((status) => (
                                <CommandItem
                                    key={status}
                                    value={status}
                                    onSelect={(currentValue) => {
                                        setNewStatus(currentValue.toLowerCase() === newStatus.toLowerCase() ? "" : status)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            newStatus.toLowerCase() === status.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {status}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
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
