"use client";

import { cn, formatDate } from "@/lib/utils";
import type { StatusHistory } from "@/lib/types";
import { Package, Truck, Warehouse, CheckCircle2, XCircle, Clock, Home, Building } from "lucide-react";
import React from "react";

const statusIcons: { [key: string]: React.ElementType } = {
    'Pris en charge': Package,
    'En cours d\'acheminement': Truck,
    'Bloqué au dédouanement': XCircle,
    'Arrivé au hub de distribution': Building,
    'En cours de livraison': Home,
    'Tentative de livraison échouée': Clock,
    'Livré': CheckCircle2,
    'Retour à l\'expéditeur': XCircle,
};


export function PackageStatusTimeline({ history }: PackageStatusTimelineProps) {
  // The history is now pre-sorted from the data source
  const sortedHistory = history;

  return (
    <div className="relative pl-4">
      <div className="absolute left-5 top-0 h-full w-0.5 bg-border/80 -translate-x-1/2" aria-hidden="true" />
      <ul className="space-y-8">
        {sortedHistory.map((item, index) => {
          const Icon = statusIcons[item.status] || Package;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-start space-x-6">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ring-4 ring-background",
                isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-grow pt-1">
                <p className={cn(
                  "font-semibold",
                  isFirst ? "text-primary" : "text-foreground"
                )}>
                  {item.status}
                </p>
                <p className="text-sm text-muted-foreground">{item.location}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(item.timestamp)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type PackageStatusTimelineProps = {
  history: StatusHistory[];
};
