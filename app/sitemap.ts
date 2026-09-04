import { MetadataRoute } from 'next'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { getCityConfig } from '@/config/cities'

export const revalidate = 3600 // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const city = getCityConfig()
  const baseUrl = city.siteUrl

  // Get last scrape time for accurate lastModified
  const supabase = getSupabaseServerClient()
  let lastModified = new Date()

  if (supabase) {
    const { data } = await supabase
      .from('scrape_runs')
      .select('ended_at')
      .eq('status', 'success')
      .order('ended_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.ended_at) {
      lastModified = new Date(data.ended_at)
    }
  }

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date('2026-09-04'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
