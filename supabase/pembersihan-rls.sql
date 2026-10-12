-- ============================================================
-- RuLaFHub :: Pembersihan data ujian + polisi RLS untuk DELETE
-- Jalankan di Supabase Dashboard > SQL Editor.
-- Latar: kunci anon boleh INSERT/SELECT tetapi DELETE disekat
-- senyap oleh RLS (0 baris terjejas, tiada ralat) — padam butang
-- admin/guru kelihatan "berjaya" tetapi data kekal.
-- ============================================================

-- 1) Padam baris ujian debug (jika masih ada)
DELETE FROM public.rulaf_komen WHERE penulis = 'debug@x.com';
DELETE FROM public.rulaf_forum WHERE tajuk = 'UJIAN-DEBUG';

-- 2) Semak baris komen rosak (id NULL) — baiki/tetapkan manual jika perlu
-- SELECT * FROM public.rulaf_komen WHERE id IS NULL;

-- 3) Polisi DELETE untuk peranan log masuk (sesuaikan ikut keperluan).
--    Contoh membolehkan pemilik memadam baris sendiri + admin penuh.
--    Gantikan/ubah suai polisi sedia ada mengikut projek anda.

-- Forum: pemilik topik atau admin
-- DROP POLICY IF EXISTS "lin_forum_delete" ON public.rulaf_forum;
-- CREATE POLICY "lin_forum_delete" ON public.rulaf_forum
--   FOR DELETE USING (
--     penulis = (auth.jwt() ->> 'email')
--     OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
--   );

-- Komen: pemilik komen atau admin
-- DROP POLICY IF EXISTS "lin_komen_delete" ON public.rulaf_komen;
-- CREATE POLICY "lin_komen_delete" ON public.rulaf_komen
--   FOR DELETE USING (
--     penulis = (auth.jwt() ->> 'email')
--     OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
--   );

-- Kokurikulum: pemilik rekod atau admin
-- DROP POLICY IF EXISTS "lin_koku_delete" ON public.rulaf_kokurikulum;
-- CREATE POLICY "lin_koku_delete" ON public.rulaf_kokurikulum
--   FOR DELETE USING (
--     email = (auth.jwt() ->> 'email')
--     OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
--   );

-- Murid & repo: hanya admin (guru guna status_akaun, bukan padam kekal)
-- DROP POLICY IF EXISTS "lin_murid_delete_admin" ON public.data_murid;
-- CREATE POLICY "lin_murid_delete_admin" ON public.data_murid
--   FOR DELETE USING ((auth.jwt() ->> 'email') = 'admin@rulafhub.com');

-- ============================================================
-- 4) Polisi UPDATE forum (WAJIB untuk aliran Sahkan & Tutup).
--    Tanpa ini, update topik/komen disekat senyap (0 baris, tiada
--    ralat) dan status kekal "buka" walaupun UI nampak berjaya.
--    Jalankan blok ini SEKARANG (buang -- di depan setiap baris).
-- ============================================================
DROP POLICY IF EXISTS "lin_forum_update" ON public.rulaf_forum;
CREATE POLICY "lin_forum_update" ON public.rulaf_forum
  FOR UPDATE USING (
    penulis = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
    OR EXISTS (SELECT 1 FROM public.profil_pengguna
               WHERE email = (auth.jwt() ->> 'email')
               AND lower(peranan) IN ('guru', 'admin'))
  ) WITH CHECK (
    penulis = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
    OR EXISTS (SELECT 1 FROM public.profil_pengguna
               WHERE email = (auth.jwt() ->> 'email')
               AND lower(peranan) IN ('guru', 'admin'))
  );

DROP POLICY IF EXISTS "lin_komen_update" ON public.rulaf_komen;
CREATE POLICY "lin_komen_update" ON public.rulaf_komen
  FOR UPDATE USING (
    penulis = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
    OR EXISTS (SELECT 1 FROM public.profil_pengguna
               WHERE email = (auth.jwt() ->> 'email')
               AND lower(peranan) IN ('guru', 'admin'))
  ) WITH CHECK (
    penulis = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'admin@rulafhub.com'
    OR EXISTS (SELECT 1 FROM public.profil_pengguna
               WHERE email = (auth.jwt() ->> 'email')
               AND lower(peranan) IN ('guru', 'admin'))
  );
