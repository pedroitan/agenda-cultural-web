/**
 * VibeSelection.jsx — Onboarding de vibe
 *
 * Aparece no primeiro acesso ou ao editar vibe no perfil.
 * Salva a seleção em localStorage com timestamp.
 * Após seleção, redireciona para Home.
 */

import { useState } from 'react'
import data from '../data/mock.json'

const VIBE_ICONS = {
  chill:      '🍃',
  energetico: '⚡',
  cultural:   '🎭',
  curioso:    '💡',
  romantico:  '❤️',
  aventureiro:'⛰️',
  surpresa:   '✨',
}

export default function VibeSelection({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const { vibes } = data

  const handleSelect = (vibeId) => {
    setSelected(vibeId)
    // Salvar no localStorage
    localStorage.setItem('user_vibe', JSON.stringify({
      vibe: vibeId,
      timestamp: Date.now(),
    }))
    // Redirecionar após pequeno delay (feedback visual)
    setTimeout(() => onComplete?.(vibeId), 350)
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '60px 24px 40px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: 12,
        }}>
          Qual é a sua<br />vibe hoje?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Vamos personalizar sua experiência
        </p>
      </div>

      {/* Grid de vibes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        flex: 1,
      }}>
        {vibes.filter(v => v.id !== 'surpresa').map(vibe => (
          <button
            key={vibe.id}
            className={`vibe-chip ${selected === vibe.id ? 'selected' : ''}`}
            style={{
              '--vibe-cor': vibe.cor,
              borderColor: selected === vibe.id ? vibe.cor : undefined,
              boxShadow: selected === vibe.id ? `0 0 20px ${vibe.cor}33` : undefined,
            }}
            onClick={() => handleSelect(vibe.id)}
          >
            <span style={{ fontSize: 28 }}>{VIBE_ICONS[vibe.id]}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
              {vibe.label}
            </span>
          </button>
        ))}
      </div>

      {/* Surpreenda-me — full width */}
      <button
        className={`vibe-chip ${selected === 'surpresa' ? 'selected' : ''}`}
        style={{
          marginTop: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
          padding: '20px',
          borderColor: selected === 'surpresa' ? '#F59E0B' : undefined,
          boxShadow: selected === 'surpresa' ? '0 0 20px rgba(245,158,11,0.3)' : undefined,
        }}
        onClick={() => handleSelect('surpresa')}
      >
        <span style={{ fontSize: 22 }}>✨</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
          Surpreenda-me
        </span>
      </button>
    </div>
  )
}
