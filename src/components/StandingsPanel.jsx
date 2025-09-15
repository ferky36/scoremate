import React, { useMemo } from 'react'
import { useStore } from '../state/store.jsx'

export default function StandingsPanel(){
  const { state } = useStore()
  const standings = useMemo(()=>{
    const map = Object.fromEntries(state.players.map(p => [p, { name:p, played:0, pts:0, win:0, lose:0, diff:0 } ]))
    for (const r of state.rounds){
      for (const m of r.matches){
        if (m.scoreA==null || m.scoreB==null) continue
        const a = m.a, b = m.b
        const aPts = Number(m.scoreA)||0, bPts = Number(m.scoreB)||0
        const aWin = aPts > bPts
        const bWin = bPts > aPts
        for (const n of a){
          const s = map[n] || (map[n] = { name:n, played:0, pts:0, win:0, lose:0, diff:0 })
          s.played++; s.pts += aPts; s.diff += (aPts - bPts); if (aWin) s.win++; if (bWin) s.lose++
        }
        for (const n of b){
          const s = map[n] || (map[n] = { name:n, played:0, pts:0, win:0, lose:0, diff:0 })
          s.played++; s.pts += bPts; s.diff += (bPts - aPts); if (bWin) s.win++; if (aWin) s.lose++
        }
      }
    }
    return Object.values(map).sort((x,y) => (y.pts - x.pts) || (y.diff - x.diff) || (y.win - x.win) || x.name.localeCompare(y.name))
  }, [state.players, state.rounds])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="card">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-2 py-1">#</th>
              <th className="text-left px-2 py-1">Nama</th>
              <th className="px-2 py-1">Main</th>
              <th className="px-2 py-1">Menang</th>
              <th className="px-2 py-1">Kalah</th>
              <th className="px-2 py-1">Selisih</th>
              <th className="px-2 py-1">Poin</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s,i)=>(
              <tr key={s.name} className={`border-t ${i===0?'rank-1':''} ${i===1?'rank-2':''} ${i===2?'rank-3':''}`}>
                <td className="px-2 py-1">{i+1}</td>
                <td className="px-2 py-1 text-left">{s.name}</td>
                <td className="px-2 py-1 text-center">{s.played}</td>
                <td className="px-2 py-1 text-center">{s.win}</td>
                <td className="px-2 py-1 text-center">{s.lose}</td>
                <td className="px-2 py-1 text-center">{s.diff}</td>
                <td className="px-2 py-1 text-center font-semibold">{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
