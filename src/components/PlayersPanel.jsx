import React, { useState } from 'react'
import { useStore } from '../state/store.jsx'
import WaitingList from './WaitingList.jsx'

export default function PlayersPanel(){
  const { state, dispatch, actions } = useStore()
  const [name, setName] = useState('')
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="card">
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="Tambah pemain" value={name}
                   onChange={e=>setName(e.target.value)}
                   onKeyDown={e=>{ if (e.key==='Enter'){ dispatch({type:actions.ADD_PLAYER, payload:name}); setName('') }}}/>
            <button className="btn" onClick={()=>{dispatch({type:actions.ADD_PLAYER, payload:name}); setName('')}}>Tambah</button>
          </div>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {state.players.map(p => (
              <li key={p} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow">
                <span>{p}</span>
                <button className="text-red-600 hover:underline" onClick={()=>dispatch({type:actions.REMOVE_PLAYER, payload:p})}>hapus</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <WaitingList />
    </div>
  )
}
