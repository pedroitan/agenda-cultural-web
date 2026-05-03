/**
 * EventDetail.jsx — Página de Evento
 *
 * Layout:
 * - Hero full-bleed (60vh)
 * - Conteúdo scrollável: nome, tags, data/local, preço, amigos, sobre, mapa inline
 * - CTA bar fixa: compartilhar + salvar + comprar ingressos
 *
 * Props:
 *   eventoId: string
 *   onBack: () => void
 */

import { useState } from 'react'
import { ArrowLeft, Heart, Share2, Calendar, MapPin, DollarSign, Users, ChevronDown } from 'lucide-react'
import data from '../data/mock.json'

function formatarData(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function tempoAteEvento(iso) {
  const diff = new Date(iso) - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) return null
  return `Começa em ${h}h ${m}min`
}

const CORES_CATEGORIA = {
  musica: '#FF6B6B',
  teatro: '#A855F7',
  arte: '#F59E0B',
  outdoor: '#10B981',
  talks: '#3B82F6',
  experimental: '#EC4899',
  gastronomia: '#F97316',
}

export default function EventDetail({ eventoId, onBack }) {
  const [saved, setSaved] = useState(false)
  const [descricaoExpandida, setDescricaoExpandida] = useState(false)

  const evento = data.eventos.find(e => e.id === eventoId) || data.eventos[0]
  const corCategoria = CORES_CATEGORIA[evento.categoria] || '#9B9991'
  const urgencia = tempoAteEvento(evento.data_inicio)

  const temIngresso = !!evento.link_ingresso
  const isGratis = !evento.preco_min && !evento.preco_max

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120 }}>

      {/* ── Hero ── */}
      <div className="hero-image-container">
        <img
          className="hero-image"
          src={evento.imagem_url}
          alt={evento.nome}
        />
        <div className="hero-image-overlay" />

        {/* Ações no topo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '52px 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button className="btn-icon" onClick={onBack} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-icon"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => setSaved(!saved)}
            >
              <Heart size={18} fill={saved ? '#FF3A8C' : 'none'} color={saved ? '#FF3A8C' : 'white'} />
            </button>
            <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Badge de categoria */}
        <div style={{ position: 'absolute', bottom: 20, left: 16 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '9999px',
            background: `${corCategoria}33`,
            color: corCategoria,
            border: `1px solid ${corCategoria}66`,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {evento.categoria}
          </span>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ padding: '24px 16px 0' }}>

        {/* Nome */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          {evento.nome}
        </h1>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {evento.tags?.map(tag => (
            <span key={tag} style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Infos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

          {/* Data */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Calendar size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>
                {formatarData(evento.data_inicio)} · {formatarHora(evento.data_inicio)} – {formatarHora(evento.data_fim)}
              </p>
              {urgencia && (
                <p style={{ fontSize: 13, color: '#FF3A8C', fontWeight: 600, marginTop: 2 }}>
                  {urgencia}
                </p>
              )}
            </div>
          </div>

          {/* Local */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <MapPin size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>{evento.local.nome}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {evento.local.endereco}, Salvador
              </p>
            </div>
          </div>

          {/* Preço */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DollarSign size={18} color="var(--accent-primary)" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>
                {isGratis ? 'Entrada gratuita' : `R$${evento.preco_min} – R$${evento.preco_max}`}
              </p>
              {!isGratis && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Taxas não incluídas
                </p>
              )}
            </div>
          </div>

          {/* Amigos */}
          {evento.amigos_vao > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Users size={18} color="var(--accent-primary)" />
              <p style={{ fontSize: 15 }}>
                <span style={{ fontWeight: 600 }}>{evento.amigos_vao} pessoas</span>
                <span style={{ color: 'var(--text-secondary)' }}> confirmadas</span>
              </p>
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '24px 0' }} />

        {/* Sobre */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Sobre
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {descricaoExpandida ? evento.descricao : `${evento.descricao.slice(0, 100)}...`}
          </p>
          {evento.descricao.length > 100 && (
            <button
              onClick={() => setDescricaoExpandida(!descricaoExpandida)}
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 14,
                color: 'var(--accent-primary)',
                fontWeight: 600,
              }}
            >
              {descricaoExpandida ? 'Menos' : 'Ler mais'}
              <ChevronDown size={14} style={{ transform: descricaoExpandida ? 'rotate(180deg)' : 'none', transition: '150ms' }} />
            </button>
          )}
        </section>

        {/* Separador */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '24px 0' }} />

        {/* Local (mapa placeholder) */}
        <section>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Local
          </h3>
          <div style={{
            height: 160,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            fontSize: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Aqui vai o mapa Mapbox */}
            <div style={{ textAlign: 'center' }}>
              <MapPin size={24} style={{ margin: '0 auto 8px' }} />
              <p>{evento.local.nome}</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>{evento.local.bairro}</p>
            </div>
            <div style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: 'var(--accent-primary)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '9999px',
            }}>
              Abrir no Maps
            </div>
          </div>
        </section>

      </div>

      {/* ── CTA Bar (fixa) ── */}
      <div className="cta-bar">
        <button className="btn-icon">
          <Share2 size={18} />
        </button>
        <button
          className="btn-icon"
          onClick={() => setSaved(!saved)}
        >
          <Heart size={18} fill={saved ? '#FF3A8C' : 'none'} color={saved ? '#FF3A8C' : undefined} />
        </button>
        <button
          className="btn-primary"
          onClick={() => evento.link_ingresso && window.open(evento.link_ingresso, '_blank')}
          disabled={!temIngresso && !isGratis}
        >
          {isGratis ? '✓ Evento gratuito' : temIngresso ? '⚡ Comprar ingressos' : 'Ingressos indisponíveis'}
        </button>
      </div>

    </div>
  )
}
