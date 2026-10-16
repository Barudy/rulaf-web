-- ============================================================
-- RuLaFHub :: Migrasi Rvids + Merit/Demerit (Hari 1 Hackathon)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- NOTA: edaran RBox/NFC/Q R DI-SKIP (RND telefon pintar sahaja).
-- ============================================================

-- A) Merit/demerit untuk data_murid (Android StudentDto + web Kad Player)
ALTER TABLE public.data_murid
  ADD COLUMN IF NOT EXISTS merit integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demerit integer NOT NULL DEFAULT 0;

-- B) Pertahanan id komen Rvids (elak ulangi penyakit rulaf_komen)
DELETE FROM public.rulaf_video_komentar WHERE id IS NULL;

DO $$
BEGIN
  ALTER TABLE public.rulaf_video_komentar ALTER COLUMN id SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.rulaf_video_komentar ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.rulaf_video_komentar ADD CONSTRAINT rulaf_video_komentar_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object OR others THEN NULL;
END $$;

SELECT setval(
  pg_get_serial_sequence('public.rulaf_video_komentar', 'id'),
  COALESCE((SELECT max(id) FROM public.rulaf_video_komentar), 1),
  (SELECT count(*) FROM public.rulaf_video_komentar) = 0
);
