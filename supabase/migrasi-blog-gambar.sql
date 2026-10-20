-- ============================================================
-- RuLaFHub :: Migrasi Blog: gambar + arkib (T2/T3 Hari 2)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- ============================================================

ALTER TABLE public.blog_rulaf
  ADD COLUMN IF NOT EXISTS gambar text;
