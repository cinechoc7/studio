"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  trackingId: z.string().min(1, "Le code de suivi est requis."),
});

export function TrackingForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/tracking/${values.trackingId}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="trackingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Code de suivi</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: CS123456789FR" 
                  {...field} 
                  className="h-14 text-center text-lg"
                  aria-label="Code de suivi"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
            type="submit" 
            className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Recherche...' : 'Suivre mon colis'}
          {!form.formState.isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </form>
    </Form>
  );
}
