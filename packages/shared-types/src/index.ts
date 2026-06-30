export interface User {
  id: string;
  email: string;
  role: "homeowner" | "provider" | "admin";
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED_PENDING_CONFIRMATION" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  serviceCategory: string;
  scheduledDate: string;
  amount: number;
}

export interface Job {
  id: string;
  customerId: string;
  description: string;
  skillCategory: string;
  lat: number;
  lng: number;
  idleHours: number;
  status: "OPEN" | "MATCHED" | "EXPIRED";
}