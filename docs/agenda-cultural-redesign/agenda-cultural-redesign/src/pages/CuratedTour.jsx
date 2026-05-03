/**
 * CuratedTour.jsx — Roteiro Curado
 *
 * Layout:
 * - Header com nome do roteiro e curador
 * - Timeline vertical de paradas com deslocamentos
 * - Totais (paradas, duração)
 * - Botão "Iniciar roteiro"
 *
 * Props:
 *   roteiroId: string
 *   onBack: () => void
 *   onStart: () => void
 *   onEventoPress: (id) => void
 */

import { ArrowLeft, Share2, MapPin, Clock, Footprints } from 'lucide-react'
import data from '../data/mock.json'

const MODO_ICONE = {
  a_pe: '🚶',
  onibus: '🚌',
  taxi: '🚕',
  uber: '🚗',
}

const MODO_LABEL = {
  a_pe: 'a pé',
  onibus: 'de ônibus',
  taxi: 'de táxi',
  uber: 'de Uber',
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

function formatarDuracao(min) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function CuratedTour({ roteiroId, onBack, onStart, onEventoPress }) {
  const roteiro = data.roteiros.find(r => r.id === roteiroId) || data.roteiros[0]
  const totalMin = roteiro.duracao_total_min + roteiro.paradas.reduce((acc, p) => acc + (p.deslocamento_proximo_min || 0), 0)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120 }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <button className="btn-icon" onClick={onBack}><ArrowLeft size={18} /></button>
          <button className="btn-icon"><Share2 size={18} /></button>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          {roteiro.titulo}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          por <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{roteiro.curador_nome}</span>
        </p>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {roteiro.descricao}
        </p>
      </div>

      {/* ── Timeline ── */}
      <div style={{ padding: '0 16px', position: 'relative' }}>

        {/* Linha vertical */}
        <div style={{
          position: 'absolute',
          left: 32,
          top: 0,
          bottom: 80,
          width: 1,
          background: 'var(--border-medium)',
        }} />

        {roteiro.paradas.map((parada, idx) => {
          const evento = data.eventos.find(e => e.id === parada.evento_id)
          if (!evento) return null
          const cor = CORES_CATEGORIA[evento.categoria] || '#9B9991'
          const isUltima = idx === roteiro.paradas.length - 1

          return (
            <div key={parada.evento_id}>
              {/* Parada */}
              <div
                style={{ display: 'flex', gap: 16, marginBottom: parada.deslocamento_proximo_min ? 0 : 24, cursor: 'pointer' }}
                onClick={() => onEventoPress?.(evento.id)}
              >
                {/* Coluna esquerda: horário + dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, whiteSpace: 'nowrap' }}>
                    {parada.horario}
                  </p>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: cor,
                    border: '2px solid var(--bg-base)',
                    flexShrink: 0,
                    zIndex: 1,
                  }} />
                </div>

                {/* Card do evento */}
                <div style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  marginBottom: 0,
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img src={evento.imagem_url} alt={evento.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: cor,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {evento.categoria}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, lineHeight: 1.25, margin: '3px 0' }}>
                      {evento.nome}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      <MapPin size={10} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evento.local.nome}
                      </span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{formatarDuracao(parada.duracao_min)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deslocamento para próxima parada */}
              {!isUltima && parada.deslocamento_proximo_min > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 0 12px 48px',
                  color: 'var(--text-tertiary)',
                  fontSize: 13,
                }}>
                  <span style={{ fontSize: 16 }}>{MODO_ICONE[parada.modo_deslocamento]}</span>
                  <span>{parada.deslocamento_proximo_min} min {MODO_LABEL[parada.modo_deslocamento]}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Totais ── */}
      <div style={{
        margin: '24px 16px',
        padding: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        justifyContent: 'center',
        gap: 32,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500 }}>
            {roteiro.paradas.length}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>paradas</p>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500 }}>
            {formatarDuracao(totalMin)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>duração total</p>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500 }}>
            {roteiro.paradas.reduce((acc, p) => acc + (p.deslocamento_proximo_min || 0), 0)} min
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>deslocamento</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '0 16px' }}>
        <button
          className="btn-primary"
          style={{ width: '100%', padding: '18px' }}
          onClick={onStart}
        >
          ▶ Iniciar roteiro
        </button>
      </div>

    </div>
  )
}
