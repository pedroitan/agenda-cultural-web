import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Map, Route, Bot, MapPin, Sparkles, Eye, Coins, Plane, Briefcase } from "lucide-react";
import { getCityConfig } from "@/config/cities";

const city = getCityConfig();
const siteName = city.siteTitle.split(" -")[0];

export const metadata: Metadata = {
  title: `Sobre | ${siteName}`,
  description: `Cultura de ${city.name}, organizada, geolocalizada e a serviço da cidade. Plataforma digital de programação cultural, mapeamento do setor e inteligência de dados sobre a cena cultural de ${city.name}.`,
  alternates: { canonical: `${city.siteUrl}/sobre` },
  openGraph: {
    title: `Sobre | ${siteName}`,
    description: `Plataforma digital de programação cultural, mapeamento do setor e inteligência de dados sobre a cena cultural de ${city.name}.`,
    url: `${city.siteUrl}/sobre`,
    type: "website",
  },
};

const MANIFESTO = [
  "Grandes eventos e produções independentes têm o mesmo valor na agenda.",
  "Curadoria editorial enraizada na cultura baiana e afro-diaspórica.",
  "Dados abertos e organizados como infraestrutura para quem faz cultura na cidade.",
];

const PRODUTO = [
  {
    icon: Compass,
    title: "Descoberta em tempo real",
    text: "Agenda personalizada por perfil, geolocalização e vibe do momento.",
    href: "/",
    cta: "Ver agenda",
  },
  {
    icon: Route,
    title: "Roteiros curados",
    text: "Experiências temáticas assinadas por curadores locais.",
    href: "/roteiros",
    cta: "Ver roteiros",
  },
  {
    icon: Map,
    title: "Mapa cultural interativo",
    text: "Visualização geográfica da programação da cidade.",
    href: "/mapa",
    cta: "Abrir mapa",
  },
];

const TECNOLOGIA = [
  {
    icon: Bot,
    title: "Agregação automatizada",
    text: "Coleta contínua de eventos a partir de múltiplas fontes: plataformas de ingressos, redes sociais e sites de casas culturais.",
  },
  {
    icon: MapPin,
    title: "Geolocalização em tempo real",
    text: "Mapa interativo com toda a programação ativa da cidade, por bairro e distrito.",
  },
  {
    icon: Sparkles,
    title: "Personalização por perfil",
    text: "Recomendações e roteiros adaptados ao interesse e à vibe de cada pessoa.",
  },
  {
    icon: Route,
    title: "Roteiros curados",
    text: "Trajetos temáticos que conectam eventos, gastronomia e cultura em uma experiência guiada.",
  },
];

const MAPEAMENTO = [
  "Volume e frequência de eventos por casa e espaço cultural",
  "Distribuição da oferta cultural por distrito e bairro",
  "Sazonalidade da programação ao longo do ano",
  "Segmentos artísticos mais ativos por território",
  "Territórios com carência de equipamentos e eventos",
];

const IMPACTO = [
  {
    icon: Eye,
    title: "Visibilidade",
    text: "Artistas, produtores, coletivos e espaços culturais ganham vitrine qualificada e alcance direto ao público.",
  },
  {
    icon: Coins,
    title: "Geração de renda",
    text: "Descoberta facilitada converte em público pagante para eventos, roteiros e casas culturais.",
  },
  {
    icon: Plane,
    title: "Turismo cultural",
    text: "Visitantes encontram com facilidade a programação viva da cidade, para além dos roteiros óbvios.",
  },
  {
    icon: Briefcase,
    title: "Profissionalização",
    text: "Canal de divulgação qualificado para agentes culturais independentes e produções de menor porte.",
  },
];

const ROADMAP = [
  {
    period: "Q3 2026",
    title: "Fundação",
    text: `Consolidação do produto, scraping e agregação de dados, base cultural de ${city.name} estruturada.`,
  },
  {
    period: "Q4 2026",
    title: "Lançamento público",
    text: "Disponibilização do app (iOS/Android/Web), curadoria editorial ativa, primeiros roteiros culturais.",
  },
  {
    period: "Q1 2027",
    title: "Inteligência de dados",
    text: "Painel de dados e indicadores do setor cultural: mapeamento por casa, distrito e bairro, para uso público e comercial.",
  },
  {
    period: "Q2–Q3 2027",
    title: "Expansão regional",
    text: "Ampliação de cobertura no Recôncavo Baiano e integração com outros equipamentos culturais do estado.",
  },
];

const PARCERIA_USO = [
  "Expansão da equipe técnica e de curadoria editorial",
  "Escala da infraestrutura de agregação e dados",
  "Desenvolvimento do painel de inteligência de dados do setor",
  "Ações de lançamento e aquisição de público",
];

