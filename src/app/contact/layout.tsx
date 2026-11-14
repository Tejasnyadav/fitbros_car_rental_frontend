import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact FitBros Car Rental Bangalore',
  description: 'Contact FitBros Car Rental in Bengaluru for help with our fleet, rentals, and bookings.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
