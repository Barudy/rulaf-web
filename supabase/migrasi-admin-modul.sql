-- ============================================================
-- RuLaFHub :: Migrasi Modul Admin (laporan bug)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rulaf_bug (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text,
  tajuk text NOT NULL,
  perihal text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'baru'
    CHECK (status IN ('baru', 'selesai'))
);

CREATE INDEX IF NOT EXISTS idx_bug_status ON public.rulaf_bug (status);
CREATE INDEX IF NOT EXISTS idx_bug_created ON public.rulaf_bug (created_at DESC);

-- ALTER TABLE public.rulaf_bug ENABLE ROW LEVEL SECURITY;
