import React from 'react'
import { useStore } from '../state/store.jsx'

export default function RoundsPanel(){
  const { state, dispatch, actions } = useStore()
  const { rounds } = state
  if (!rounds.length){
    return <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600">Belum ada ronde. Klik <b>Generate Ronde</b>.</div>
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {rounds.map(r => (
        <div key={r.roundNo} className="card">
          <div className="mb-3 font-semibold">Ronde {r.roundNo}</div>
          <div className="court-wrapper">
            <table className="w-full text-center">
              <thead>
                <tr>
                  <th className="px-2 py-1">Court</th>
                  <th className="px-2 py-1">Pair A</th>
                  <th className="px-2 py-1">Pair B</th>
                  <th className="px-2 py-1">Skor</th>
                </tr>
              </thead>
              <tbody>
                {r.matches.map(m => (
                  <tr key={m.court} className="border-t">
                    <td className="px-2 py-1">{m.court}</td>
                    <td className="px-2 py-1">{m.a.join(' & ')}</td>
                    <td className="px-2 py-1">{m.b.join(' & ')}</td>
                    <td className="px-2 py-1">
                      <input type="number" className="input w-16 inline-block"
                             value={m.scoreA}
                             onChange={e=>dispatch({type:actions.UPDATE_SCORE, payload:{ roundNo:r.roundNo, court:m.court, scoreA:Number(e.target.value), scoreB:m.scoreB, finished:m.finished }})}/>
                      <span className="px-2">-</span>
                      <input type="number" className="input w-16 inline-block"
                             value={m.scoreB}
                             onChange={e=>dispatch({type:actions.UPDATE_SCORE, payload:{ roundNo:r.roundNo, court:m.court, scoreA:m.scoreA, scoreB:Number(e.target.value), finished:m.finished }})}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
