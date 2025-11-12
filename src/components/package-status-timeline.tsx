"use client";

import { cn, formatDate } from "@/lib/utils";
import type { StatusHistory } from "@/lib/types";
import { Package, Truck, Warehouse, Home, CheckCircle2, RotateCcw, PackageCheck } from "lucide-react";
import React from "react";

type PackageStatusTimelineProps = {
  history: StatusHistory[];
};

const statusIcons: { [key: string]: React.ElementType } = {
    'En attente': Package,
    'En cours d\'emballage': PackageCheck,
    'En cours de transit': Truck,
    'Arrivé au hub': Warehouse,
    'En cours de livraison': Truck,
    'Livré': CheckCircle2,
    'Retourné': RotateCcw,
};


export function PackageStatusTimeline({ history }: PackageStatusTimelineProps) {
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
      <ul className="space-y-8">
        {sortedHistory.map((item, index) => {
          const Icon = statusIcons[item.status] || Package;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-start space-x-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                isFirst ? "bg-primary text-primary-foreground ring-4 ring-background" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-grow pt-1.5">
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
