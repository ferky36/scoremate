import React, { createContext, useContext, useReducer, useMemo } from 'react'

const initialState = {
  event: {
    id: null,
    name: 'Event Padel/Tennis',
    date: null,
    location: null,
    courts: 2
  },
  ui: {
    theme: 'light',
    tab: 'players', // 'players' | 'rounds' | 'standings'
    scoreModal: { open: false, matchKey: null }
  },
  players: [],
  waitingList: [],
  rounds: [], // [{ roundNo, matches: [{ court: 1, a: [p1,p2], b: [p3,p4], scoreA:0, scoreB:0, finished:false }] }]
}

const actions = {
  SET_EVENT: 'SET_EVENT',
  SET_TAB: 'SET_TAB',
  ADD_PLAYER: 'ADD_PLAYER',
  REMOVE_PLAYER: 'REMOVE_PLAYER',
  ADD_WAITING: 'ADD_WAITING',
  REMOVE_WAITING: 'REMOVE_WAITING',
  GENERATE_ROUNDS: 'GENERATE_ROUNDS',
  UPDATE_SCORE: 'UPDATE_SCORE',
  OPEN_SCORE_MODAL: 'OPEN_SCORE_MODAL',
  CLOSE_SCORE_MODAL: 'CLOSE_SCORE_MODAL'
}

function makeMatches(players, courts = 2){
  // Simple first-pass pairing algorithm (placeholder).
  // TODO: replace with your existing "applyRound/pickFourForRound" logic.
  const names = players.filter(Boolean).slice()
  const perRound = courts * 4
  const rounds = []
  let idx = 0, roundNo = 1
  while (idx + perRound <= names.length){
    const take = names.slice(idx, idx + perRound)
    const matches = []
    for (let c=0;c<courts;c++){
      const base = c*4
      const a = [ take[base], take[base+1] ]
      const b = [ take[base+2], take[base+3] ]
      matches.push({ court: c+1, a, b, scoreA: 0, scoreB: 0, finished: false })
    }
    rounds.push({ roundNo: roundNo++, matches })
    idx += perRound
  }
  return rounds
}

function reducer(state, action){
  switch(action.type){
    case actions.SET_EVENT:
      return { ...state, event: { ...state.event, ...action.payload } }
    case actions.SET_TAB:
      return { ...state, ui: { ...state.ui, tab: action.payload } }
    case actions.ADD_PLAYER: {
      const name = String(action.payload||'').trim()
      if (!name) return state
      if (state.players.includes(name)) return state
      return { ...state, players: [...state.players, name] }
    }
    case actions.REMOVE_PLAYER: {
      const name = action.payload
      return { ...state, players: state.players.filter(p => p!==name) }
    }
    case actions.ADD_WAITING: {
      const name = String(action.payload||'').trim()
      if (!name) return state
      if (state.waitingList.includes(name)) return state
      return { ...state, waitingList: [...state.waitingList, name] }
    }
    case actions.REMOVE_WAITING: {
      const name = action.payload
      return { ...state, waitingList: state.waitingList.filter(p => p!==name) }
    }
    case actions.GENERATE_ROUNDS: {
      const rounds = makeMatches(state.players, state.event.courts)
      return { ...state, rounds }
    }
    case actions.UPDATE_SCORE: {
      const { roundNo, court, scoreA, scoreB, finished } = action.payload
      const rounds = state.rounds.map(r => {
        if (r.roundNo !== roundNo) return r
        const matches = r.matches.map(m => {
          if (m.court !== court) return m
          return { ...m, scoreA, scoreB, finished }
        })
        return { ...r, matches }
      })
      return { ...state, rounds }
    }
    case actions.OPEN_SCORE_MODAL:
      return { ...state, ui: { ...state.ui, scoreModal: { open: true, matchKey: action.payload } } }
    case actions.CLOSE_SCORE_MODAL:
      return { ...state, ui: { ...state.ui, scoreModal: { open: false, matchKey: null } } }
    default:
      return state
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(()=>({ state, dispatch, actions }), [state])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore(){
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
