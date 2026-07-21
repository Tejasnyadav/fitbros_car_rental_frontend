import axios from 'axios';
import { User, Car, Booking, Notification, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for HTTP-only cookie transport
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. Authentication Services
export const authService = {
  register: async (data: any) => {
    const res = await api.post<{ message: string; user: User }>('/auth/register', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post<{ message: string; user: User }>('/auth/login', data);
    return res.data;
  },
  adminLogin: async (data: any) => {
    const res = await api.post<{ message: string; user: User }>('/auth/admin-login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post<{ message: string }>('/auth/logout');
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<{ user: User }>('/auth/profile');
    return res.data.user;
  },
  getAdminProfile: async () => {
    const res = await api.get<{ user: User }>('/auth/admin-profile');
    return res.data.user;
  }
};

// 2. Car Fleet Services
export const carService = {
  // Public user search with overlapping date check
  searchCars: async (params: { fromDate?: string; toDate?: string; type?: string; transmission?: string }) => {
    const res = await api.get<{ cars: Car[] }>('/cars', { params });
    return res.data.cars;
  },
  // Admin Fleet CRUD
  adminCreate: async (data: Omit<Car, 'id'>) => {
    const res = await api.post<{ message: string; car: Car }>('/admin/cars', data);
    return res.data;
  },
  adminList: async () => {
    const res = await api.get<{ cars: Car[] }>('/admin/cars');
    return res.data.cars;
  },
  adminUpdate: async (id: string, data: Partial<Car>) => {
    const res = await api.put<{ message: string; car: Car }>(`/admin/cars/${id}`, data);
    return res.data;
  },
  adminDelete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/cars/${id}`);
    return res.data;
  }
};

// 3. Booking Services
export const bookingService = {
  create: async (data: any) => {
    const res = await api.post<{ message: string; booking: Booking }>('/bookings', data);
    return res.data;
  },
  getDetails: async (id: string) => {
    const res = await api.get<{ booking: Booking }>(`/bookings/${id}`);
    return res.data.booking;
  },
  getActive: async () => {
    const res = await api.get<{ booking: Booking | null }>('/bookings/active');
    return res.data.booking;
  },
  getHistory: async () => {
    const res = await api.get<{ bookings: Booking[] }>('/bookings/history');
    return res.data.bookings;
  },
  pay: async (id: string, data: { method: 'UPI' | 'Card' | 'Cash'; amount: number }) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/bookings/${id}/payment`, data);
    return res.data;
  },
  createRazorpayOrder: async (id: string) => {
    const res = await api.post<{ orderId: string; amount: number; currency: string; keyId: string }>(`/bookings/${id}/razorpay-order`);
    return res.data;
  },
  verifyRazorpayPayment: async (id: string, data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/bookings/${id}/verify-payment`, data);
    return res.data;
  },
  // Admin Booking Operations
  adminList: async (params?: { dateFilter?: string; status?: string; startDate?: string; endDate?: string }) => {
    const res = await api.get<{ bookings: Booking[] }>('/admin/bookings', { params });
    return res.data.bookings;
  },
  adminApprove: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/approve`);
    return res.data;
  },
  adminReject: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/reject`);
    return res.data;
  },
  adminConfirmCash: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/confirm-cash`);
    return res.data;
  },
  adminStartTrip: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/start-trip`);
    return res.data;
  },
  adminEndTrip: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/end-trip`);
    return res.data;
  },
  adminClose: async (id: string) => {
    const res = await api.post<{ message: string; booking: Booking }>(`/admin/bookings/${id}/close`);
    return res.data;
  }
};

// 4. Notification Services
export const notificationService = {
  getUserAlerts: async () => {
    const res = await api.get<{ notifications: Notification[] }>('/notifications/user');
    return res.data.notifications;
  },
  getAdminAlerts: async () => {
    const res = await api.get<{ notifications: Notification[] }>('/notifications/admin');
    return res.data.notifications;
  }
};

// 5. Admin Dashboard Services
export const adminDashboardService = {
  getStats: async () => {
    const res = await api.get<{
      stats: DashboardStats;
      charts: {
        revenueChart: any[];
        bookingChart: any[];
        vehicleChart: any[];
      };
    }>('/admin/dashboard');
    return res.data;
  }
};

export default api;
