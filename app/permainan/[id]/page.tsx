'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Definisi Jenis Data Permainan
interface Game {
  id: string;
  tajuk: string;
  subjek: string;
  darjah: string;
  topik: string;
  penerangan: string;
  ikon: string;
  pautanFile: string; // Pautan fail fizikal dalam folder /public/games/
  bilanganSoalan: string;
  tahapKesukaran: 'Mudah' | 'Sederhana' | 'Tinggi';
}

export default function PaparanPermainanAktif() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [tema, setTema] = useState('dark');
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      pautanFile: 'gerhana.html',
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
      pautanFile: 'hari-raya.html',
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
      pautanFile: 'jumaat.html',
      bilanganSoalan: '10 Soalan (3 Level)',
      tahapKesukaran: 'Tinggi'
    }
  ];

  useEffect(() => {
    // 1. Laraskan tema paparan sedia ada daripada LocalStorage atau tag HTML
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Padankan ID permainan
    setIsLoading(true);
    const permainanDipilih = senaraiGame.find((g) => g.id === gameId);
    if (permainanDipilih) {
      setGame(permainanDipilih);
    }
    setIsLoading(false);
  }, [gameId]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono text-gray-500 dark:text-[#A5B2D9]">
        <p className="animate-pulse">Menghubungkan konsol permainan RuLaF...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center p-6 font-mono text-gray-800 dark:text-[#A5B2D9]">
        <div className="max-w-md w-full bg-white dark:bg-[#171A21] border border-red-500/40 p-8 rounded shadow-lg text-center">
          <p className="text-red-500 font-bold mb-4">⚠️ Ralat: Permainan Tidak Ditemui!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Pautan permainan ini tidak wujud atau telah dikeluarkan oleh Guru Pentadbir.</p>
          <Link href="/permainan" className="inline-block bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded text-xs font-bold hover:bg-[#1793D1] hover:text-[#0F1419] transition-all">
            [ Kembali ke Arked Utama ]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        
        {/* ================= HEADER KONSOL PERMAINAN ================= */}
        <div className="bg-gray-100 dark:bg-[#11141b] border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors duration-300">
          <div>
            <Link
              href="/permainan"
              className="text-xs text-[#1793D1] hover:underline font-bold mb-1 block"
            >
              [ ⬅️ Balik Ke Arked Utama ]
            </Link>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{game.ikon}</span>
              <span>{game.tajuk}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-0.5">
              Subjek: {game.subjek} | Topik: {game.topik} | Kesukaran: {game.tahapKesukaran}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Butang Swis Tema Global */}
            <button
              onClick={tukarTema}
              className="p-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 transition-colors"
              title="Tukar Tema Paparan"
            >
              {tema === 'dark' ? '☀️ Cerah' : '🌙 Gelap'}
            </button>
            <a
              href={`/games/${game.pautanFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1793D1]/10 text-[#1793D1] border border-[#1793D1]/30 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all"
            >
              [ 🔗 Buka Skrin Penuh ]
            </a>
            <button
              onClick={() => {
                const iframe = document.getElementById('skrin-game-iframe') as HTMLIFrameElement;
                if (iframe) iframe.src = iframe.src;
              }}
              className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 text-xs rounded border border-gray-300 dark:border-gray-700 hover:border-gray-500 font-bold transition-all"
            >
              [ 🔄 Restart ]
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 bg-white dark:bg-[#171A21] transition-colors duration-300">
          
          {/* ================= KAWASAN KANVAS IFRAME PERMAINAN ================= */}
          <div className="relative w-full aspect-video min-h-[500px] border-4 border-gray-200 dark:border-gray-800 rounded bg-black shadow-lg overflow-hidden">
            <iframe
              id="skrin-game-iframe"
              src={`/games/${game.pautanFile}`}
              className="absolute top-0 left-0 w-full h-full border-none"
              allowFullScreen
              title={game.tajuk}
            />
          </div>

          {/* ================= PANEL PANDUAN CARA BERMAIN ================= */}
          <div className="bg-gray-100 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-850 rounded p-6 transition-colors duration-300">
            <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-3">🎮 Arahan & Cara Bermain:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 dark:text-gray-400 font-sans leading-relaxed">
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1.5">🕹️ Kawalan Pergerakan:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-bold font-mono">Arrow Left / Right (A / D)</span>: Bergerak ke kiri dan kanan persekitaran bertahap.</li>
                  <li><span className="font-bold font-mono">Arrow Up / Space (W)</span>: Melompat tinggi melintasi rintangan siber.</li>
                  <li><span className="font-bold">Butang Skrin Sentuh</span>: Tersedia pada paparan bawah sekiranya anda bermain menggunakan smartphone atau tablet!</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1.5">🎯 Peraturan Permainan:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Lompat dan hantuk bahagian bawah blok bertanda <span className="font-bold font-mono">🌑</span> atau <span className="font-bold font-mono">?</span> untuk membuka soalan kuiz Jawi.</li>
                  <li>Pilih jawapan yang betul untuk kumpul markah dan mengurangkan HP Boss Naga di level terakhir!</li>
                  <li>Kumpul bintang maksimum untuk penebusan hadiah ganjaran eksklusif RuLaFHub.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
