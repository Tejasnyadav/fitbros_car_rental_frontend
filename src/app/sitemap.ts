import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

const getSiteUrl = async () => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host')?.split(',')[0].trim()
    || requestHeaders.get('host');

  if (!host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Set NEXT_PUBLIC_SITE_URL or configure the host header to generate the sitemap.');
    }
    return 'http://localhost:3000';
  }

  const forwardedProtocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim();
  const protocol = forwardedProtocol === 'http' || forwardedProtocol === 'https'
    ? forwardedProtocol
    : process.env.NODE_ENV === 'production' ? 'https' : 'http';

  return new URL(`${protocol}://${host}`).origin;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];
}
