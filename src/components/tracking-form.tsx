"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
        <FormField
          control={form.control}
          name="trackingId"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Code de suivi</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Entrez votre numéro de suivi..." 
                    {...field} 
                    className="h-14 pl-5 text-base bg-input border-border"
                    aria-label="Code de suivi"
                  />
                </div>
              </FormControl>
              <FormMessage className="absolute"/>
            </FormItem>
          )}
        />
        <Button 
            type="submit" 
            className="h-14 !w-auto px-6 bg-primary hover:bg-primary/90"
            size="lg"
            disabled={form.formState.isSubmitting}
            aria-label="Suivre"
        >
          <span className="hidden sm:inline">Suivre</span>
          {form.formState.isSubmitting ? <ArrowRight className="h-5 w-5 sm:ml-2 animate-pulse" /> : <ArrowRight className="h-5 w-5 sm:ml-2" />}
        </Button>
      </form>
    </Form>
  );
}
