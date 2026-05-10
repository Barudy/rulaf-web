'use client';

import { useState } from 'react';
import RuLaFCard from '../components/RuLaFCard';
import senaraiMurid from '../data/murid.json';

export default function Home() {
  // --- BAHAGIAN KUNCI KESELAMATAN ---
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- BAHAGIAN CARIAN & TAPISAN ---
  const [carian, setCarian] = useState('');
  const [tapisTahap, setTapisTahap] = useState('Semua');

  const klikLogin = () => {
    // Bosskur boleh tukar 'rulaf2026' kepada password rahsia sendiri
    if (password === 'rulaf2026') {
      setIsLocked(false);
    } else {
      setErrorMsg('Kata laluan salah! Misi menghendap digagalkan.');
    }
  };

  // 1. PAPARAN PINTU PAGAR (Jika belum letak password)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-10">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
          <h1 className="text-3xl font-black text-white mb-2 text-center">Admin RuLaF</h1>
          <p className="text-gray-400 text-sm mb-8 text-center">Sila masukkan kata laluan untuk akses panel guru.</p>
          
          <input
            type="password"
            placeholder="Kata Laluan..."
            className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-center tracking-widest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && klikLogin()}
          />
          
          <button
            onClick={klikLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition duration-300"
          >
            LOG MASUK
          </button>
          
          {errorMsg && (
            <p className="text-red-400 mt-6 text-center text-sm font-semibold bg-red-900/30 p-2 rounded">{errorMsg}</p>
          )}
        </div>
      </div>
    );
  }

  // 2. PAPARAN DASHBOARD ADMIN (Jika password betul)
  const muridDitapis = senaraiMurid.filter((murid) => {
    const padanNama = murid.nama.toLowerCase().includes(carian.toLowerCase());
    const padanTahap = tapisTahap === 'Semua' || murid.tahap === tapisTahap;
    return padanNama && padanTahap;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-10 flex flex-col items-center">
      <h1 className="text-4xl font-black text-white mb-8">Pusat Data RuLaF (Mod Admin)</h1>

            {/* Kotak Carian & Dropdown Tapisan */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-4xl justify-center">
        <input
          type="text"
          placeholder="Cari nama murid..."
          className="p-4 rounded-xl w-full md:w-2/3 bg-white text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-lg"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
        />
        <select
          className="p-4 rounded-xl w-full md:w-1/3 bg-white text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-500 cursor-pointer shadow-lg uppercase"
          value={tapisTahap}
          onChange={(e) => setTapisTahap(e.target.value)}
        >
          <option value="Semua">Semua Tahap</option>
          <option value="Ta">RuLaF Ta Sahaja</option>
          <option value="Ba">RuLaF Ba Sahaja</option>
          <option value="Khas">RuLaF Khas Sahaja</option>
        </select>
      </div>


      {/* Paparan Kad */}
      <div className="flex flex-wrap gap-6 justify-center">
        {muridDitapis.length > 0 ? (
          muridDitapis.map((murid) => (
            <RuLaFCard key={murid.id} student={murid} />
          ))
        ) : (
          <div className="flex flex-col items-center mt-10">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-gray-400 text-xl font-semibold uppercase">Tiada rekod dijumpai</p>
          </div>
        )}
      </div>
    </div>
  );
}
