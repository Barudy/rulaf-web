# UI Refresh Roadmap — Deferred to January 2027

> **Status:** DEFERRED by owner decision (Oct 2026). Stability first.
> **Trigger:** owner says "UI refresh" / "mula UI 2027" in January 2027.
> **Context:** Full audience-UI audit delivered Oct 2026 (see chat history).
> Core verdict: one terminal/GitHub visual register serves Admin/Guru-Pro
> well, but fails primary students (7–12) and under-serves researchers.

## Agreed priority order (highest impact first)

### 1. Kid theme for Murid surfaces (biggest gap)
- Problem: 10–12px mono type, ~24px touch targets, adult jargon
  ("Segerakkan gred 60:40"), no mascot/celebration; arcade concept is
  right, chrome is wrong.
- Scope: theme flag splitting Murid views from pro views — big rounded
  cards, 16px+ type, bright accents, mascot, win confetti, Bahasa mudah.
- Files likely touched: `app/dashboard` (PapanPemukaMurid),
  `app/permainan/**`, `app/semakan` (murid view), `components/Navbar`
  (mobile), `app/globals.css` (tokens).

### 2. Charts before tables (serves Guru + researchers at once)
- One per-class trend line (Jawi/Ujian over `bulan_tahun`) + class
  aggregate export (CSV). Highest value-per-effort item on backlog.
- Needs a chart lib decision (recharts vs lightweight canvas) + RLS-safe
  aggregate queries. No new tables expected.

### 3. Plain-language pass (zero-risk)
- Replace `sudo` / `[ BRACKET ACTIONS ]` / column-speak labels with real
  Malay verbs (Hantar, Semak, Muat Turun). Audit all user-facing strings.

### 4. Accessibility floor
- 44px minimum touch targets, contrast audit (`text-gray-400` on white
  spots), nothing interactive below ~12px.

## Stability checklist (do BEFORE January — the actual current focus)
- [ ] All `supabase/migrasi-*.sql` applied in order
      (multitenan → eprofil → admin-modul → forum-tutup)
- [ ] RLS policies applied (`pembersihan-rls.sql` + forum UPDATE set);
      verify no silent 0-row writes on approve/delete flows
- [ ] `rulaf_komen` PK + identity verified; orphan null-id rows cleaned
- [ ] `npm run build` green on Vercel production
- [ ] Teacher isolation spot-checked (guru sees own schools/classes only)

## Constraints carried forward (non-negotiable)
- Notifikasi stays Android-exclusive — never implement on web.
- Blog CMS stays admin-only; Ejen AI stays locked to admin@rulafhub.com.
- `/blog` remains the single changelog source; landing stays blog-free.
- Every change ends with a green `npm run build`.
