# Trndinn — Next.js (App Router)

SSR-capable frontend migrated from Vite. Run from this folder:

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_* (same values as old VITE_*)
npm run dev                  # http://localhost:8080
```

- **Env:** use `NEXT_PUBLIC_*` for client-side config (not `VITE_*`).
- **Supabase migrations** still live under `../frontend/supabase` or `../docs/sql-migrations/supabase` per monorepo layout.
- **Tests:** add a runner when needed (e.g. Jest + `next/jest` or Vitest with a fresh config); the old Vite-era `vitest.config.ts` was removed.

See `../docs/guides/frontend-readme.md` for product behavior; this package is the Next.js shell.

## Brand assets

- **UI logos:** `public/brand/` — optimized JPGs (see `public/brand/README.md`).
- **Favicon / app icons:** `src/app/icon.jpg` (512×512), `src/app/apple-icon.jpg` (180×180).
- **Social preview:** `public/og/default.jpg` — used by `metadata.openGraph` in `src/app/layout.tsx`.
- **Env:** set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://trndinn.com`) for correct OG/Twitter absolute URLs.

Source artwork was processed from `~/Downloads/trndinn assets/` (high-res originals stay outside git).
