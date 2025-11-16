
import { Timestamp } from "firebase/firestore";

export const packageStatuses = [
  'Pris en charge',
  'En cours d\'acheminement',
  'Bloqué au dédouanement',
  'Arrivé au hub de distribution',
  'En cours de livraison',
  'Tentative de livraison échouée',
  'Livré',
  'Retour à l\'expéditeur',
] as const;

export type PackageStatus = (typeof packageStatuses)[number];

export type StatusHistory = {
  status: PackageStatus;
  location: string;
  timestamp: string; // Using ISO string for consistency between Firestore and JSON
};

export type ContactInfo = {
    name: string;
    address: string;
    email?: string;
    phone?: string;
}

export type Package = {
  id: string; // Tracking code
  adminId: string;
  sender: ContactInfo;
  recipient: ContactInfo;
  origin: string;
  destination: string;
  currentStatus: PackageStatus;
  statusHistory: StatusHistory[];
  createdAt: string; // Using ISO string for consistency
};
