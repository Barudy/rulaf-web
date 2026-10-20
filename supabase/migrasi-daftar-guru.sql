-- ============================================================
-- RuLaFHub :: Migrasi Pendaftaran Guru Terbuka ( Hari 3 )
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- ============================================================

-- Status kelulusan akaun: 'lulus' (sedia ada, default), 'menunggu', 'tolak'
ALTER TABLE public.profil_pengguna
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'lulus';

-- Jadual pendaftaran guru (3 soalan screener untuk kelulusan admin)
CREATE TABLE IF NOT EXISTS public.rulaf_pendaftaran_guru (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  nama text NOT NULL,
  umur integer,
  jantina text,
  jawapan_1 text NOT NULL DEFAULT 'Ya — Saya seorang guru',
  jawapan_2 text,
  jawapan_3 text NOT NULL DEFAULT 'Ya — Saya bersetuju & arahan anti-phishing dibaca',
  status text NOT NULL DEFAULT 'menunggu',
  nota_admin text
);

CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON public.rulaf_pendaftaran_guru (status);

-- Benarkan pendaftaran awam (daftar) + bacaan/kemas kini admin
ALTER TABLE public.rulaf_pendaftaran_guru ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pendaftaran_daftar" ON public.rulaf_pendaftaran_guru FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pendaftaran_baca" ON public.rulaf_pendaftaran_guru FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pendaftaran_kemas_kini" ON public.rulaf_pendaftaran_guru FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
