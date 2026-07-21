export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface Car {
  id: string;
  name: string;
  type: 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury';
  transmission: 'Manual' | 'Automatic';
  pricePerDay: number;
  image: string;
  status: 'AVAILABLE' | 'MAINTENANCE';
  isAvailable?: boolean; // dynamic from catalog search
  availabilityMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus =
  | 'PENDING_ADMIN_APPROVAL'
  | 'REJECTED'
  | 'APPROVED_PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CLOSED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  carId: string;
  car: Car;
  fromDate: string;
  toDate: string;
  destination: string;
  purpose: string;
  members: number;
  pickupLocation: string;
  status: BookingStatus;
  documents?: Document;
  agreement?: Agreement;
  payment?: Payment;
  invoice?: Invoice;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  bookingId: string;
  license: string; // URL / Base64
  aadhaar: string; // URL / Base64
  pan: string;     // URL / Base64
  selfie: string;  // URL / Base64
}

export interface Agreement {
  id: string;
  bookingId: string;
  signature: string; // Base64 data URL
}

export interface Payment {
  id: string;
  bookingId: string;
  method: 'UPI' | 'Card' | 'Cash';
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  date: string;
}

export interface DashboardStats {
  activeBookings: number;
  currentCarsOnRoad: number;
  monthlyRevenue: number;
  totalRevenue: number;
  totalCars: number;
  pendingApprovals: number;
  completedTrips: number;
  monthlyBookings: number;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}
