import React, { createContext, useContext, useReducer, useMemo } from 'react'

/* =========================
   STATE & ACTIONS
========================= */

const initialState = {
  event: {
    id: null,
    name: 'Event Padel/Tennis',
    date: null,
    location: null,
    courts: 2,
  },
  ui: {
    theme: 'light',
    tab: 'players', // 'players' | 'rounds' | 'standings'
    scoreModal: { open: false, matchKey: null },
  },
  players: [],
  waitingList: [],
  // rounds: [{ roundNo, matches: [{ court, a:[p1,p2], b:[p3,p4], scoreA, scoreB, finished }] }]
  rounds: [],
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
  CLOSE_SCORE_MODAL: 'CLOSE_SCORE_MODAL',
}

/* =========================
   PAIRING UTILITIES
   - Menghindari partner berulang selama masih memungkinkan
   - Memakai history dari rounds sebelumnya
========================= */

function shuffle(arr) {
  // Fisher–Yates
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pairKey(p1, p2) {
  // key berarah independen (A-B == B-A)
  return p1 < p2 ? `${p1}—${p2}` : `${p2}—${p1}`
}

function buildPartnerHistory(prevRounds = []) {
  const history = new Set()
  for (const r of prevRounds) {
    for (const m of r.matches || []) {
      const all = [...(m.a || []), ...(m.b || [])]
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          history.add(pairKey(all[i], all[j]))
        }
      }
    }
  }
  return history
}

function willRepeatPartner(history, team) {
  if (!team || team.length !== 2) return false
  return history.has(pairKey(team[0], team[1]))
}

/**
 * makeMatches(players, courts, prevRounds)
 * - players: array nama pemain aktif
 * - courts: jumlah court per ronde
 * - prevRounds: dipakai untuk membangun history pasangan (agar tidak berulang)
 *
 * Strategi:
 * 1) Tentukan jumlah pemain per ronde = courts * 4
 * 2) Untuk tiap ronde, coba beberapa kali shuffle sampai komposisi tiap pasangan (A-B dan C-D per court)
 *    belum pernah terjadi di history. Jika buntu (terlalu sempit), izinkan 1-2 pasangan mengulang.
 */
function makeMatches(players, courts = 2, prevRounds = []) {
  const perRound = courts * 4
  const totalRounds = Math.floor(players.length / perRound)
  if (totalRounds <= 0) return []

  const history = buildPartnerHistory(prevRounds)
  const rounds = []

  let pool = players.slice()

  for (let r = 1; r <= totalRounds; r++) {
    // Ambil kandidat 4*Courts pemain untuk ronde ini
    // (Untuk versi sederhana, kita hanya shuffle keseluruhan lalu potong per perRound)
    let attempts = 0
    let found = false
    let matches = []

    while (attempts < 120 && !found) {
      attempts++

      // Ambil blok perRound dari hasil shuffle pool
      const names = shuffle(pool).slice(0, perRound)

      const test = []
      let bad = false

      for (let c = 0; c < courts; c++) {
        const base = c * 4
        const group = names.slice(base, base + 4)
        if (group.length < 4) {
          bad = true
          break
        }
        const a = [group[0], group[1]]
        const b = [group[2], group[3]]

        // Tolak jika partner sudah pernah (selama masih ada alternatif lain)
        if (willRepeatPartner(history, a) || willRepeatPartner(history, b)) {
          bad = true
          break
        }

        test.push({
          court: c + 1,
          a,
          b,
          scoreA: 0,
          scoreB: 0,
          finished: false,
        })
      }

      if (!bad) {
        matches = test
        found = true
      }
    }

    // Jika masih buntu, izinkan pasangan berulang (fallback agar tetap bisa main)
    if (!found) {
      const names = shuffle(pool).slice(0, perRound)
      matches = []
      for (let c = 0; c < courts; c++) {
        const base = c * 4
        const group = names.slice(base, base + 4)
        if (group.length < 4) continue
        const a = [group[0], group[1]]
        const b = [group[2], group[3]]
        matches.push({
          court: c + 1,
          a,
          b,
          scoreA: 0,
          scoreB: 0,
          finished: false,
        })
      }
    }

    // Tambahkan ke hasil dan update history pasangan
    rounds.push({ roundNo: r, matches })
    for (const m of matches) {
      history.add(pairKey(m.a[0], m.a[1]))
      history.add(pairKey(m.b[0], m.b[1]))
    }

    // Rotasi ringan pool: geser beberapa pemain agar komposisi ronde berikutnya variatif
    pool = shuffle(pool)
  }

  return rounds
}

/* =========================
   REDUCER
========================= */

function reducer(state, action) {
  switch (action.type) {
    case actions.SET_EVENT:
      return { ...state, event: { ...state.event, ...action.payload } }

    case actions.SET_TAB:
      return { ...state, ui: { ...state.ui, tab: action.payload } }

    case actions.ADD_PLAYER: {
      const name = String(action.payload || '').trim()
      if (!name) return state
      if (state.players.includes(name)) return state
      return { ...state, players: [...state.players, name] }
    }

    case actions.REMOVE_PLAYER: {
      const name = action.payload
      return { ...state, players: state.players.filter((p) => p !== name) }
    }

    case actions.ADD_WAITING: {
      const name = String(action.payload || '').trim()
      if (!name) return state
      if (state.waitingList.includes(name)) return state
      return { ...state, waitingList: [...state.waitingList, name] }
    }

    case actions.REMOVE_WAITING: {
      const name = action.payload
      return { ...state, waitingList: state.waitingList.filter((p) => p !== name) }
    }

    case actions.GENERATE_ROUNDS: {
      const rounds = makeMatches(state.players, state.event.courts, state.rounds)
      return { ...state, rounds }
    }

    case actions.UPDATE_SCORE: {
      const { roundNo, court, scoreA, scoreB, finished } = action.payload
      const rounds = state.rounds.map((r) => {
        if (r.roundNo !== roundNo) return r
        const matches = r.matches.map((m) => {
          if (m.court !== court) return m
          return { ...m, scoreA, scoreB, finished }
        })
        return { ...r, matches }
      })
      return { ...state, rounds }
    }

    case actions.OPEN_SCORE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, scoreModal: { open: true, matchKey: action.payload } },
      }

    case actions.CLOSE_SCORE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, scoreModal: { open: false, matchKey: null } },
      }

    default:
      return state
  }
}

/* =========================
   CONTEXT HOOKS
========================= */

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch, actions }), [state])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export { actions }
