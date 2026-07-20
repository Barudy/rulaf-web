# 💻 RuLaFHub (v1.4-stable)
**Pangkalan Data Inovasi Pendidikan Islam & Pemerkasaan Jawi**

RuLaFHub adalah sebuah sistem repositori sumber terbuka (*open-source*) dan portal pengurusan pendidikan masa nyata (*real-time*) yang dibina khusus untuk mengintegrasikan pendekatan **Pembelajaran Teradun (*Blended Learning*)**, **Gamifikasi**, dan **Kecerdasan Buatan (AI)** dalam bilik darjah. Sistem ini direka dengan antara muka (*UI*) berkonsepkan terminal minimalis ala Arch Linux bagi mencerminkan anjakan paradigma pendidikan ke arah pendigitalan era Revolusi Industri 4.0.

---

## 📜 Latar Belakang & Falsafah (Laporan Mail)
Sistem ini diinspirasikan daripada **Laporan Mail (Mail's Report)** sebagai satu protokol intervensi digital bagi menangani krisis kemerosotan penguasaan tulisan Jawi. Berdasarkan sejarah, peminggiran Jawi mula meruncing pasca Laporan Razak 1956 dan mencapai titik kritikal melalui arahan pemansuhan Jawi sebagai medium pengantar utama pada tahun 1966. Kegagalan generasi baharu menguasai Jawi turut menjejaskan keupayaan membaca Al-Quran dengan baik.

Bagi merungkai masalah ini, RuLaFHub dibangunkan berteraskan empat elemen utama Falsafah Pendidikan Bersepadu:
1. **Kreativiti (Creativity):** Menggunakan aplikasi didik hibur (gamifikasi) secara meluas untuk mencungkil Kemahiran Berfikir Aras Tinggi (KBAT). Kajian empirikal merekodkan peningkatan skor formatif yang sangat signifikan (Z = -6.300, p < .001) melalui integrasi aplikasi interaktif Jawi.
2. **Refleksi (Reflectivity):** Menyediakan sistem semakan markah *real-time* untuk murid dan guru menilai pencapaian kendiri secara pantas.
3. **Kerjasama (Reciprocity):** Membangunkan forum komuniti pendidik untuk perbincangan pedagogi PAK21 tanpa batasan lokasi (seperti model *Massive Open Online Courses - MOOC*).
4. **Tanggungjawab (Responsibility):** Mempraktikkan *Flipped Classroom* di mana bahan dan modul diletakkan di repositori untuk diakses murid di rumah, menjadikan waktu fizikal di kelas khusus untuk kolaborasi.

---

## 🚀 Ciri-Ciri Utama (Key Features)

- **[+] UI/UX Terminal (Arch Linux Style):** Reka bentuk minimalis, pantas, dan bebas gangguan menggunakan Tailwind CSS.
- **[+] Open Repository (Repositori Terbuka):** Akses percuma untuk memuat turun Modul Jawi, lembaran kerja amali, dan pautan *Quizizz/Kahoot!*. Dilengkapi dengan fungsi pengimbas teks (*Regex*) yang menukar URL secara automatik kepada pautan yang boleh diklik.
- **[+] Forum Komuniti PAK21:** Ruang diskusi interaktif untuk guru dan ibu bapa membalas bebenang (*thread*) perbincangan.
- **[+] Sudo Login (Supabase Auth):** Mod capaian selamat. Hanya pengunjung (guru/admin) yang berdaftar mempunyai autoriti (*Authenticated Write*) untuk memuat naik modul dan membalas forum, manakala orang awam kekal sebagai pemerhati (*Public Read*).
- **[+] Semakan Prestasi Masa Nyata:** Sistem carian data pintar menggunakan nombor MyKid untuk menyemak markah (Jawi, Hafazan, Kehadiran) secara langsung dari pangkalan data.
- **[+] CMS Blog Jurnal:** Papan pemuka (*dashboard*) khas untuk pentadbir memuat naik laporan dan buletin inovasi tanpa perlu mengubah kod sumber.

---

## 🛠️ Timunan Teknologi (Tech Stack)

Sistem ini dibina menggunakan susun atur teknologi moden untuk kelajuan dan penskalaan:
* **Kerangka Hadapan (Frontend):** Next.js 16 (React), TypeScript, Tailwind CSS
* **Pangkalan Data & Pengesahan (Backend/Auth):** Supabase (PostgreSQL, Row-Level Security Policies)
* **Pelayan & Pengaturcaraan (Deployment):** Vercel (Edge Network)

---

## ⚙️ Pemasangan & Persediaan (Local Setup)

Untuk menjalankan RuLaFHub di dalam mesin tempatan anda:

1. Klon repositori ini:
   ```bash
   git clone https://github.com/Barudy/rulaf-web.git
   cd rulaf-web
Pasang kebergantungan (dependencies):
Tetapkan pemboleh ubah persekitaran (Environment Variables). Cipta fail .env.local di direktori utama dan masukkan kunci API Supabase anda:
Jalankan pelayan pembangunan (development server):
Buka http://localhost:3000 pada pelayar web anda untuk melihat sistem beroperasi.
🤝 Sumbangan (Contributing)
Projek RuLaFHub adalah sebuah inisiatif sumber terbuka (open-source). Kami amat mengalu-alukan sumbangan daripada para pembangun perisian, guru, dan pengkaji pendidikan untuk menambah baik pedagogi digital dan memartabatkan tulisan Jawi
. Anda boleh menekan Fork, mencipta Branch baharu, dan menghantar Pull Request.
"Membetulkan yang biasa dan membiasakan yang betul." - Memacu Pendidikan Jawi ke Era Digital.

MIT License

Copyright (c) 2026 [NAMA BRO / RULAF HUB]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

