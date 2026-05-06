import { MetadataRoute } from 'next'
import { getCityConfig } from '@/config/cities'

export default function robots(): MetadataRoute.Robots {
  const city = getCityConfig();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/events'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${city.siteUrl}/sitemap.xml`,
  }
}
