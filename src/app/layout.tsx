import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomNavBar from '../components/BottomNavBar';
import { SITE_URL } from '../utils/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FitBros Car Rental Bangalore',
    template: '%s | FitBros',
  },
  description: 'Book a car with FitBros Car Rental in Bengaluru. Browse our fleet, compare daily rates, and book your next trip online.',
  keywords: [
    'FitBros Car Rental Bangalore',
    'car rental Bangalore',
    'car hire Bengaluru',
    'rental cars Bengaluru',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'FitBros Car Rental',
    title: 'FitBros Car Rental Bangalore',
    description: 'Browse and book rental cars in Bengaluru with FitBros.',
    url: SITE_URL,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'FitBros Car Rental Bangalore',
    description: 'Browse and book rental cars in Bengaluru with FitBros.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CarRental',
  '@id': `${SITE_URL}/#car-rental`,
  name: 'FitBros Car Rental',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  description: 'Car rentals in Bengaluru, Karnataka.',
  telephone: '+919743854269',
  email: 'fitbrosindia3@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '51, Dayananda Sagar College Road, 2nd Cross, 1st Stage, Teachers Colony',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560078',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'City',
    name: 'Bengaluru',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'https://schema.org/Monday',
        'https://schema.org/Tuesday',
        'https://schema.org/Wednesday',
        'https://schema.org/Thursday',
        'https://schema.org/Friday',
        'https://schema.org/Saturday',
      ],
      opens: '09:00',
      closes: '21:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'https://schema.org/Sunday',
      opens: '10:00',
      closes: '18:00',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0A0A0A] antialiased">
      <body className="min-h-full flex flex-col font-sans select-none">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessStructuredData).replace(/</g, '\\u003c'),
          }}
        />
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
