import React from 'react'
import Header from './components/Header.jsx'
import EventBar from './components/EventBar.jsx'
import PlayersPanel from './components/PlayersPanel.jsx'
import RoundsPanel from './components/RoundsPanel.jsx'
import StandingsPanel from './components/StandingsPanel.jsx'
import ScoreModal from './components/ScoreModal.jsx'

export default function App(){
  const [dark, setDark] = React.useState(false)
  React.useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Simple utility classes
  React.useEffect(()=>{
    const style = document.createElement('style')
    style.textContent = `
      .btn { @apply px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700; }
      .input { @apply px-3 py-2 rounded-md bg-white/80 border border-gray-300 dark:bg-gray-800 dark:border-gray-700; }
      .card { @apply bg-white dark:bg-gray-800 rounded-2xl shadow p-4; }
      .chip { @apply inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur; }
      .court-wrapper { overflow-x:auto; -webkit-overflow-scrolling:touch; }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  const [tab, setTab] = React.useState('players')

  return (
    <div>
      <Header />
      <EventBar />

      <main>
        {/* We'll select panels by reading global store inside each component */}
        <PlayersPanel />
        <RoundsPanel />
        <StandingsPanel />
      </main>

      <div className="fixed bottom-4 right-4">
        <button className="btn" onClick={()=>setDark(v=>!v)}>{dark ? '☀️' : '🌙'}</button>
      </div>

      <ScoreModal />
    </div>
  )
}
