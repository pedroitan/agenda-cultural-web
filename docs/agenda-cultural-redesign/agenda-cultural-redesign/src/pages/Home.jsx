/**
 * Home.jsx — Home Feed
 *
 * Seções:
 * 1. Header (cidade, clima, notificações)
 * 2. "O que está acontecendo agora?"
 * 3. Acontecendo Agora (scroll horizontal com LiveBadge)
 * 4. Essa Noite (card destaque)
 * 5. Sob o Radar (grid 3 colunas)
 * 6. Curado Esta Noite (roteiro curado)
 *
 * Props: nenhuma (usa dados do mock/API)
 */

import { useState, useEffect } from 'react'
import { Bell, SlidersHorizontal, ChevronRight, MapPin, Clock, Users } from 'lucide-react'
import eventos from '../data/mock.json'

// ── Subcomponentes ──────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="live-badge">
      <span className="live-badge-dot" />
      AO VIVO
    </span>
  )
}

function PriceBadge({ min, max }) {
  if (!min && !max) return <span className="price-badge free">GRÁTIS</span>
  if (max <= 40)     return <span className="price-badge low">$$</span>
  return               <span className="price-badge high">$$$</span>
}

function CategoryBadge({ categoria }) {
  const cores = {
    musica: '#FF6B6B',
    teatro: '#A855F7',
    arte: '#F59E0B',
    outdoor: '#10B981',
    talks: '#3B82F6',
    experimental: '#EC4899',
    gastronomia: '#F97316',
  }
  const cor = cores[categoria] || '#9B9991'
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '9999px',
      background: `${cor}22`,
      color: cor,
      border: `1px solid ${cor}44`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {categoria}
    </span>
  )
}

// Card grande para scroll horizontal (Acontecendo Agora)
function EventCardLarge({ evento, onPress }) {
  return (
    <div
      className="event-card"
      style={{ width: 280, cursor: 'pointer' }}
      onClick={() => onPress?.(evento.id)}
    >
      <div style={{ position: 'relative' }}>
        <img
          className="event-card-image"
          src={evento.imagem_url}
          alt={evento.nome}
          style={{ aspectRatio: '4/3' }}
        />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {evento.ao_vivo && <LiveBadge />}
          <CategoryBadge categoria={evento.categoria} />
        </div>
      </div>
      <div className="event-card-body">
        <p className="event-card-name" style={{ fontSize: 16 }}>{evento.nome}</p>
        <div className="event-card-meta">
          <MapPin size={12} />
          <span>{evento.local.nome}</span>
        </div>
      </div>
    </div>
  )
}

// Card destaque (Essa Noite — ocupa largura total)
function EventCardFeatured({ evento, onPress }) {
  return (
    <div
      className="event-card"
      style={{ cursor: 'pointer' }}
      onClick={() => onPress?.(evento.id)}
    >
      <div style={{ position: 'relative' }}>
        <img className="event-card-image" src={evento.imagem_url} alt={evento.nome} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 30%, transparent)' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <CategoryBadge categoria={evento.categoria} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginTop: 8, marginBottom: 4 }}>
            {evento.nome}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Clock size={12} />
            <span>
              {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>·</span>
            <span>{evento.local.nome}</span>
          </div>
          {evento.amigos_vao > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Users size={12} />
              <span>+{evento.amigos_vao} vão</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Card pequeno para grid (Sob o Radar)
function EventCardSmall({ evento, onPress }) {
  return (
    <div
      className="event-card"
      style={{ cursor: 'pointer' }}
      onClick={() => onPress?.(evento.id)}
    >
      <img
        className="event-card-image"
        src={evento.imagem_url}
        alt={evento.nome}
        style={{ aspectRatio: '1/1' }}
      />
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>
          {evento.nome}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{evento.local.bairro}</p>
      </div>
    </div>
  )
}

// Card de roteiro curado
function CuratedTourCard({ roteiro, onPress }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(255,58,140,0.06))',
        border: '1px solid rgba(123,97,255,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
      }}
      onClick={() => onPress?.(roteiro.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img src={roteiro.curador_avatar} alt={roteiro.curador_nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>{roteiro.titulo}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>por {roteiro.curador_nome}</p>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
        {roteiro.descricao}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {roteiro.paradas.length} paradas · ~{Math.round(roteiro.duracao_total_min / 60)}h {roteiro.duracao_total_min % 60}min
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--accent-primary)',
          fontSize: 13,
          fontWeight: 600,
        }}>
          Ver roteiro <ChevronRight size={14} />
        </div>
      </div>
    </div>
  )
}

// ── Home Component ──────────────────────────────────────────────

export default function Home({ onNavigate }) {
  const { eventos: todosEventos, roteiros } = eventos

  const aoVivo = todosEventos.filter(e => e.ao_vivo)
  const essaNoite = todosEventos.filter(e => !e.ao_vivo).slice(0, 1)[0]
  const sobORadar = todosEventos.filter(e => !e.ao_vivo).slice(1, 4)
  const roteiroCurado = roteiros[0]

  const handleEventoPress = (id) => onNavigate?.('event-detail', { id })
  const handleRoteiroPress = (id) => onNavigate?.('curated-tour', { id })

  return (
    <div style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 24px)' }}>

      {/* ── Header ── */}
      <div style={{ padding: '56px 16px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Salvador ▾
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
            O que está<br />acontecendo<br />agora?
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
          <button className="btn-icon"><Bell size={18} /></button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 16px',
        }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>🔍</span>
          <span style={{ fontSize: 15, color: 'var(--text-tertiary)', flex: 1 }}>Buscar eventos, lugares, pessoas...</span>
          <SlidersHorizontal size={16} color="var(--text-tertiary)" />
        </div>
      </div>

      {/* ── Acontecendo Agora ── */}
      {aoVivo.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Acontecendo agora
            </p>
            <LiveBadge />
          </div>
          <div className="scroll-x" style={{ paddingLeft: 16, paddingRight: 16 }}>
            {aoVivo.map(evento => (
              <EventCardLarge key={evento.id} evento={evento} onPress={handleEventoPress} />
            ))}
          </div>
        </section>
      )}

      {/* ── Essa Noite ── */}
      {essaNoite && (
        <section style={{ padding: '0 16px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Essa noite
            </p>
            <button style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 500 }}>Ver tudo</button>
          </div>
          <EventCardFeatured evento={essaNoite} onPress={handleEventoPress} />
        </section>
      )}

      {/* ── Sob o Radar ── */}
      {sobORadar.length > 0 && (
        <section style={{ padding: '0 16px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Sob o radar
            </p>
            <button style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 500 }}>Ver tudo</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {sobORadar.map(evento => (
              <EventCardSmall key={evento.id} evento={evento} onPress={handleEventoPress} />
            ))}
          </div>
        </section>
      )}

      {/* ── Curado Esta Noite ── */}
      {roteiroCurado && (
        <section style={{ padding: '0 16px', marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Curado esta noite
          </p>
          <CuratedTourCard roteiro={roteiroCurado} onPress={handleRoteiroPress} />
        </section>
      )}

    </div>
  )
}
