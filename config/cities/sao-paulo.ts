import type { CityConfig } from './index'

export const saoPauloConfig: CityConfig = {
  slug: 'sao-paulo',
  name: 'São Paulo',
  state: 'SP',
  preposition: 'em',
  siteTitle: 'Agenda Cultural SP - Shows, Teatro, Exposições e Festivais em São Paulo',
  siteDescription: 'Encontre shows, peças de teatro, exposições, festivais e muito mais em São Paulo. Agenda cultural atualizada diariamente.',
  siteUrl: 'https://agendaculturalsp.com.br',
  keywords: 'eventos sao paulo, shows sp, agenda cultural sp, teatro sao paulo, exposições sp, festivais sao paulo',
  ogTitle: 'Agenda Cultural SP - Shows, Teatro, Exposições e Festivais em São Paulo',
  ogDescription: 'Encontre shows, peças de teatro, exposições, festivais e muito mais em São Paulo. Agenda cultural atualizada diariamente.',
  headerImage: '/images/header-sao-paulo.jpg',
  footerSources: [
    { name: 'Sympla', url: 'https://sympla.com.br' },
    { name: 'Agenda SP', url: 'https://www.prefeitura.sp.gov.br/cidade/secretarias/cultura' },
  ],
  footerVenues:
    'CCBB SP, Caixa Cultural SP, MASP, Pinacoteca, Ibirapuera, Teatro Municipal de SP, Theatro São Pedro, MIS, Centro Cultural SP, Sesc Paulista, Sesc Pinheiros, Tom Brasil, Allianz Parque e outros espaços culturais de São Paulo.',
  footerCopyright: 'Agenda Cultural SP · São Paulo, Brasil',
  categoryLinks: [
    { label: 'Shows e Festas', href: '/categoria/shows-sao-paulo' },
    { label: 'Teatro', href: '/categoria/teatro-sao-paulo' },
    { label: 'Arte e Cultura', href: '/categoria/exposicoes-sao-paulo' },
    { label: 'Festivais', href: '/categoria/festivais-sao-paulo' },
    { label: 'Eventos Gratuitos', href: '/categoria/eventos-gratuitos-sao-paulo' },
    { label: 'Infantil', href: '/categoria/eventos-criancas-sao-paulo' },
  ],
  popularLinks: [
    { label: 'Eventos Hoje', href: '/eventos-sao-paulo-hoje' },
    { label: 'Mapa de Eventos', href: '/mapa' },
    { label: 'Roteiros Curados', href: '/roteiros' },
  ],
  jsonLd: {
    locality: 'São Paulo',
    region: 'SP',
    faq: [
      {
        question: 'O que tem pra fazer em São Paulo este fim de semana?',
        answer: 'A Agenda Cultural SP lista eventos atuais em São Paulo, incluindo shows, teatro, exposições e festivais. Acesse agendaculturalsp.com.br para ver todos os eventos com datas, horários e locais.',
      },
      {
        question: 'Onde ver shows e eventos culturais em São Paulo?',
        answer: 'São Paulo tem uma das maiores agendas culturais do Brasil com eventos no CCBB, MASP, Pinacoteca, Ibirapuera, Sesc e muitos outros. A Agenda Cultural SP agrega eventos de diversas fontes em um só lugar.',
      },
      {
        question: 'Quais são os eventos gratuitos em São Paulo?',
        answer: 'São Paulo oferece muitos eventos gratuitos em parques, museus e centros culturais. Use o filtro "Gratuito" na Agenda Cultural SP para ver apenas eventos sem custo.',
      },
      {
        question: 'Como comprar ingressos para eventos em São Paulo?',
        answer: 'A maioria dos eventos em São Paulo vende ingressos pelo Sympla (sympla.com.br). A Agenda Cultural SP exibe links diretos para compra de ingressos em cada evento listado.',
      },
    ],
  },
}
