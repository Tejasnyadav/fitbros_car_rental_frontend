import type { MetadataRoute } from 'next';
import { getPublicCars } from '../utils/public-cars';
import { SITE_URL } from '../utils/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getPublicCars();

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
