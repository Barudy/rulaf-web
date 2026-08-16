'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';

// Definisi Jenis Data Permainan
interface Game {
  id: string;
  tajuk: string;
  subjek: string;
  darjah: string;
  topik: string;
  penerangan: string;
  ikon: string;
  pautan: string;
  bilanganSoalan: string;
  tahapKesukaran: 'Mudah' | 'Sederhana' | 'Tinggi';
}

export default function PermainanArkedPage() {
  const [tema, setTema] = useState('dark');

  // Senarai Tiga (3) Game Utama dalam Ekosistem RuLaF
  const senaraiGame: Game[] = [
    {
      id: 'gerhana',
      tajuk: 'Game Solat Gerhana Matahari & Bulan',
      subjek: 'Ibadat (Pendidikan Islam)',
      darjah: 'Darjah 5',
      topik: 'Solat Sunat Kusuf & Khusuf',
      penerangan: 'Permainan platformer pengembaraan siber di mana murid melompat untuk memecahkan blok planet Jawi, menjawab kuiz definisi, hukum, waktu, dan surah mengenai gerhana matahari dan bulan, mengelak bola api naga, serta menumpaskan Boss!',
      ikon: '☀️🌙',
      pautan: '/permainan/gerhana',
      bilanganSoalan: '10 Soalan (3 Level)',
      tahapKesukaran: 'Sederhana'
    },
    {
      id: 'hari-raya',
      tajuk: 'Game Solat & Khutbah Hari Raya',
      subjek: 'Ibadat (Pendidikan Islam)',
      darjah: 'Darjah 3',
      topik: 'Solat & Khutbah Sunat Hari Raya',
      penerangan: 'Bantu murid menguasai rukun, jumlah takbir rakaat pertama dan kedua, lafaz takbir, syarat khutbah, serta sunat-sunat hari raya melalui permainan Arked interaktif bertahap (Tadrij) yang sangat menyeronokkan.',
      ikon: '🕋🎁',
      pautan: '/permainan/hari-raya',
      bilanganSoalan: '10 Soalan (3 Level)',
      tahapKesukaran: 'Mudah'
    },
    {
      id: 'solat-jumaat',
      tajuk: 'Game Solat & Khutbah Jumaat',
      subjek: 'Ibadat (Pendidikan Islam)',
      darjah: 'Darjah 4 / 5',
      topik: 'Solat Jumaat & Syarat Wajib',
      penerangan: 'Uji kefahaman murid mengenai syarat wajib dan sah solat Jumaat, rukun-rukun dua khutbah Jumaat, serta adab-adab sebelum dan selepas ke masjid. Jawab pantas, kumpul bintang, dan tebus kod ganjaran!',
      ikon: '🕌⚔️',
      pautan: '/permainan/solat-jumaat',
      bilanganSoalan: '10 Soalan (3 Level)',
      tahapKesukaran: 'Tinggi'
    }
  ];

  useEffect(() => {
    // Laraskan tema paparan sedia ada daripada LocalStorage atau tag HTML
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const tukarTema = () => {
    const temaBaharu = tema === 'dark' ? 'light' : 'dark';
    setTema(temaBaharu);
    localStorage.setItem('theme', temaBaharu);
    if (temaBaharu === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        
        {/* ================= HEADER PORTAL ARKED ================= */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-6 py-4 flex justify-between items-center font-bold text-sm border-b border-[#1272ab]/30">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎮</span>
            <span>RULAF-HUB :: ARKED DIDAKTIK UTAMA</span>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          
          {/* ================= HEBAHAN SISTEM & PHILOSOPHY ================= */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              RuLaF Arked Gamifikasi Jawi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Selamat datang ke portal permainan interaktif. Melalui pendekatan <strong>didik-hibur (fun learning)</strong>, murid-murid boleh mengasah kemahiran kognitif dan literasi Jawi secara praktikal. Bergerak, melompat, memecahkan kotak soalan, dan takluki Boss untuk mengukuhkan kefahaman Pendidikan Islam!
            </p>
          </div>

          {/* ================= SENARAI GRID GAME ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {senaraiGame.map((game) => (
              <div
                key={game.id}
                className="bg-gray-100 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-800 rounded p-6 flex flex-col justify-between hover:border-[#1793D1] dark:hover:border-[#1793D1]/50 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl select-none group-hover:scale-110 transition-transform duration-300">
                      {game.ikon}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      game.tahapKesukaran === 'Mudah' 
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/40' 
                        : game.tahapKesukaran === 'Sederhana'
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40'
                    }`}>
                      Kesukaran: {game.tahapKesukaran}
                    </span>
                  </div>

                  <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-extrabold mb-2">
                    {game.subjek} - {game.darjah}
                  </span>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#1793D1] transition-colors">
                    {game.tajuk}
                  </h2>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-sans leading-relaxed">
                    {game.penerangan}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800/80 pt-4 mt-4">
                  <div className="flex justify-between items-center text-xs mb-4 text-gray-400 dark:text-gray-500">
                    <span>Topik: {game.topik}</span>
                    <span>{game.bilanganSoalan}</span>
                  </div>
                  <a
                    href={`/permainan/${game.id}`}
                    className="block text-center bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[#1793D1] hover:text-[#0F1419] py-2.5 rounded text-xs font-bold transition-all"
                  >
                    [ Main Sekarang ]
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}