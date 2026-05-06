import type { CityConfig } from './index'

export const rioConfig: CityConfig = {
  slug: 'rio-de-janeiro',
  name: 'Rio de Janeiro',
  state: 'RJ',
  preposition: 'no',
  siteTitle: 'Agenda Cultural RJ - Shows, Teatro, Samba e Festivais no Rio de Janeiro',
  siteDescription: 'Encontre shows, teatro, samba, exposições, festivais e muito mais no Rio de Janeiro. Agenda cultural atualizada diariamente.',
  siteUrl: 'https://agendaculturalrj.com.br',
  keywords: 'eventos rio de janeiro, shows rio, agenda cultural rj, teatro rio, samba rio, festivais rio de janeiro',
  ogTitle: 'Agenda Cultural RJ - Shows, Teatro, Samba e Festivais no Rio de Janeiro',
  ogDescription: 'Encontre shows, teatro, samba, exposições, festivais e muito mais no Rio de Janeiro. Agenda cultural atualizada diariamente.',
  footerSources: [
    { name: 'Sympla', url: 'https://sympla.com.br' },
    { name: 'Rio Guia Oficial', url: 'https://www.rio.rj.gov.br' },
  ],
  footerVenues:
    'CCBB Rio, Caixa Cultural Rio, Oi Futuro, MAR (Museu de Arte do Rio), TIM Music, Teatro Municipal do Rio, Centro Cultural Banco do Brasil, Circo Voador, Fundição Progresso, Theatro Carlos Gomes e outros espaços culturais do Rio de Janeiro.',
  footerCopyright: 'Agenda Cultural RJ · Rio de Janeiro, Brasil',
  categoryLinks: [
    { label: 'Shows e Festas', href: '/categoria/shows-rio-de-janeiro' },
    { label: 'Teatro', href: '/categoria/teatro-rio-de-janeiro' },
    { label: 'Samba', href: '/categoria/samba-rio-de-janeiro' },
    { label: 'Festivais', href: '/categoria/festivais-rio-de-janeiro' },
    { label: 'Eventos Gratuitos', href: '/categoria/eventos-gratuitos-rio-de-janeiro' },
    { label: 'Infantil', href: '/categoria/eventos-criancas-rio-de-janeiro' },
  ],
  popularLinks: [
    { label: 'Eventos Hoje', href: '/eventos-rio-de-janeiro-hoje' },
    { label: 'Mapa de Eventos', href: '/mapa' },
    { label: 'Roteiros Curados', href: '/roteiros' },
  ],
  jsonLd: {
    locality: 'Rio de Janeiro',
    region: 'RJ',
    faq: [
      {
        question: 'O que tem pra fazer no Rio de Janeiro este fim de semana?',
        answer: 'A Agenda Cultural RJ lista eventos atuais no Rio de Janeiro, incluindo shows, teatro, samba, exposições e festivais. Acesse agendaculturalrj.com.br para ver todos os eventos com datas, horários e locais.',
      },
      {
        question: 'Onde ver shows e eventos culturais no Rio de Janeiro?',
        answer: 'O Rio de Janeiro tem uma agenda cultural intensa com eventos no CCBB, Caixa Cultural, Oi Futuro, MAR, Circo Voador, Fundição Progresso e muitos outros. A Agenda Cultural RJ agrega eventos de diversas fontes em um só lugar.',
      },
      {
        question: 'Quais são os eventos gratuitos no Rio de Janeiro?',
        answer: 'O Rio de Janeiro oferece muitos eventos gratuitos em parques, museus e centros culturais. Use o filtro "Gratuito" na Agenda Cultural RJ para ver apenas eventos sem custo.',
      },
      {
        question: 'Como comprar ingressos para eventos no Rio de Janeiro?',
        answer: 'A maioria dos eventos no Rio vende ingressos pelo Sympla (sympla.com.br). A Agenda Cultural RJ exibe links diretos para compra de ingressos em cada evento listado.',
      },
    ],
  },
}
