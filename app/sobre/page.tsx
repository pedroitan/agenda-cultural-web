import type { Metadata } from "next";
import Link from "next/link";
import { getCityConfig } from "@/config/cities";

const city = getCityConfig();
const siteName = city.siteTitle.split(" -")[0];

export const metadata: Metadata = {
  title: `Sobre e Manifesto | ${siteName}`,
  description: `Por que a ${siteName} existe: um agregador independente de eventos culturais ${city.preposition} ${city.name}, atualizado diariamente. Desenvolvido por Itan Musictech.`,
  alternates: { canonical: `${city.siteUrl}/sobre` },
  openGraph: {
    title: `Sobre e Manifesto | ${siteName}`,
    description: `Por que a ${siteName} existe e como ela funciona.`,
    url: `${city.siteUrl}/sobre`,
    type: "website",
  },
};

const MANIFESTO = [
  {
    title: "A cidade acontece todos os dias.",
    text: `${city.name} tem show, peça, exposição, festa, feira e roda de conversa acontecendo agora — mas a informação está espalhada em dezenas de perfis, stories que somem em 24 horas e sites de ingresso diferentes. Quem quer sair de casa gasta mais tempo procurando do que vivendo.`,
  },
  {
    title: "Um só lugar, sem ruído.",
    text: "Reunimos os eventos da cidade em uma única agenda, organizada por data, categoria e local. Sem cadastro, sem algoritmo decidindo o que você vê, sem barreira entre você e o que está acontecendo.",
  },
  {
    title: "Cultura não tem tamanho.",
    text: "O grande festival e o sarau do bairro aparecem lado a lado. O evento gratuito tem o mesmo destaque do ingresso caro. Acreditamos que a cena cultural é feita também pelas iniciativas pequenas, independentes e periféricas — e é papel de uma agenda dar visibilidade a elas.",
  },
  {
    title: "Tecnologia a serviço da cena.",
    text: "Usamos automação e inteligência artificial para coletar, organizar e atualizar a agenda diariamente. A tecnologia faz o trabalho repetitivo para que produtores possam produzir e o público possa escolher.",
  },
  {
    title: "Aberto por padrão.",
    text: "Os dados da agenda são públicos e acessíveis por API. Qualquer pessoa pode listar um evento gratuitamente. O ingresso é sempre comprado direto na fonte — não intermediamos, não cobramos comissão.",
  },
  {
    title: "Feito aqui, para aqui.",
    text: `A ${siteName} é um projeto independente, feito ${city.preposition} ${city.name} por quem vive a cena cultural da cidade. Não é um portal de notícias nem uma plataforma de venda: é uma ferramenta para a cidade se encontrar.`,
  },
];

const HOW_IT_WORKS = [
  {
    title: "Coleta automática",
    text: `Robôs percorrem diariamente plataformas de ingressos, sites de casas de show e perfis culturais ${city.preposition} ${city.name}, extraindo data, local, preço e descrição de cada evento.`,
  },
  {
    title: "Organização com IA",
    text: "Cada evento é classificado por categoria, deduplicado quando aparece em mais de uma fonte e enriquecido com informações extraídas de textos e imagens.",
  },
  {
    title: "Curadoria humana",
    text: "Eventos enviados pelo público passam por moderação. Os Roteiros de fim de semana são montados a partir da agenda, conectando eventos por horário e proximidade.",
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="relative overflow-hidden bg-brand-gradient text-white py-10 px-4">
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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-xs md:max-w-lg">
            Sobre a {siteName}
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-xs md:max-w-md">
            Um agregador independente de eventos culturais {city.preposition} {city.name}, atualizado todos os dias.
            Esta página explica por que ele existe e como funciona.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-14">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-2">Manifesto</p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-8">A agenda é da cidade.</h2>
          <ol className="space-y-8">
            {MANIFESTO.map((item, i) => (
              <li key={item.title} className="flex gap-5">
                <span className="shrink-0 w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">{item.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-2">Como funciona</p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-8">Da rua para a tela, todo dia.</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.text}</p>
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

        <section className="rounded-2xl bg-brand-graphite text-white p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-lime mb-2">Quem faz</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Desenvolvido por Itan Musictech</h2>
          <p className="text-white/80 leading-relaxed mb-6">
            A {siteName} é desenvolvida e mantida pela Itan Musictech, estúdio de música e tecnologia
            de Pedro Itan, {city.preposition} {city.name}. O projeto nasce da vivência na cena cultural da cidade
            e da vontade de usar tecnologia para aproximar público, artistas e produtores.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://pedroitan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              pedroitan.com
            </a>
            <Link
              href="/adicionar-evento"
              className="inline-flex items-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Divulgar um evento
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
