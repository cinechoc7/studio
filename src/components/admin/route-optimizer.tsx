"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getOptimizedRouteAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Clock, Route } from "lucide-reload";

const initialState = {
  message: "",
  data: null,
  errors: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Optimiser la Route
            <Sparkles className="ml-2 h-4 w-4" />
        </Button>
    );
}

export function RouteOptimizer() {
  const [state, formAction] = useFormState(getOptimizedRouteAction, initialState);

  return (
    <>
      <form action={formAction}>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origine</Label>
              <Input id="origin" name="origin" placeholder="Ex: Paris, France" required />
              {state.errors?.origin && <p className="text-sm text-destructive">{state.errors.origin}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" name="destination" placeholder="Ex: Marseille, France" required />
              {state.errors?.destination && <p className="text-sm text-destructive">{state.errors.destination}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waypoints">Points de passage (séparés par des virgules)</Label>
            <Input id="waypoints" name="waypoints" placeholder="Ex: Lyon, France, Nice, France" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentTrafficConditions">Conditions de trafic</Label>
              <Textarea id="currentTrafficConditions" name="currentTrafficConditions" placeholder="Ex: Trafic dense sur A7" required />
               {state.errors?.currentTrafficConditions && <p className="text-sm text-destructive">{state.errors.currentTrafficConditions}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentweatherConditions">Conditions météo</Label>
              <Textarea id="currentweatherConditions" name="currentweatherConditions" placeholder="Ex: Pluie forte à Lyon" required />
              {state.errors?.currentweatherConditions && <p className="text-sm text-destructive">{state.errors.currentweatherConditions}</p>}
            </div>
          </div>
          <SubmitButton />
        </CardContent>
      </form>
      
      {state.data && (
        <CardContent>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><Sparkles className="h-5 w-5 mr-2 text-accent"/>Résultat de l'optimisation</h3>
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold flex items-center"><Route className="mr-2 h-4 w-4"/> Route optimisée:</p>
                <p className="text-sm text-foreground/80">{state.data.optimizedRoute}</p>
              </div>
              <div>
                <p className="font-semibold flex items-center"><Clock className="mr-2 h-4 w-4"/> Temps de livraison estimé:</p>
                <p className="text-sm text-foreground/80">{state.data.estimatedDeliveryTime}</p>
              </div>
               <div>
                <p className="font-semibold">Résumé:</p>
                <p className="text-sm text-foreground/80">{state.data.routeSummary}</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      {state.message && !state.errors && !state.data && (
        <CardContent>
            <p className="text-sm text-destructive">{state.message}</p>
        </CardContent>
      )}
    </>
  );
}
