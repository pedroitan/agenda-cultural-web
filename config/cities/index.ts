export interface CityConfig {
  slug: string
  name: string
  state: string
  preposition: string       // "em Salvador" vs "no Rio de Janeiro"
  siteTitle: string
  siteDescription: string
  siteUrl: string
  keywords: string
  ogTitle: string
  ogDescription: string
  headerImage: string       // URL da imagem do header específica da cidade
  footerSources: { name: string; url: string }[]
  footerVenues: string
  footerCopyright: string
  categoryLinks: { label: string; href: string }[]
  popularLinks: { label: string; href: string }[]
  jsonLd: {
    locality: string
    region: string
    faq: { question: string; answer: string }[]
  }
}

import { salvadorConfig } from './salvador'
import { rioConfig } from './rio-de-janeiro'
import { saoPauloConfig } from './sao-paulo'

const configs: Record<string, CityConfig> = {
  salvador: salvadorConfig,
  'rio-de-janeiro': rioConfig,
  'sao-paulo': saoPauloConfig,
}

export function getCityConfig(): CityConfig {
  const city = process.env.NEXT_PUBLIC_CITY || 'salvador'
  return configs[city] ?? salvadorConfig
}
