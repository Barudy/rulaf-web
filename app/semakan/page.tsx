'use client';

import { useState } from 'react';
import RuLaFCard from '../../components/RuLaFCard';
import senaraiMurid from '../../data/murid.json';

export default function SemakanIbuBapa() {
  const [carian, setCarian] = useState('');
  const [muridDitemui, setMuridDitemui] = useState<any>(null);
  const [mesejRalat, setMesejRalat] = useState('');

  const klikSemak = () => {
    setMesejRalat('');
    
    // Cari padanan nombor MyKid/IC (Buang sebarang ruang kosong jika ibu bapa tertekan 'space')
        // Buang SEMUA jenis jarak kosong dalam apa yang ditaip oleh ibu bapa
    const nomborIC = carian.replace(/\s/g, ''); 
    
    const jumpa = senaraiMurid.find((murid) => 
      // Kita buang juga jarak kosong dalam fail JSON (kot-kot ada terselit lagi)
      String(murid.id).replace(/\s/g, '') === nomborIC
    );


    if (jumpa) {
      setMuridDitemui(jumpa);
    } else {
      setMuridDitemui(null);
      setMesejRalat('Rekod tidak dijumpai. Sila pastikan Nombor MyKid / IC dimasukkan dengan betul tanpa sempang (-).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-10 flex flex-col items-center justify-center">
      
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col items-center border border-slate-700">
        <h1 className="text-3xl font-black text-white mb-2 text-center">Portal Ibu Bapa</h1>
        <p className="text-slate-400 mb-8 text-center text-sm">Semakan Keputusan Program RuLaF</p>

        {/* KOTAK INPUT: Ditambah bg-white supaya teks sangat jelas */}
        <input
          type="text"
          placeholder="No. MyKid (Cth: 160514011234)"
          className="p-4 rounded-xl w-full bg-white text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500 mb-4 text-center tracking-widest text-lg"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && klikSemak()}
        />

        <button 
          onClick={klikSemak}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg tracking-wide uppercase"
        >
          Semak Keputusan
        </button>

        {/* Paparan mesej ralat jika MyKid salah */}
        {mesejRalat && (
          <p className="text-red-400 mt-6 font-semibold text-center bg-red-900/30 p-3 rounded-lg w-full">
            {mesejRalat}
          </p>
        )}
      </div>

      {muridDitemui && (
        <div className="mt-12 animate-fade-in-up">
          <p className="text-emerald-400 text-center mb-4 font-bold tracking-widest uppercase">✨ Rekod Dijumpai ✨</p>
          <RuLaFCard student={muridDitemui} />
        </div>
      )}

    </div>
  );
}
