# ScoreMate React (Skeleton)

## Menjalankan Lokal
1. `npm i`
2. `npm run dev`
3. Buka `http://localhost:5173`

> Tailwind dipakai via CDN agar cepat. Nanti bisa migrasi ke konfigurasi Tailwind resmi.

## Env Supabase (opsional)
Tambahkan file `.env`:
```env
VITE_SUPABASE_URL=YOUR_URL
VITE_SUPABASE_ANON_KEY=YOUR_KEY
```

## Deploy ke GitHub Pages
1. `npm run build`
2. Upload folder `dist/` ke branch `gh-pages` atau atur GitHub Action untuk deploy.
3. Atur repo → Settings → Pages → `gh-pages`.

## Struktur
- `src/state/store.js`: state global (Context + useReducer)
- `src/components/*`: UI modular (Players, Rounds, Standings, Header, Modal)
- `src/utils/*`: helper kecil
- `src/hooks/*`: autosave, auth supabase
- `public/styles.css`: bawaan CSS Anda (disalin dari proyek lama)

## Catatan Migrasi
Lihat `MIGRATION.md` untuk peta fungsi `app.js` → modul React.
