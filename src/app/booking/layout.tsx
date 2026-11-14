import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Checkout',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function BookingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
