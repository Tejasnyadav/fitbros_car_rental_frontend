import type { MetadataRoute } from 'next';
import type { Car } from '../types';
import { getPublicCars } from '../utils/public-cars';
import { SITE_URL } from '../utils/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let cars: Car[] = [];
  try {
    cars = await getPublicCars();
  } catch (error) {
    console.error('Failed to load public car listings for the sitemap.', error);
  }

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...cars.map((car) => ({
      url: `${SITE_URL}/cars/${encodeURIComponent(car.id)}`,
      ...(car.updatedAt ? { lastModified: new Date(car.updatedAt) } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
