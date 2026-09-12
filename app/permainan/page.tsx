'use client';

import React, { useState, useEffect } from 'react';
import bankSoalan from './../data/soalan.json';
import { supabase } from './../lib/supabaseClient';
import Link from 'next/link';
import CountDownUpkk from '@/components/CountDownUpkk';

interface Game {
  id: string;
  tajuk: string;
  subjek: string;
  deskripsi: string;
  ikon: string;
  kesukaran: string;
}

export default function PermainanMenuPage() {
  const [tema, setTema] = useState('dark');
  const [dbQuizzes, setDbQuizzes] = useState<any[]>([]);
  const [carian, setCarian] = useState('');

  useEffect(() => {
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    tarikKuizSupabase();
  }, []);

  const tarikKuizSupabase = async () => {
    try {
      const { data } = await supabase.from('rulaf_kuiz').select('*');
      if (data) setDbQuizzes(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 🚀 PEMBACAAN DINAMIK 100% DARI soalan.json (Sama Seperti Kod Kotlin)
  const senaraiSiriGame: Game[] = Object.entries(bankSoalan).map(([key, data]: [string, any]) => {
    const subjekLower = (data.subjek || '').toLowerCase();
    
    // Auto-tetap ikon mengikut subjek jika tiada ikon khusus
    let defaultIkon = '⚔️';
    if (subjekLower.includes('ibadah')) defaultIkon = '🕌';
    else if (subjekLower.includes('jawi')) defaultIkon = '📝';
    else if (subjekLower.includes('arab')) defaultIkon = '📖';

    // Auto-tetap kesukaran mengikut aras level
    let defaultKesukaran = 'Sederhana';
    if (data.level3 && data.level3.length > 0) defaultKesukaran = 'Tinggi';
    else if (!data.level2 || data.level2.length === 0) defaultKesukaran = 'Mudah';

    return {
      id: key,
      tajuk: data.tajuk || key,
      subjek: data.subjek || 'Umum',
      deskripsi: data.deskripsi || 'Misi latih tubi pentaksiran interaktif.',
      ikon: data.ikon || defaultIkon,
      kesukaran: data.kesukaran || defaultKesukaran
    };
  });

  // Gabungkan soalan JSON bersama kuiz guru dari Supabase
  const semuaPermainan = [
    ...senaraiSiriGame,
    ...dbQuizzes.map(q => ({
      id: q.id.toString(),
      tajuk: q.tajuk,
      subjek: q.subjek,
      deskripsi: q.deskripsi || 'Kuiz interaktif dinamik yang diterbitkan oleh Guru.',
      ikon: q.subjek?.toLowerCase().includes('ibadah') ? '🕌' : '📝',
      kesukaran: q.darjah || 'Sederhana'
    }))
  ];

  const ditapis = semuaPermainan.filter(g => 
    g.tajuk.toLowerCase().includes(carian.toLowerCase()) ||
    g.subjek.toLowerCase().includes(carian.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded shadow-md transition-all duration-300">
        
        <CountDownUpkk />

        {/* Header Arked */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-6 py-4 flex justify-between items-center font-bold text-sm border-b">
          <div className="flex items-center gap-3">
            <span>🎮</span>
            <span>RULAF-HUB :: ARKED DIDAKTIK INTERAKTIF</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:underline">[ cd ~/ ]</Link>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Arked Didaktik RuLaF
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Misi permainan interaktif berasaskan modular yang menyokong pentaksiran formatif.
              Siri permainan ini dibina secara asli berdasarkan prinsip <strong>Tadrij (Pembelajaran Bertahap)</strong>.
            </p>
          </div>

          {/* Bar Carian */}
          <div className="mb-8 max-w-md mx-auto">
            <input
              type="text"
              placeholder="🔍 Cari misi permainan..."
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-4 py-2.5 text-sm focus:border-[#1793D1] focus:outline-none text-gray-900 dark:text-white"
            />
          </div>

          {/* Grid Permainan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ditapis.map((game) => (
              <div
                key={game.id}
                className="bg-gray-100/50 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-800 rounded p-6 flex flex-col justify-between hover:border-[#1793D1]/50 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl select-none group-hover:scale-110 transition-transform duration-300">
                      {game.ikon}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      game.kesukaran === 'Mudah'
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/40'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                    }`}>
                      Kesukaran: {game.kesukaran}
                    </span>
                  </div>

                  <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-extrabold mb-2">
                    {game.subjek}
                  </span>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#1793D1] transition-colors">
                    {game.tajuk}
                  </h2>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-sans leading-relaxed">
                    {game.deskripsi}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800/80 pt-4 mt-4">
                  <Link
                    href={`/permainan/${game.id}`}
                    className="block text-center bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[#1793D1] hover:text-[#0F1419] py-2.5 rounded text-xs font-bold transition-all"
                  >
                    [ MULA MAIN & BELAJAR ]
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}