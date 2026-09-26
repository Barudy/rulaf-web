-- ============================================================
-- RuLaFHub :: Migrasi Multi-Tenancy Guru + Pendaftaran Murid
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Idempoten: selamat dijalankan semula (IF NOT EXISTS / DO block).
-- ============================================================

-- 1) Pemilikan sekolah oleh guru (isolasi data per guru)
ALTER TABLE public.rulaf_sekolah
  ADD COLUMN IF NOT EXISTS email_guru text;

-- 2) Pemilikan kelas oleh guru (denormalisasi untuk query isolasi mudah)
ALTER TABLE public.rulaf_kelas
  ADD COLUMN IF NOT EXISTS email_guru text;

-- 3) Lajur baharu data_murid: alamat, token NFC/RBox, status akaun, pautan sekolah
ALTER TABLE public.data_murid
  ADD COLUMN IF NOT EXISTS alamat text,
  ADD COLUMN IF NOT EXISTS token_id text,
  ADD COLUMN IF NOT EXISTS status_akaun text NOT NULL DEFAULT 'aktif',
  ADD COLUMN IF NOT EXISTS sekolah_id bigint REFERENCES public.rulaf_sekolah(id);

-- 4) Keunikan token (elak kad berganda)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'data_murid_token_id_key'
  ) THEN
    ALTER TABLE public.data_murid ADD CONSTRAINT data_murid_token_id_key UNIQUE (token_id);
  END IF;
END $$;

-- 5) Indeks untuk penapisan pantas (guru → sekolah → kelas → murid)
CREATE INDEX IF NOT EXISTS idx_sekolah_email_guru ON public.rulaf_sekolah (email_guru);
CREATE INDEX IF NOT EXISTS idx_kelas_email_guru ON public.rulaf_kelas (email_guru);
CREATE INDEX IF NOT EXISTS idx_kelas_sekolah ON public.rulaf_kelas (sekolah_id);
CREATE INDEX IF NOT EXISTS idx_murid_sekolah ON public.data_murid (sekolah_id);
CREATE INDEX IF NOT EXISTS idx_murid_status ON public.data_murid (status_akaun);

-- 6) RLS (sesuaikan ikut polisi projek; contoh longgar di bawah —
--    ketatkan mengikut keperluan sebenar sebelum production)
-- ALTER TABLE public.rulaf_sekolah ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rulaf_kelas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.data_murid ENABLE ROW LEVEL SECURITY;
