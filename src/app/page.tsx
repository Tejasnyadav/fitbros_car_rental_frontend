import type { Metadata } from 'next';
import LandingPage from '../components/LandingPage';
import { getPublicCars } from '../utils/public-cars';
import { SITE_URL } from '../utils/seo';
import type { Car } from '../types';

export const metadata: Metadata = {
  title: 'FitBros Car Rental Bangalore',
  description: 'Rent a car in Bengaluru with FitBros. Browse hatchbacks, sedans, SUVs and luxury cars, compare daily rates, and check availability online.',
  alternates: {
    canonical: SITE_URL,
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialCars: Car[] = [];

  try {
    initialCars = await getPublicCars();
  } catch (error) {
    console.error('Failed to load the public fleet for the homepage.', error);
  }

  return <LandingPage initialCars={initialCars} />;
}
