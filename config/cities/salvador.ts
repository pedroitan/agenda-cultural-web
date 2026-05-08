import type { CityConfig } from './index'

export const salvadorConfig: CityConfig = {
  slug: 'salvador',
  name: 'Salvador',
  state: 'BA',
  preposition: 'em',
  siteTitle: 'Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia',
  siteDescription: 'Encontre shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais em Salvador, Bahia. Agenda cultural atualizada diariamente.',
  siteUrl: 'https://agendaculturalsalvador.com.br',
  keywords: 'eventos salvador, shows salvador, agenda cultural salvador, teatro salvador, exposições salvador, festivais salvador',
  ogTitle: 'Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia',
  ogDescription: 'Encontre shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais em Salvador, Bahia. Agenda cultural atualizada diariamente.',
  headerImage: '/banner.png',
  footerSources: [
    { name: 'Sympla', url: 'https://sympla.com.br' },
    { name: 'El Cabong', url: 'https://elcabong.com.br' },
  ],
  footerVenues:
    'Teatro Castro Alves (TCA), Teatro Gamboa, El Cabong, Casa de Música da Bahia, SESI Salvador, Concha Acústica do TCA, Teatro ISBA, Teatro Vila Velha, Museu de Arte Moderna da Bahia (MAM), Farol da Barra, Solar do Unhão, Teatro SESC Casa do Comerciário, Espaço Cultural da Barroquinha e outros espaços culturais de Salvador, Bahia.',
  footerCopyright: 'Agenda Cultural Salvador · Salvador, Bahia, Brasil',
  categoryLinks: [
    { label: 'Shows e Festas', href: '/categoria/shows-salvador' },
    { label: 'Teatro', href: '/categoria/teatro-salvador' },
    { label: 'Arte e Cultura', href: '/categoria/exposicoes-salvador' },
    { label: 'Festivais', href: '/categoria/festivais-salvador' },
    { label: 'Eventos Gratuitos', href: '/categoria/eventos-gratuitos-salvador' },
    { label: 'Infantil', href: '/categoria/eventos-criancas-salvador' },
  ],
  popularLinks: [
    { label: 'Eventos Hoje', href: '/eventos-salvador-hoje' },
    { label: 'Mapa de Eventos', href: '/mapa' },
    { label: 'Roteiros Curados', href: '/roteiros' },
    { label: 'Distrito do Comércio', href: '/distrito-comercio' },
  ],
  jsonLd: {
    locality: 'Salvador',
    region: 'BA',
    faq: [
      {
        question: 'O que tem pra fazer em Salvador este fim de semana?',
        answer: 'A Agenda Cultural Salvador lista eventos atuais em Salvador, incluindo shows, teatro, exposições e festivais. Acesse agendaculturalsalvador.com.br para ver todos os eventos com datas, horários e locais.',
      },
      {
        question: 'Onde ver shows e eventos culturais em Salvador?',
        answer: 'Salvador tem uma agenda cultural intensa com eventos no Teatro Castro Alves (TCA), Teatro Gamboa, El Cabong, Casa de Música da Bahia, SESI, Concha Acústica e muitos outros. A Agenda Cultural Salvador agrega eventos de Sympla e El Cabong em um só lugar.',
      },
      {
        question: 'Quais são os eventos gratuitos em Salvador?',
        answer: 'Salvador oferece muitos eventos gratuitos, especialmente em espaços públicos, museus e centros culturais. Use o filtro "Gratuito" na Agenda Cultural Salvador para ver apenas eventos sem custo.',
      },
      {
        question: 'Como comprar ingressos para eventos em Salvador?',
        answer: 'A maioria dos eventos em Salvador vende ingressos pelo Sympla (sympla.com.br). A Agenda Cultural Salvador exibe links diretos para compra de ingressos em cada evento listado.',
      },
    ],
  },
}
