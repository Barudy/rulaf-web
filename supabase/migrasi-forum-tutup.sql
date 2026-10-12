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

-- Baiki id auto-increment rulaf_komen (tanpanya komen baharu dapat id NULL
-- dan sebarang operasi eq('id', ...) gagal dengan ralat "bigint: null").
-- Susunan penting: buang NULL dahulu, kemudian NOT NULL, identity, PK.
DELETE FROM public.rulaf_komen WHERE id IS NULL;

DO $$
BEGIN
  ALTER TABLE public.rulaf_komen ALTER COLUMN id SET NOT NULL;
EXCEPTION WHEN others THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.rulaf_komen ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN duplicate_object OR syntax_error OR others THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.rulaf_komen ADD CONSTRAINT rulaf_komen_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object OR others THEN
  NULL;
END $$;

-- Selaraskan sequence: jadual kosong -> mula dari 1; berisi -> sambung selepas max.
-- (setval(seq, 0) dilarang kerana minimum sequence ialah 1 — ralat 22003.)
SELECT setval(
  pg_get_serial_sequence('public.rulaf_komen', 'id'),
  COALESCE((SELECT max(id) FROM public.rulaf_komen), 1),
  (SELECT count(*) FROM public.rulaf_komen) = 0
);
