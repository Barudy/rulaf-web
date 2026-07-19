'use client';
import React from 'react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      {/* Container ala Terminal */}
      <div className="max-w-4xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Header Terminal */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-docs(1) - Dokumentasi Rasmi</span>
          <span>MANUAL KOMUNITI & FALSAFAH</span>
        </div>

        <div className="p-8">
          {/* SINOPSIS */}
          <section className="mb-10">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="text-[#1793D1]">[3]</span> SINOPSIS RuLaFHub
            </h2>
            <p className="pl-6 text-gray-300 leading-relaxed text-sm">
              <strong className="text-[#1793D1]">RuLaFHub</strong> adalah sebuah pusat data bersepadu dan platform komuniti digital untuk Pendidikan Islam dan pemerkasaan tulisan Jawi. Ia dibina untuk menyatukan murid, ibu bapa, dan pendidik dalam satu ekosistem interaktif yang menyediakan akses kepada pengurusan markah, modul pengajaran, forum perbincangan, dan pelaporan pendidikan secara masa nyata (*real-time*).
            </p>
          </section>

          {/* FALSAFAH */}
          <section className="mb-10">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="text-[#1793D1]">[4]</span> FALSAFAH PENDIDIKAN
            </h2>
            <div className="pl-6 text-sm text-gray-300 leading-relaxed space-y-4">
              <p>
                Platform ini didorong oleh visi mendepani Revolusi Industri 4.0 dengan mengintegrasikan nilai kerohanian dan teknologi digital. Ia berteraskan empat elemen utama Falsafah Pendidikan Bersepadu:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-400">
                <li><strong className="text-white">Kreativiti (Creativity):</strong> Menjana pemikiran luar kotak melalui aplikasi didik hibur (gamifikasi).</li>
                <li><strong className="text-white">Refleksi (Reflectivity):</strong> Menyediakan data pantas untuk penilaian kendiri murid dan tindakan susulan guru.</li>
                <li><strong className="text-white">Kerjasama (Reciprocity):</strong> Memupuk kolaborasi aktif melalui forum perbincangan.</li>
                <li><strong className="text-white">Tanggungjawab (Responsibility):</strong> Melahirkan kebertanggungjawaban dalam pembelajaran kendiri (Flipped Classroom).</li>
              </ul>
              <p className="mt-4">
                Selain itu, RuLaFHub memikul tanggungjawab besar untuk memulihara identiti bangsa Melayu dengan memperkasakan semula tulisan Jawi yang kian terpinggir, menukarkannya daripada sekadar warisan sejarah kepada medium ilmu yang dinamik selari dengan arus kemodenan.
              </p>
            </div>
          </section>

          {/* UNDANG-UNDANG KOMUNITI & FORUM */}
          <section className="mb-10">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="text-green-400">[5]</span> UNDANG-UNDANG KOMUNITI & FORUM
            </h2>
            <div className="pl-6 text-sm">
              <p className="text-gray-400 mb-4">
                Bagi memastikan ekosistem forum RuLaFHub kekal harmoni dan berilmiah, semua pengguna (murid, waris, pendidik) tertakluk kepada protokol berikut:
              </p>
              <div className="bg-black p-4 border-l-4 border-green-500 rounded text-gray-300 space-y-3">
                <p><strong>01. Hormati Rakan Komuniti:</strong> Jaga adab komunikasi. Dilarang menggunakan bahasa kesat, menghina, atau merendahkan pengguna lain.</p>
                <p><strong>02. Tiada Isu Sensitif:</strong> Forum ini adalah medan ilmu. Perbincangan berbaur politik, perkauman, atau menyentuh sensitiviti agama (3R) adalah dilarang keras.</p>
                <p><strong>03. Integriti Akademik:</strong> Kongsikan maklumat, panduan, atau jawapan yang sahih. Elakkan penipuan (plagiat) semasa perbincangan modul.</p>
                <p><strong>04. Tanggungjawab Privasi:</strong> Dilarang berkongsi maklumat peribadi (seperti kata laluan atau nombor MyKid) secara terbuka di dalam forum.</p>
              </div>
            </div>
          </section>

          {/* LAPORAN MAIL (Pengasingan) */}
          <section className="mb-6">
            <h2 className="text-white font-black text-xl mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span className="text-purple-400">[6]</span> LAPORAN MAIL (MAIL'S REPORT)
            </h2>
            <div className="pl-6 text-sm text-gray-300 leading-relaxed">
              <p className="mb-4">
                Laporan Mail adalah arkib eksklusif yang mendokumentasikan refleksi, pemerhatian lapangan, dan laporan semasa berdasarkan pengalaman mengajar pengasas (Admin Mail) di dalam dan di luar bilik darjah.
              </p>
              <div className="flex items-center justify-between bg-[#1A202C] border border-purple-500/50 p-4 rounded">
                <span className="font-mono text-purple-300">Status: Diuruskan secara dinamik oleh Admin.</span>
                <a href="/" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors">
                  Akses Laporan di Laman Utama
                </a>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <div className="mt-12 pt-4 border-t border-gray-700 text-center">
            <a href="/" className="text-gray-500 hover:text-[#1793D1] text-sm font-bold tracking-widest">
              [ KEMBALI KE DIREKTORI UTAMA ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
