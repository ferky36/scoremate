import React from 'react'
import { useStore } from '../state/store.jsx'

export default function ScoreModal(){
  const { state, dispatch, actions } = useStore()
  if (!state.ui.scoreModal.open) return null
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full max-w-md">
        <div className="font-semibold mb-2">Input Skor</div>
        <p className="text-sm opacity-80 mb-4">TODO: wire match details here.</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={()=>dispatch({type:actions.CLOSE_SCORE_MODAL})}>Tutup</button>
        </div>
      </div>
    </div>
  )
}
