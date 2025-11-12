export const packageStatuses = [
  'En attente',
  'En cours d\'emballage',
  'En cours de transit',
  'Arrivé au hub',
  'En cours de livraison',
  'Livré',
  'Retourné'
] as const;

export type PackageStatus = (typeof packageStatuses)[number];

export type StatusHistory = {
  status: PackageStatus;
  location: string;
  timestamp: Date;
};

export type Package = {
  id: string;
  customerName: string;
  origin: string;
  destination: string;
  currentStatus: PackageStatus;
  statusHistory: StatusHistory[];
};
