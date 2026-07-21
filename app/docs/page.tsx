'use client';
import React, { useState } from 'react';

export default function DocsPage() {
  const [activeProtokol, setActiveProtokol] = useState<string | null>('pengenalan');

  const toggleProtokol = (id: string) => {
    setActiveProtokol(activeProtokol === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Header Terminal */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-docs(1) - DOKUMENTASI RASMI SISTEM</span>
          <a href="/" className="hover:text-white transition-colors">[ cd ~ / Laman Utama ]</a>
        </div>

        <div className="p-8">
          <div className="border-b border-gray-700 pb-6 mb-8">
            <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
              <span className="text-[#1793D1]">{'>'}</span> DOKUMENTASI RASMI RULAF HUB
            </h1>
            <p className="text-gray-400 text-sm font-bold italic">
              "Mentransformasikan kaedah perkilangan kepada pendidikan hibrid yang manusiawi."
            </p>
          </div>

          {/* BAB 1: PENGENALAN & FALSAFAH */}
          <div className="mb-4">
            <button 
              onClick={() => toggleProtokol('pengenalan')}
              className="w-full text-left bg-gray-900 border border-gray-700 p-4 font-bold text-[#1793D1] hover:border-[#1793D1] transition-colors flex justify-between"
            >
              <span>[+] BAB 1: PENGENALAN & FALSAFAH KOMUNITI RULAF</span>
              <span>{activeProtokol === 'pengenalan' ? '[-]' : '[+]'}</span>
            </button>
            
            {activeProtokol === 'pengenalan' && (
              <div className="bg-black border-x border-b border-gray-700 p-6 text-sm text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong className="text-white">RuLaF (Rangka Kerja Pembelajaran Terbeza dan Pentaksiran Pelbagai Tahap)</strong> dilahirkan daripada satu niat yang ringkas: membantu murid dan mengembalikan minat mereka terhadap pembelajaran, khususnya dalam penguasaan asas 3M (Membaca, Menulis, Mengira) dan literasi Jawi.
                </p>
                <p>
                  RuLaF Hub bertindak sebagai infrastruktur digital (seakan <strong>GitHub untuk pendidik</strong>). Ia adalah pusat pangkalan data komprehensif dan repositori kolaboratif yang membolehkan para pendidik memuat naik, berkongsi kod kuiz interaktif, menyelaraskan Bahan Bantu Mengajar (BBM), dan menjejak demografi murid.
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                  <li><strong className="text-white">Komuniti Berpusatkan Murid:</strong> Setiap modul dan baris kod bermatlamat menyelesaikan masalah keciciran murid.</li>
                  <li><strong className="text-white">Dipacu Komuniti (Open Source):</strong> Inovasi ini dilepaskan di bawah <strong>Lesen MIT</strong>, memberi kebebasan kepada pendidik menambah baik sistem tanpa kekangan birokrasi.</li>
                  <li><strong className="text-white">Kesinambungan Data:</strong> Direka untuk menyelaraskan akademik dari pendidikan awal sehinggalah ke peringkat pengajian tinggi.</li>
                </ul>
              </div>
            )}
          </div>

          {/* BAB 2: KESELAMATAN & SUMBANGAN */}
          <div className="mb-4">
            <button 
              onClick={() => toggleProtokol('keselamatan')}
              className="w-full text-left bg-gray-900 border border-gray-700 p-4 font-bold text-red-400 hover:border-red-500 transition-colors flex justify-between"
            >
              <span>[+] BAB 2: GARIS PANDUAN KESELAMATAN & CARA MENYUMBANG</span>
              <span>{activeProtokol === 'keselamatan' ? '[-]' : '[+]'}</span>
            </button>
            
            {activeProtokol === 'keselamatan' && (
              <div className="bg-black border-x border-b border-gray-700 p-6 text-sm text-gray-300 leading-relaxed space-y-4">
                <p>
                  RuLaF Hub komited mewujudkan ruang digital yang 100% selamat, berautoriti, dan bebas daripada ancaman scammer. Setiap sumbangan (melalui <em>Pull Request</em>) akan melalui proses penapisan ketat.
                </p>
                <div className="border-l-4 border-red-500 pl-4 bg-gray-900 py-3">
                  <span className="text-red-400 font-bold uppercase">Polisi Toleransi Sifar (Zero Tolerance Policy)</span>
                  <p className="mt-2">Sistem ini <strong>TIDAK AKAN TERAGAK-AGAK</strong> mengambil tindakan keras sekiranya pengguna memuat naik:</p>
                  <ul className="list-disc ml-6 mt-1 text-red-300">
                    <li>Kandungan yang meragukan (suspicious uploads).</li>
                    <li>Perisian berniat jahat (malware/spyware).</li>
                    <li>Pautan phishing atau sebarang elemen penipuan (scam).</li>
                    <li>Bahan yang melanggar sensitiviti atau tidak beretika.</li>
                  </ul>
                  <p className="mt-3 font-bold text-white uppercase">Tindakan: BAN (Sekatan) Kekal serta-merta! Tiada kompromi untuk keselamatan data pendidikan.</p>
                </div>

                <div className="mt-4">
                  <strong className="text-[#1793D1]"> CARA MENYUMBANG (CONTRIBUTING) KOD & MODUL:</strong>
                  <ol className="list-decimal ml-6 mt-2 space-y-1">
                    <li><strong>Fork:</strong> Salin (fork) repositori utama ke persekitaran kerja anda.</li>
                    <li><strong>Branch:</strong> Cipta branch baharu bagi tujuan pengasingan kemaskini.</li>
                    <li><strong>Ubah Suai & Uji:</strong> Masukkan modul BBM / algoritma kuiz dan uji kefungsiannya.</li>
                    <li><strong>Pull Request:</strong> Hantar permohonan untuk semakan kami.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* BAB 3: KRONOLOGI SEJARAH */}
          <div className="mb-4">
            <button 
              onClick={() => toggleProtokol('sejarah')}
              className="w-full text-left bg-gray-900 border border-gray-700 p-4 font-bold text-white hover:border-gray-400 transition-colors flex justify-between"
            >
              <span>[+] BAB 3: KRONOLOGI KEMEROSOTAN JAWI (LAPORAN MAIL)</span>
              <span>{activeProtokol === 'sejarah' ? '[-]' : '[+]'}</span>
            </button>
            
            {activeProtokol === 'sejarah' && (
              <div className="bg-black border-x border-b border-gray-700 p-6 text-sm text-gray-300 leading-relaxed space-y-4">
                <p>
                  Sebelum kedatangan kuasa kolonial Barat, tulisan Jawi merupakan skrip utama di Alam Melayu. Namun, titik tolak kemerosotan ketara berlaku pada tahun <span className="text-red-400 font-bold">1966</span> apabila Menteri Pelajaran ketika itu memansuhkan penggunaan tulisan Jawi sebagai medium pengantar utama di sekolah.
                </p>
                <p>
                  <strong>Kesan Kritikal:</strong> Generasi pasca 1960-an mula mengalami masalah buta huruf Jawi mendadak, menjejaskan keupayaan membaca Al-Quran. Malah, akhbar Utusan Melayu berhuruf Jawi terpaksa dihentikan pada tahun 2003. Atas kesedaran ini, RuLaFHub dibangunkan bagi menghidupkan semula tulisan Jawi menggunakan ekosistem digital.
                </p>
              </div>
            )}
          </div>

          {/* BAB 4: 3 PROTOKOL INTERVENSI */}
          <div className="mb-4">
            <button 
              onClick={() => toggleProtokol('intervensi')}
              className="w-full text-left bg-gray-900 border border-gray-700 p-4 font-bold text-purple-400 hover:border-purple-500 transition-colors flex justify-between"
            >
              <span>[+] BAB 4: TIGA (3) PROTOKOL INTERVENSI PENDIDIKAN RULAF</span>
              <span>{activeProtokol === 'intervensi' ? '[-]' : '[+]'}</span>
            </button>
            {activeProtokol === 'intervensi' && (
              <div className="bg-black border-x border-b border-gray-700 p-6 text-sm text-gray-300 leading-relaxed space-y-6">
                
                {/* Gamifikasi */}
                <div>
                  <h3 className="font-bold text-green-400">1. Pembelajaran Gamifikasi</h3>
                  <p className="mt-1">
                    Menggunakan aplikasi interaktif (Quizizz/Kahoot/App Khas) untuk mewujudkan pembelajaran tanpa tekanan. Kajian empirikal menunjukkan aplikasi "Belajar Mengeja Jawi" merekodkan peningkatan skor formatif yang sangat signifikan (Z = -6.300, p {'<'} .001).
                  </p>
                </div>

                {/* Flipped Classroom */}
                <div>
                  <h3 className="font-bold text-yellow-400">2. Strategi Flipped Classroom</h3>
                  <p className="mt-1">
                    Pembelajaran teori dianjakkan ke rumah (melalui modul/video di RuLaF Hub), manakala masa di dalam kelas dikhususkan untuk kolaborasi dan penyelesaian masalah tahap tinggi (KBAT).
                  </p>
                </div>

                {/* AI */}
                <div>
                  <h3 className="font-bold text-purple-400">3. Integrasi Kecerdasan Buatan (AI)</h3>
                  <p className="mt-1">
                    Selaras dengan Transformasi Digital Institusi Pendidikan Islam oleh Perdana Menteri (Mac 2026), Ejen AI digunakan dalam RuLaF Hub untuk menganalisis data permarkahan (Supabase) secara masa nyata dan menjana laporan preskriptif, bukan untuk menggantikan manhaj tarbiah guru.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BAB 5: STRUKTUR KUMPULAN DINAMIK */}
          <div className="mb-4">
            <button 
              onClick={() => toggleProtokol('kumpulan')}
              className="w-full text-left bg-gray-900 border border-gray-700 p-4 font-bold text-[#1793D1] hover:border-[#1793D1] transition-colors flex justify-between"
            >
              <span>[+] BAB 5: PROTOKOL KUMPULAN DINAMIK (HIBRID)</span>
              <span>{activeProtokol === 'kumpulan' ? '[-]' : '[+]'}</span>
            </button>
            
            {activeProtokol === 'kumpulan' && (
              <div className="bg-black border-x border-b border-gray-700 p-6 text-sm text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong className="text-white">Sistem RuLaF</strong> menolak pengasingan murid mengikut kepandaian. Murid dikelompokkan dalam formasi hibrid seramai 5 orang setiap kumpulan dengan nisbah strategik <strong>1 Ta : 2 Ba : 2 Alif</strong> untuk meruntuhkan jurang keciciran melalui sokongan rakan sebaya (Peer-to-Peer).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-900 p-4 border border-gray-800">
                    <h3 className="text-red-400 font-bold mb-1">[!] RuLaF Khas & Alif</h3>
                    <p className="text-xs text-gray-400">Murid lemah / pemulihan khas. Fokus bimbingan dengan latihan asas visual dan psikomotor.</p>
                  </div>
                  <div className="bg-gray-900 p-4 border border-gray-800">
                    <h3 className="text-yellow-400 font-bold mb-1">[~] RuLaF Ba (Nisbah: 2)</h3>
                    <p className="text-xs text-gray-400">Murid sederhana. Menggalas peranan pembantu fasilitator. Latihan pemahaman konteks.</p>
                  </div>
                  <div className="bg-gray-900 p-4 border border-gray-800 sm:col-span-2">
                    <h3 className="text-blue-400 font-bold mb-1">[*] RuLaF Ta (Nisbah: 1)</h3>
                    <p className="text-xs text-gray-400">Murid cemerlang. Bertindak sebagai mentor utama dalam kumpulan. Menerima latihan beraras kognitif tinggi (KBAT).</p>
                  </div>
                </div>

                {/* SEKSYEN DINAMIK KUMPULAN YANG DITAMBAH */}
                <div className="mt-6 border-l-4 border-[#1793D1] pl-4 bg-gray-900 py-3">
                  <strong className="text-[#1793D1] uppercase">Dinamik Kumpulan & Falsafah Terbeza:</strong>
                  <ul className="list-disc ml-6 mt-2 space-y-2 text-xs">
                    <li><strong>Guru Sebagai Fasilitator:</strong> Bertindak mengemudi pergerakan dan memberikan intervensi klinikal hanya apabila diperlukan, bukan lagi penyampai maklumat sehala.</li>
                    <li><strong>Pembantu Fasilitator (RuLaF Ba):</strong> Meminimumkan beban guru daripada terpaksa menjawab persoalan asas yang sama secara berulang kali.</li>
                    <li><strong>Keyakinan Interpersonal:</strong> Meruntuhkan tembok rasa segan murid lemah (Alif/Khas) untuk berinteraksi secara santai bersama rakan sebaya (Ta/Ba).</li>
                    <li><strong>Falsafah 'Portion' RuLaF:</strong> Memastikan semua pihak bergerak ke hadapan secara kolektif dengan mengurangkan jurang keciciran secara drastik.</li>
                  </ul>
                </div>
                <div className="mt-4 border-l-4 border-green-500 pl-4 bg-gray-900 py-3">
                  <strong className="text-green-400 uppercase">Kitaran Rombakan AI (Regrouping):</strong>
                  <p className="mt-2 text-xs">Setiap kumpulan hanya bertahan selama 2 bulan. Ejen AI akan menganalisis corak pembelajaran murid (prestasi 3M dan Jawi) lalu mengesyorkan rombakan automatik bagi menyingkirkan elemen bias (pilih kasih).</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-500 font-bold">
            <p>"Membetulkan yang biasa dan membiasakan yang betul — Memacu Pendidikan Jawi ke Era Digital."</p>
            <p className="mt-2 font-normal">Hak Cipta © Komuniti RuLaF Hub (Lesen MIT).</p>
          </div>

        </div>
      </div>
    </div>
  );
}