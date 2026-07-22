'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TebusKodPage() {
  // State Pengurusan Fasa
  const [langkah, setLangkah] = useState(1);
  const [statusMesej, setStatusMesej] = useState('');

  // State Data Murid & Kod
  const [mykid, setMykid] = useState('');
  const [kodRahsia, setKodRahsia] = useState('');
  const [tahapKognitif, setTahapKognitif] = useState('');
  const [jawapanMurid, setJawapanMurid] = useState('');

  // FASA 1: Semak Kod Rahsia & Tentukan Aras Soalan (AI Adaptive)
  const sahkanKod = () => {
    if (!mykid || !kodRahsia) return alert('Sila masukkan No. MyKid dan Kod Rahsia!');
    
    const kod = kodRahsia.toUpperCase();
    if (kod.includes('-A-')) {
      setTahapKognitif('Tinggi (RuLaF Ta)');
    } else if (kod.includes('-B-')) {
      setTahapKognitif('Sederhana (RuLaF Ba)');
    } else if (kod.includes('-C-')) {
      setTahapKognitif('Asas (RuLaF Alif)');
    } else {
      return alert('[!] Ralat: Kod Rahsia Tidak Sah atau Luput.');
    }
    setLangkah(2); // Pergi ke skrin Kuiz
  };

  // FASA 2: Hantar Jawapan & Automatik Masuk Supabase
  const hantarJawapan = async () => {
    setStatusMesej('Ejen AI sedang menyemak jawapan dan mengemas kini pangkalan data...');
    let markahTerkumpul = 0;

    // Logik pemarkahan ringkas (Prototaip Pertandingan)
    if (tahapKognitif === 'Tinggi (RuLaF Ta)' && jawapanMurid === 'تڠݢوڠجواب') markahTerkumpul = 95;
    else if (tahapKognitif === 'Sederhana (RuLaF Ba)' && jawapanMurid === 'سکوله') markahTerkumpul = 75;
    else if (tahapKognitif === 'Asas (RuLaF Alif)' && jawapanMurid === 'ب') markahTerkumpul = 50;
    else markahTerkumpul = 20; // Jika salah jawab

    // Hantar terus ke Supabase (Automatik kemas kini markah Jawi)
    const { error } = await supabase
      .from('markah_murid')
      .update({ markah_jawi: markahTerkumpul })
      .eq('mykid', mykid);

    if (error) {
      alert('Ralat Pangkalan Data: ' + error.message);
      setStatusMesej('');
    } else {
      setLangkah(3); // Pergi ke skrin Berjaya
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-6 sm:p-10 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-[#171A21] border border-blue-500 rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-3 font-bold flex justify-between">
          <span>~/ RuLaFHub_Redeem_Portal</span>
          <span>[ VERSI EKSKLUSIF ]</span>
        </div>

        <div className="p-8">
          {/* ================================================= */}
          {/* LANGKAH 1: MASUKKAN KOD RAHSIA DARI KOTAK FIZIKAL */}
          {/* ================================================= */}
          {langkah === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white text-center">Buka Kunci Latihan Pengukuhan</h2>
              <p className="text-sm text-gray-400 text-center mb-4">Sila masukkan Nombor MyKid anda dan Kod Rahsia yang diperoleh daripada <b>The RuLaF Box</b>.</p>
              
              <input 
                type="text" placeholder="No. MyKid (Cth: 170807010333)" 
                value={mykid} onChange={(e) => setMykid(e.target.value)}
                className="p-3 bg-gray-900 border border-gray-600 rounded text-white focus:border-blue-400 outline-none"
              />
              <input 
                type="text" placeholder="Kod Rahsia (Cth: RULAF-A-99)" 
                value={kodRahsia} onChange={(e) => setKodRahsia(e.target.value)}
                className="p-3 bg-gray-900 border border-blue-500 rounded text-green-400 font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={sahkanKod} 
                className="mt-4 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-500 transition-colors shadow-lg"
              >
                [ SAHKAN KOD RAHSIA ]
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* LANGKAH 2: POP QUIZ ADAPTIF MENGIKUT TAHAP KOD    */}
          {/* ================================================= */}
          {langkah === 2 && (
            <div className="flex flex-col gap-5 animate-pulse-once">
              <div className="p-4 bg-gray-800 border-l-4 border-yellow-500 mb-2">
                <p className="text-xs text-yellow-400 font-bold">[*] KOD DITERIMA. TAHAP DIKESAN: {tahapKognitif}</p>
                <p className="text-xs text-gray-400 mt-1">Ejen AI sedang menjana soalan khusus untuk tahap kognitif anda...</p>
              </div>

              <h2 className="text-lg font-bold text-white mb-2">Misi Pengukuhan Digital</h2>
              
              {/* Soalan Berubah Mengikut Tahap */}
              <div className="text-lg text-blue-300 bg-gray-900 p-4 rounded border border-gray-700">
                {tahapKognitif === 'Tinggi (RuLaF Ta)' && <p>Pilih ejaan Jawi yang tepat bagi perkataan: <b>Tanggungjawab</b></p>}
                {tahapKognitif === 'Sederhana (RuLaF Ba)' && <p>Pilih ejaan Jawi yang tepat bagi perkataan: <b>Sekolah</b></p>}
                {tahapKognitif === 'Asas (RuLaF Alif)' && <p>Manakah antara berikut adalah huruf <b>Ba</b>?</p>}
              </div>

              {/* Pilihan Jawapan */}
              <select 
                value={jawapanMurid} onChange={(e) => setJawapanMurid(e.target.value)}
                className="p-3 bg-gray-900 border border-gray-600 rounded text-white outline-none"
              >
                <option value="">-- Pilih Jawapan Anda --</option>
                <option value="تڠݢوڠجواب">تڠݢوڠجواب</option>
                <option value="سکوله">سکوله</option>
                <option value="ب">ب</option>
                <option value="ڤرايلاءن">ڤرايلاءن</option>
              </select>

              <button 
                onClick={hantarJawapan} 
                className="mt-4 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-500 transition-colors shadow-lg"
              >
                [ HANTAR JAWAPAN & KIRA MARKAH ]
              </button>

              {statusMesej && <p className="text-sm text-yellow-400 text-center animate-pulse">{statusMesej}</p>}
            </div>
          )}

          {/* ================================================= */}
          {/* LANGKAH 3: KEPUTUSAN & PENILAIAN AUTOMATIK AI     */}
          {/* ================================================= */}
          {langkah === 3 && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-gray-900 font-black text-2xl mb-2 shadow-[0_0_15px_rgba(34,197,94,0.6)]">✓</div>
              <h2 className="text-2xl font-bold text-white">Misi Selesai!</h2>
              <p className="text-gray-300">Markah anda telah direkodkan ke dalam <b>Pangkalan Data Pusat RuLaFHub</b>.</p>
              <p className="text-sm text-gray-400 mt-2">Ejen AI akan menganalisis prestasi anda untuk menyusun kumpulan pedagogi pada kitaran bulan hadapan.</p>
              
              <button 
                onClick={() => window.location.href = '/semakan'} 
                className="mt-6 border border-blue-500 text-blue-400 font-bold py-2 px-6 rounded hover:bg-blue-900 transition-colors"
              >
                [ SEMAK KEDUDUKAN REKOD ANDA ]
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}