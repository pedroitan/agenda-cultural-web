import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/events'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://agendaculturalsalvador.com.br/sitemap.xml',
  }
}
