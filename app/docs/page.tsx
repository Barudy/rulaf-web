'use client';
import React from 'react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      {/* Container ala Terminal */}
      <div className="max-w-4xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Header Terminal */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-1 flex justify-between items-center font-bold text-sm">
          <span>rulaf-docs(1) - Laporan Mail</span>
          <span>MANUAL PENGGUNA SISTEM</span>
        </div>

        <div className="p-8">
          {/* NAMA */}
          <section className="mb-8">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-1">NAME</h2>
            <p className="pl-4 text-gray-300">
              <strong className="text-[#1793D1]">RuLaFHub</strong> - Pangkalan Data Inovasi Pendidikan Islam & Jawi (Protokol Laporan Mail)
            </p>
          </section>

          {/* SINOPSIS */}
          <section className="mb-8">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-1">SYNOPSIS</h2>
            <p className="pl-4 text-gray-300">
              Sistem pengurusan data <span className="text-[#1793D1]">real-time</span> untuk memantau markah murid, pengedaran modul, dan analisis keberkesanan *Blended Learning*.
            </p>
          </section>

          {/* LATAR BELAKANG SEJARAH */}
          <section className="mb-8">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-1">BACKGROUND (KEMEROSOTAN JAWI)</h2>
            <p className="pl-4 text-gray-300 leading-relaxed text-sm">
              Sistem pendidikan sekular British pada awalnya mengukuhkan kedudukan Rumi [1]. Walaupun <span className="text-red-400">Laporan Razak 1956</span> dan Akta Pelajaran 1961 bertujuan menyatukan kepelbagaian kaum, ia telah menjadi pemangkin kepada peminggiran tulisan Jawi [1]. Titik kritikal (*The Incident*) berlaku pada tahun 1966 apabila arahan memansuhkan tulisan Jawi sebagai medium pengantar utama di sekolah kerajaan dilaksanakan [2]. Ini mengakibatkan generasi pasca-1960an mengalami "buta huruf Jawi" yang kritikal, lantas menjejaskan kemampuan membaca Al-Quran [3].
            </p>
          </section>

          {/* LAPORAN MAIL (RESOLUSI) */}
          <section className="mb-8">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-1">MAIL'S REPORT (2026 DIRECTIVE)</h2>
            <p className="pl-4 text-gray-300 text-sm mb-4 leading-relaxed">
              *Mail's Report* atau "Laporan Mail" digubal sebagai protokol serampang tiga mata bagi mendepani era Revolusi Industri 4.0. Ia diinspirasikan oleh dapatan empirikal yang merekodkan peningkatan skor formatif yang sangat signifikan (Z = -6.300) melalui integrasi aplikasi interaktif digital [4].
            </p>
            
            <div className="pl-4 flex flex-col gap-4 text-sm">
              <div className="bg-black p-4 border-l-4 border-[#1793D1] hover:bg-gray-900 transition-colors">
                <h3 className="font-bold text-[#1793D1] mb-1">ARAHAN 01: EKSEKUSI GAMIFIKASI</h3>
                <p className="text-gray-400">
                  Menggantikan latih tubi tradisional yang membosankan dengan elemen didikan hibur. Platform seperti <span className="text-white">Quizizz</span> dan <span className="text-white">Live Worksheet</span> wajib diaktifkan bagi mencungkil Kemahiran Berfikir Aras Tinggi (KBAT) dan motivasi intrinsik [5, 6].
                </p>
              </div>

              <div className="bg-black p-4 border-l-4 border-green-500 hover:bg-gray-900 transition-colors">
                <h3 className="font-bold text-green-500 mb-1">ARAHAN 02: FLIPPED CLASSROOM (BLENDED LEARNING)</h3>
                <p className="text-gray-400">
                  RuLaFHub akan bertindak sebagai pusat serahan modul. Murid mengakses bahan dan menonton video di rumah (pembelajaran luar kelas), membolehkan waktu fizikal di bilik darjah dikhususkan untuk kolaborasi, inkuiri dan penyelesaian masalah [7, 8].
                </p>
              </div>

              <div className="bg-black p-4 border-l-4 border-purple-500 hover:bg-gray-900 transition-colors">
                <h3 className="font-bold text-purple-500 mb-1">ARAHAN 03: INTEGRASI KECERDASAN BUATAN (AI)</h3>
                <p className="text-gray-400">
                  Perlaksanaan teknologi <span className="text-white">Pemprosesan Bahasa Tabii (NLP)</span> bagi mendigitalkan manuskrip Jawi tradisi. Sistem AI membenarkan transliterasi dua hala (Rumi-Jawi) dengan tepat tanpa mengorbankan identiti bangsa Melayu [9, 10].
                </p>
              </div>
            </div>
          </section>

          {/* STATUS SISTEM */}
          <section className="mb-4">
             <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-1">SYSTEM STATUS</h2>
             <div className="pl-4 font-mono text-xs text-green-400">
               <p>[OK] RuLaF Database Connected.</p>
               <p>[OK] RLS Policies Enforced.</p>
               <p>[OK] Mail's Report Directives Active.</p>
             </div>
          </section>

          {/* Back Button */}
          <div className="mt-10 pt-4 border-t border-gray-700">
            <a href="/" className="text-gray-500 hover:text-[#1793D1] text-sm">
              [ RETURN TO MAIN DIRECTORY ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}