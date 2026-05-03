/**
 * App.jsx — Shell principal da aplicação
 *
 * Gerencia:
 * - Onboarding (VibeSelection no primeiro acesso)
 * - Roteamento entre telas (sem react-router, simples para prototipagem)
 * - BottomNav
 *
 * Para produção: substituir o roteamento manual por React Router ou Next.js App Router.
 */

import { useState, useEffect } from 'react'
import { Home as HomeIcon, Compass, Map, User } from 'lucide-react'

import Home from './pages/Home'
import VibeSelection from './pages/VibeSelection'
import EventDetail from './pages/EventDetail'
import CuratedTour from './pages/CuratedTour'

// ── BottomNav ────────────────────────────────────────────────────
function BottomNav({ ativa, onChange }) {
  const tabs = [
    { id: 'home',    label: 'Home',    Icon: HomeIcon },
    { id: 'explore', label: 'Explore', Icon: Compass },
    { id: 'map',     label: 'Mapa',    Icon: Map },
    { id: 'profile', label: 'Perfil',  Icon: User },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item ${ativa === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon size={22} className="icon" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [vibeFeito, setVibeFeito] = useState(false)
  const [tela, setTela] = useState('home')   // 'home' | 'explore' | 'map' | 'profile'
  const [modal, setModal] = useState(null)   // { type: 'event-detail' | 'curated-tour', params }
  const [tabAtiva, setTabAtiva] = useState('home')

  // Verificar se o usuário já fez onboarding de vibe
  useEffect(() => {
    const savedVibe = localStorage.getItem('user_vibe')
    if (savedVibe) {
      const { timestamp } = JSON.parse(savedVibe)
      // Revisar após 6 horas
      if (Date.now() - timestamp < 6 * 60 * 60 * 1000) {
        setVibeFeito(true)
      }
    }
  }, [])

  const handleVibeComplete = (vibe) => {
    setVibeFeito(true)
  }

  const handleNavigate = (tipo, params) => {
    setModal({ type: tipo, params })
  }

  const handleTabChange = (tab) => {
    setTabAtiva(tab)
    setModal(null)
  }

  // Onboarding
  if (!vibeFeito) {
    return (
      <>
        <link rel="stylesheet" href="/src/styles/globals.css" />
        <VibeSelection onComplete={handleVibeComplete} />
      </>
    )
  }

  // Modal / tela de detalhe
  if (modal?.type === 'event-detail') {
    return (
      <>
        <link rel="stylesheet" href="/src/styles/globals.css" />
        <EventDetail
          eventoId={modal.params.id}
          onBack={() => setModal(null)}
        />
      </>
    )
  }

  if (modal?.type === 'curated-tour') {
    return (
      <>
        <link rel="stylesheet" href="/src/styles/globals.css" />
        <CuratedTour
          roteiroId={modal.params.id}
          onBack={() => setModal(null)}
          onStart={() => setModal({ type: 'tour-in-progress', params: modal.params })}
          onEventoPress={(id) => setModal({ type: 'event-detail', params: { id } })}
        />
      </>
    )
  }

  // Telas principais
  return (
    <>
      <link rel="stylesheet" href="/src/styles/globals.css" />
      <main>
        {tabAtiva === 'home' && (
          <Home onNavigate={handleNavigate} />
        )}
        {tabAtiva === 'explore' && (
          <div style={{ padding: '60px 16px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>Explore</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Em construção — ver Explore.jsx</p>
          </div>
        )}
        {tabAtiva === 'map' && (
          <div style={{ padding: '60px 16px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>Mapa</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Em construção — ver Map.jsx</p>
          </div>
        )}
        {tabAtiva === 'profile' && (
          <div style={{ padding: '60px 16px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>Perfil</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Em construção — ver Profile.jsx</p>
          </div>
        )}
      </main>
      <BottomNav ativa={tabAtiva} onChange={handleTabChange} />
    </>
  )
}
