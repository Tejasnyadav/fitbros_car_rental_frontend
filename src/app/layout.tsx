import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomNavBar from '../components/BottomNavBar';

export const metadata: Metadata = {
  title: 'FITBROS CAR RENTAL | Luxury Rentals',
  description: 'Premium luxury car rental platform. Experience seamless Uber-level booking, real-time KYC validation, and electronic signing.',
  keywords: 'car rental, luxury cars, rent car, premium car rental, luxury vehicle booking',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0A0A0A] antialiased">
      <body className="min-h-full flex flex-col font-sans select-none">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pb-20 md:pb-0">
            {children}
          </main>
          <BottomNavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
