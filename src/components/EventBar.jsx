import React from 'react'
import { useStore } from '../state/store.jsx'

export default function EventBar(){
  const { state, dispatch, actions } = useStore()
  const { event } = state
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
      <input className="input" placeholder="Nama event" value={event.name}
             onChange={e=>dispatch({type:actions.SET_EVENT, payload:{ name: e.target.value }})}/>
      <input type="date" className="input" value={event.date||''}
             onChange={e=>dispatch({type:actions.SET_EVENT, payload:{ date: e.target.value }})}/>
      <input className="input" placeholder="Lokasi" value={event.location||''}
             onChange={e=>dispatch({type:actions.SET_EVENT, payload:{ location: e.target.value }})}/>
      <select className="input" value={event.courts}
              onChange={e=>dispatch({type:actions.SET_EVENT, payload:{ courts: Number(e.target.value) }})}>
        <option value="1">1 court</option>
        <option value="2">2 court</option>
        <option value="3">3 court</option>
        <option value="4">4 court</option>
      </select>
      <button className="btn" onClick={()=>dispatch({type:actions.GENERATE_ROUNDS})}>Generate Ronde</button>
    </div>
  )
}
