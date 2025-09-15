import React, { useState } from 'react'
import { useStore } from '../state/store.jsx'

export default function WaitingList(){
  const { state, dispatch, actions } = useStore()
  const [name, setName] = useState('')
  return (
    <div>
      <div className="card">
        <h3 className="font-semibold mb-2">Waiting List</h3>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" placeholder="Nama pemain waiting list" value={name}
                 onChange={e=>setName(e.target.value)}
                 onKeyDown={e=>{ if (e.key==='Enter'){ dispatch({type:actions.ADD_WAITING, payload:name}); setName('') }}}/>
          <button className="btn" onClick={()=>{dispatch({type:actions.ADD_WAITING, payload:name}); setName('')}}>Tambah</button>
        </div>
        <ul className="space-y-2">
          {state.waitingList.map(p => (
            <li key={p} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow">
              <span>{p}</span>
              <button className="text-red-600 hover:underline" onClick={()=>dispatch({type:actions.REMOVE_WAITING, payload:p})}>hapus</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
