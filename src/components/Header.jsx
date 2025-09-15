import React from 'react'
import { useStore } from '../state/store.jsx'

export default function Header(){
  const { state, dispatch, actions } = useStore()
  const { event, ui } = state
  return (
    <header className="sticky top-0 z-10 shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/10 grid place-items-center shadow">
              <span className="text-2xl md:text-3xl">🎾</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{event.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-white/90">
                {event.location ? <span className="chip">{event.location}</span> : null}
                {event.date ? <span className="chip">{new Date(event.date).toLocaleDateString('id-ID')}</span> : null}
                <span className="chip">Court: {event.courts}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded-md ${ui.tab==='players'?'bg-white text-black':'bg-white/15'}`} onClick={()=>dispatch({type:actions.SET_TAB,payload:'players'})}>Pemain</button>
            <button className={`px-3 py-2 rounded-md ${ui.tab==='rounds'?'bg-white text-black':'bg-white/15'}`} onClick={()=>dispatch({type:actions.SET_TAB,payload:'rounds'})}>Ronde</button>
            <button className={`px-3 py-2 rounded-md ${ui.tab==='standings'?'bg-white text-black':'bg-white/15'}`} onClick={()=>dispatch({type:actions.SET_TAB,payload:'standings'})}>Klasemen</button>
          </div>
        </div>
      </div>
    </header>
  )
}
