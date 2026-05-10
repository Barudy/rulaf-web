'use client'; // WAJIB letak ini di baris paling atas! Ia memberitahu Next.js bahawa muka depan ini adalah 'interaktif'

import { useState } from 'react';
import RuLaFCard from '../components/RuLaFCard';
import senaraiMurid from '../data/murid.json';

export default function Home() {
  // 1. Kita wujudkan 'memori' untuk menyimpan apa yang ditaip dan dipilih oleh pengguna
  const [carian, setCarian] = useState('');
  const [tapisTahap, setTapisTahap] = useState('Semua');

  // 2. Logik Tapisan Pintar: Sistem akan saring data JSON berdasarkan memori di atas
  const muridDitapis = senaraiMurid.filter((murid) => {
    const padanNama = murid.nama.toLowerCase().includes(carian.toLowerCase());
    const padanTahap = tapisTahap === 'Semua' || murid.tahap === tapisTahap;
    return padanNama && padanTahap; // Lulus ujian saringan jika dua-dua syarat dipenuhi
  });

  return (
    <div className="min-h-screen bg-gray-900 p-10 flex flex-col items-center">
      <h1 className="text-4xl font-black text-white mb-8">Pusat Data RuLaF</h1>

      {/* BAHAGIAN BAHARU: Kotak Carian & Dropdown Tapisan */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-4xl justify-center">
        
        {/* Input untuk taip nama */}
        <input
          type="text"
          placeholder="Cari nama murid (Contoh: Ahmad)..."
          className="p-4 rounded-xl w-full md:w-2/3 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-lg"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
        />
        
        {/* Dropdown untuk pilih Tahap RuLaF */}
        <select
          className="p-4 rounded-xl w-full md:w-1/3 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-500 cursor-pointer shadow-lg uppercase"
          value={tapisTahap}
          onChange={(e) => setTapisTahap(e.target.value)}
        >
          <option value="Semua">Semua Tahap</option>
          <option value="Ta">RuLaF Ta Sahaja</option>
          <option value="Ba">RuLaF Ba Sahaja</option>
          <option value="Khas">RuLaF Khas Sahaja</option>
        </select>
        
      </div>

      {/* Paparan Kad yang telah ditapis */}
      <div className="flex flex-wrap gap-6 justify-center">
        {muridDitapis.length > 0 ? (
          muridDitapis.map((murid) => (
            <RuLaFCard key={murid.id} student={murid} />
          ))
        ) : (
          <div className="flex flex-col items-center mt-10">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-gray-400 text-xl font-semibold uppercase">Tiada rekod murid dijumpai</p>
          </div>
        )}
      </div>
    </div>
  );
}