const PARCERIA_MODELOS = [
  "Investimento direto (equity / conversível)",
  "Parceria comercial e patrocínio de mídia",
  "Editais e fomento ao setor cultural",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-2">{children}</p>;
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="relative overflow-hidden bg-brand-gradient text-white py-10 md:py-14 px-4">
        <picture>
          <source media="(max-width: 767px)" srcSet="/brand/header-roteiros-mobile.webp" />
          <img
            src="/brand/header-roteiros.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-[30%_50%] md:object-left"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-xs md:max-w-xl">
            Cultura de {city.name}, organizada, geolocalizada e a serviço da cidade.
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-xs md:max-w-lg">
            Plataforma digital de programação cultural, mapeamento do setor e inteligência de dados
            sobre a cena cultural de {city.name}.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-16 md:space-y-20">
        {/* Manifesto */}
        <section className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionLabel>Manifesto</SectionLabel>
            <h2 className="text-3xl font-bold text-zinc-900">A agenda é da cidade.</h2>
          </div>
          <ul className="space-y-4">
            {MANIFESTO.map((item) => (
              <li key={item} className="flex gap-4 text-lg text-zinc-700 leading-snug">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand-gradient" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Produto */}
        <section>
          <SectionLabel>O produto</SectionLabel>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Uma plataforma que organiza a vida cultural de {city.name}</h2>
          <p className="text-zinc-600 leading-relaxed max-w-3xl mb-8">
            Shows, exposições, festas, espetáculos, experiências gastronômicas e roteiros curados — reunidos em um só
            lugar, com curadoria editorial enraizada na cultura baiana e afro-diaspórica, valorizando tanto grandes
            eventos quanto produções independentes.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {PRODUTO.map(({ icon: Icon, title, text, href, cta }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border border-zinc-200 bg-white p-6 hover:border-brand-orange transition-colors"
              >
                <Icon className="w-6 h-6 text-brand-orange mb-4" />
                <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-4">{text}</p>
                <span className="text-sm font-medium text-brand-orange group-hover:underline">{cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Tecnologia */}
        <section>
          <SectionLabel>Tecnologia</SectionLabel>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Inovação tecnológica aplicada à cultura</h2>
          <p className="text-zinc-600 leading-relaxed max-w-3xl mb-8">
            A plataforma incorpora automação e inteligência de dados para manter a agenda viva e gerar conhecimento
            sobre o setor.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {TECNOLOGIA.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-gradient text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            Fontes atuais:{" "}
            {city.footerSources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ", "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">{s.name}</a>
              </span>
            ))}
            {" "}e perfis culturais da cidade. Os dados estão disponíveis na{" "}
            <a href="/api/events" className="underline hover:text-zinc-700">API pública</a>.
          </p>
        </section>

        {/* Mapeamento */}
        <section className="rounded-2xl bg-brand-graphite text-white p-8 md:p-12 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-lime mb-2">Diferencial estratégico</p>
            <h2 className="text-3xl font-bold mb-4">Mapeamento do setor cultural como infraestrutura de dados</h2>
            <p className="text-white/80 leading-relaxed">
              Ao agregar e georreferenciar continuamente a programação da cidade, a plataforma constrói uma base de
              dados viva sobre a atividade cultural de {city.name} — capaz de subsidiar diagnósticos, estratégias de
              expansão e decisões com dados concretos, tanto para o mercado quanto para políticas públicas.
            </p>
          </div>
          <ul className="space-y-3 self-center">
            {MAPEAMENTO.map((item) => (
              <li key={item} className="flex gap-3 text-white/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-lime" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Impacto */}
        <section>
          <SectionLabel>Impacto</SectionLabel>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Economia criativa e impacto para a cidade</h2>
          <p className="text-zinc-600 leading-relaxed max-w-3xl mb-8">
            Mais visibilidade para quem produz cultura, mais alcance para quem consome — e um canal qualificado de
            geração de renda no setor.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IMPACTO.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-zinc-200 bg-white p-5">
                <Icon className="w-6 h-6 text-brand-magenta mb-3" />
                <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-zinc-700 font-medium mt-6">
            Um único ecossistema conectando público, produtores culturais e mercado em torno da mesma base de dados.
          </p>
        </section>

        {/* Roadmap */}
        <section>
          <SectionLabel>Cronograma</SectionLabel>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Roadmap de implementação</h2>
          <p className="text-zinc-600 leading-relaxed max-w-3xl mb-8">
            Faseamento proposto para lançamento do produto e amadurecimento da camada de inteligência de dados.
          </p>
          <ol className="grid gap-4 md:grid-cols-4">
            {ROADMAP.map((step, i) => (
              <li key={step.period} className="relative rounded-xl border border-zinc-200 bg-white p-5">
                <span className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-2">{step.period}</p>
                <h3 className="font-bold text-zinc-900 mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Parcerias */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 md:p-12">
          <SectionLabel>Oportunidade</SectionLabel>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Investimento e parceria estratégica</h2>
          <p className="text-zinc-600 leading-relaxed max-w-3xl mb-8">
            Buscamos aporte e/ou parceria para acelerar o desenvolvimento da plataforma, ampliar a cobertura de dados
            do setor cultural baiano e consolidar a camada de inteligência de dados do setor.
          </p>
          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Uso do investimento</h3>
              <ul className="space-y-2">
                {PARCERIA_USO.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Modelos em avaliação</h3>
              <ul className="space-y-2">
                {PARCERIA_MODELOS.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-magenta" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a
            href="https://pedroitan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-brand-gradient text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Vamos conversar
          </a>
        </section>

        {/* Quem faz */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-zinc-200 pt-10">
          <div>
            <SectionLabel>Quem faz</SectionLabel>
            <p className="text-2xl font-bold text-zinc-900">
              Itan <span className="text-zinc-500 font-normal">— Fundador</span>
            </p>
            <p className="text-zinc-600 mt-1">
              Desenvolvido e mantido pela <span className="font-semibold">Itan Musictech</span>, {city.name}, {city.state}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://pedroitan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              pedroitan.com
            </a>
            <Link
              href="/adicionar-evento"
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              Divulgar um evento
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
