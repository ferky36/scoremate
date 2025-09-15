# Rencana Migrasi app.js → React

Dokumen ini memetakan bagian-bagian besar dari `app.js` monolit Anda ke modul React yang terpisah,
plus langkah bertahap agar risiko kecil dan fitur tetap jalan.

## 1) Pemetaan Modul

**Helper & Utilitas (formatting, parsing, csv, waktu)**
- `fmtMMSS`, `pad`, `toHM`, `csvEscape` → `src/utils/time.js`, `src/utils/csv.js`

**State Global & Event**
- Variabel global: `players`, `waitingList`, `rounds`, `activeEvent`, dll → `src/state/store.js` (Context + useReducer)
- Aksi: tambah/hapus pemain, generate ronde, update skor → reducer

**Players & Waiting List**
- `renderPlayersList`, `addPlayer`, `removePlayerFromRounds`, `upsertPlayerMeta` → `src/components/PlayersPanel.jsx`, `src/components/WaitingList.jsx` + aksi reducer
- Keyboard paste / dedup / normalisasi nama → TODO di `PlayersPanel.jsx`

**Ronde & Pertandingan**
- `applyRound`, `pickFourForRound`, `ensureRoundsLengthForAllCourts`, `commitScoreToRound` → `src/components/RoundsPanel.jsx` + aksi `UPDATE_SCORE`
- Algoritma pairing sekarang *placeholder* di `makeMatches()` → ganti dengan logika Anda (hindari pengulangan pasangan, fairness, dsb).

**Klasemen**
- Perhitungan poin, selisih, menang/kalah → `src/components/StandingsPanel.jsx` (derived dari `rounds`)

**UI/UX**
- `renderHeaderChips`, `updateAdminButtonsVisibility`, `openScoreModal`, `closeScoreModal` → `Header.jsx`, `ScoreModal.jsx`
- Responsif tabel ronde (add-on) → gunakan `.court-wrapper` + Tailwind utilities

**Supabase / Cloud Mode**
- `createEventIfNotExists`, `fetchEventMetaFromDB`, `delete_event RPC`, `sb.auth` → `src/services/supabaseClient.js` + hook `useSupabaseAuth.js`
- Pindahkan panggilan RPC ke modul `src/services/eventsApi.js` bila siap (belum dibuat di skeleton).

**Storage**
- `localStorage` autosave → `src/hooks/useAutosave.js`

## 2) Tahapan Migrasi (disarankan)

1. **Porting utilitas murni**: pindahkan helper tanpa DOM ke `src/utils/*`.
2. **Buat Store**: definisikan shape state dan aksi di `src/state/store.js`.
3. **Players Panel**: migrasi daftar pemain + waiting list ke React.
4. **Ronde**: migrasi struktur `rounds` + input skor. Sementara gunakan pairing sederhana (placeholder).
5. **Klasemen**: jadikan derived dari `rounds` saja (hindari penyimpanan ganda).
6. **Supabase**: pasang `@supabase/supabase-js`, isi `.env`, porting login/join-event/get/save.
7. **Fitur Lanjutan**: timer skor, viewer-only mode, link share, role owner, toast, CSV export, drag-sort, dsb.

## 3) Catatan Teknis

- Sambil jalan, ganti semua side-effect DOM (`document.getElementById`, `innerHTML`) menjadi state-driven React.
- Hindari state duplikat: `rounds` adalah sumber kebenaran untuk skor; standings dihitung on-the-fly.
- Tailwind via CDN untuk dev cepat. Nanti bisa pindah ke PostCSS config untuk purging size produksi.

## 4) To-Do Prioritas (ceklist)
- [ ] Port logika pairing Anda dari `applyRound/pickFourForRound` ke `makeMatches()`
- [ ] Mode viewer/score-only: disable kontrol non-skor
- [ ] Modal skor per-match (ScoreModal.jsx) ambil data lewat `ui.scoreModal.matchKey`
- [ ] Supabase client + auth + RPC (install lib resmi)
