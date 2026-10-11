-- ============================================================
-- RuLaFHub :: Migrasi Forum Tertutup (jawapan disahkan guru)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- ============================================================

-- Status topik: 'buka' (default) / 'tutup'; jawapan yang disahkan
ALTER TABLE public.rulaf_forum
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'buka'
    CHECK (status IN ('buka', 'tutup')),
  ADD COLUMN IF NOT EXISTS jawapan_id bigint;

-- Tanda komen sebagai jawapan yang disahkan
ALTER TABLE public.rulaf_komen
  ADD COLUMN IF NOT EXISTS diterima boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_forum_status ON public.rulaf_forum (status);
CREATE INDEX IF NOT EXISTS idx_komen_diterima ON public.rulaf_komen (diterima);
