-- ============================================================
-- RuLaFHub :: Migrasi E-Profil (portfolio digital guru & murid)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Idempoten: selamat dijalankan semula.
-- ============================================================

-- 1) Medan baharu profil_pengguna: jawatan, telefon, alamat, kokurikulum
ALTER TABLE public.profil_pengguna
  ADD COLUMN IF NOT EXISTS jawatan text,
  ADD COLUMN IF NOT EXISTS no_tel text,
  ADD COLUMN IF NOT EXISTS alamat text,
  ADD COLUMN IF NOT EXISTS kokurikulum text;

-- 2) Jadual pencapaian kokurikulum (Sekolah / MSSD / MSSN / Kebangsaan)
CREATE TABLE IF NOT EXISTS public.rulaf_kokurikulum (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  mykid text,
  aktiviti text NOT NULL,
  kategori text NOT NULL DEFAULT 'Kelab & Persatuan',
  peringkat text NOT NULL DEFAULT 'Sekolah'
    CHECK (peringkat IN ('Sekolah', 'MSSD', 'MSSN', 'Kebangsaan')),
  tahun text,
  pencapaian text
);

CREATE INDEX IF NOT EXISTS idx_koku_email ON public.rulaf_kokurikulum (email);
CREATE INDEX IF NOT EXISTS idx_koku_mykid ON public.rulaf_kokurikulum (mykid);
CREATE INDEX IF NOT EXISTS idx_koku_peringkat ON public.rulaf_kokurikulum (peringkat);

-- 3) RLS (sesuaikan ikut polisi projek sebelum production)
-- ALTER TABLE public.rulaf_kokurikulum ENABLE ROW LEVEL SECURITY;
