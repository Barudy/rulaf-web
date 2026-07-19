🛠️ LAPORAN KEMAS KINI SISTEM RULAFHUB (v1.0)
Tarikh/Masa: 19 Julai 2026, 11:40 PM Status Pelayan: Beroperasi Penuh (Vercel & Supabase)
BAHAGIAN 1: LOG PENYELESAIAN RALAT (BUG FIXES)
Berikut adalah ralat-ralat kritikal yang telah berjaya kita tewaskan malam ini:
Ralat Pra-Penjanaan Vercel (Prerender Error) [SELESAI]
Isu: Kegagalan deployment pada jam 21:47 dan 21:58 dengan kod ralat pekerja binaan Vercel: 1 berserta mesej Error: supabaseUrl is required.
.
Punca: Pelayan Vercel gagal membaca pemboleh ubah persekitaran .env.local ketika membina sambungan pangkalan data
.
Penyelesaian: Kunci NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY telah dimasukkan secara manual ke dalam tetapan Environment Variables di Vercel dan proses Redeploy berjaya.
Ralat Komponen Pelayan React (Server Component) [SELESAI]
Isu: Kegagalan Turbopack dengan ralat You're importing a module that depends on useEffect/useState into a React Server Component module.
.
Punca: Penggunaan Hooks secara lalai (default) tanpa pengisytiharan komponen klien
.
Penyelesaian: Meletakkan arahan 'use client'; pada baris paling atas bagi semua fail page.tsx yang menggunakan useState dan useEffect.
Ralat Keselamatan Baris (Row-Level Security - RLS) [SELESAI]
Isu: Maklumat Halaman Admin ditolak oleh pangkalan data dengan ralat new row violates row-level security policy for table "blog_rulaf".
Punca: Pengguna tanpa nama (anonymous) cuba memasukkan data.
Penyelesaian: Membina sistem log masuk Supabase Auth, menukar borang admin untuk menyokong E-mel/Kata Laluan, dan menetapkan Polisi RLS INSERT (WITH CHECK true) untuk authenticated dan SELECT untuk anon.
Ralat Logik Data Halaman Semakan [SELESAI]
Isu: Teks "REKOD DIJUMPAI" terpapar tetapi kotak markah murid kosong.
Penyelesaian: Membetulkan pepijat array mapping dengan meletakkan indeks pertama (data) pada tetapan state setMuridDitemui agar sistem dapat membaca objek rekod murid yang spesifik.
BAHAGIAN 2: KEMAS KINI KOD SUMBER TERAKHIR (SOURCE CODE)
Sila pastikan struktur dan fail-fail di bawah telah dikemas kini dan di-save dalam VS Code anda sebelum melakukan Push terakhir ke GitHub malam ini:
[x] lib/supabaseClient.ts – Fail sambungan rasmi (telah ditukar dari .js kepada .ts).
[x] app/admin/page.tsx – Mempunyai borang log masuk (Auth) dan borang muat naik artikel yang dihubungkan ke jadual blog_rulaf.
[x] app/semakan/page.tsx – Menggunakan carian pangkalan data .eq('mykid', carian) atau nama untuk menyemak markah dari jadual markah_murid secara masa nyata (real-time).
[x] app/page.tsx (Home) – Dinaik taraf kepada antara muka (UI) Arch Linux / Terminal berserta fungsi Regex yang menukarkan teks panjang pautan (link) Google Drive Latihan Jawi / Quizizz secara automatik kepada pautan biru yang boleh diklik.
[x] app/docs/page.tsx – Halaman Dokumentasi Khas memaparkan "Laporan Mail" (inspirasi Resident Evil) menceritakan kronologi sejarah pemansuhan Jawi dan tiga resolusi protokol pendidikan (Gamifikasi, Flipped Classroom, dan AI).
