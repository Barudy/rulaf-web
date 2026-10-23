-- ============================================================
-- RuLaFHub :: Migrasi Flashcard Interaktif
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- ============================================================

-- Koleksi flashcard (kad ulangkaji dwi-tulisan)
CREATE TABLE IF NOT EXISTS public.rulaf_flashcard (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  tajuk text NOT NULL,
  subjek text NOT NULL DEFAULT 'Umum',
  darjah text NOT NULL DEFAULT 'Umum',
  deskripsi text,
  kad jsonb NOT NULL DEFAULT '[]'::jsonb,
  kuiz_id text,
  pencipta text,
  is_aktif boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_flashcard_aktif ON public.rulaf_flashcard (is_aktif);
CREATE INDEX IF NOT EXISTS idx_flashcard_subjek ON public.rulaf_flashcard (subjek);

-- Rekod mata ulangkaji (satu baris = satu kad per pengguna, simpan mata terbaik)
CREATE TABLE IF NOT EXISTS public.rulaf_flashcard_progress (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  dikemas_kini timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  flashcard_id bigint NOT NULL REFERENCES public.rulaf_flashcard(id) ON DELETE CASCADE,
  kad_index integer NOT NULL,
  mod text NOT NULL DEFAULT 'rumi',
  mata integer NOT NULL DEFAULT 0,
  UNIQUE (email, flashcard_id, kad_index)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_email ON public.rulaf_flashcard_progress (email, flashcard_id);

-- Benarkan bacaan awam + penulisan pengguna yang log masuk
ALTER TABLE public.rulaf_flashcard ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "flashcard_baca" ON public.rulaf_flashcard FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "flashcard_tulis" ON public.rulaf_flashcard FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "flashcard_kemas_kini" ON public.rulaf_flashcard FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.rulaf_flashcard_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "flashcard_progress_baca" ON public.rulaf_flashcard_progress FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "flashcard_progress_tulis" ON public.rulaf_flashcard_progress FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "flashcard_progress_kemas_kini" ON public.rulaf_flashcard_progress FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
