-- ============================================================
-- RuLaFHub :: Migrasi Kemas Kini RUR (masa relatif ala GitHub)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Pilihan: tanpa migrasi ini website tetap berfungsi guna created_at.
-- ============================================================

ALTER TABLE public.rulaf_repo
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.rulaf_repo
  SET updated_at = COALESCE(updated_at, created_at, now())
  WHERE updated_at IS NULL;

ALTER TABLE public.rulaf_repo
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_repo_updated_at
  ON public.rulaf_repo (updated_at DESC);
