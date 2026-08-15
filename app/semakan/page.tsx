'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 

export default function SemakanIbuBapa() {
  const [carian, setCarian] = useState('');
  const [muridDitemui, setMuridDitemui] = useState<any>(null);
  const [mesejRalat, setMesejRalat] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fungsi menyedut data dari Supabase menggunakan MyKid
  const klikSemak = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesejRalat('');
    setMuridDitemui(null);
    setIsSearching(true);

    if (!carian) {
      setMesejRalat('[!] Sila masukkan nombor MyKid.');
      setIsSearching(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('markah_murid')
        .select('*')
        .eq('mykid', carian)
        .order('bulan_tahun', { ascending: false }) // Ambil rekod bulan terbaharu
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setMuridDitemui(data[0]); // Rekod dijumpai!
      } else {
        setMesejRalat('[!] Rekod tidak dijumpai. Sila pastikan MyKid adalah tepat tanpa sengkang (-).');
      }
    } catch (err: any) {
      setMesejRalat('[!] Ralat Sistem: ' + err.message);
    }
    setIsSearching(false);
  };

  return (
  <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] p-4 sm:p-10 flex flex-col items-center justify-center selection:bg-[#1793D1] selection:text-white">
    <div className="max-w-4xl w-full bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded-sm p-6 shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] transition-all duration-300">
      
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
          Semakan Prestasi RuLaF
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-mono">
          [ Portal Akses Semakan Waktu-Nyata (Real-time) Ibu Bapa & Penjaga ]
        </p>
      </div>

      {/* Input Carian Semakan */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Masukkan No. MyKid (Cth: 170807010333)"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          className="flex-1 bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-500 font-mono text-sm"
        />
        <button
          onClick={klikSemak}
          className="bg-[#1793D1] text-[#0F1419] font-extrabold px-8 py-3 rounded text-sm hover:bg-[#1272ab] transition-colors"
        >
          [ SEMAK ]
        </button>
      </div>

      {/* Mesej Ralat */}
      {mesejRalat && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 p-4 rounded text-sm mb-6 text-center font-mono">
          {mesejRalat}
        </div>
      )}

      {/* KAD KEPUTUSAN MURID */}
      {muridDitemui && (
        <div className="border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
          <div className="bg-gray-100 dark:bg-[#11141b] px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white text-xs font-mono">
            [+] REKOD DIJUMPAI
          </div>
          <div className="p-6 bg-white dark:bg-[#171A21] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <p className="text-gray-500 dark:text-gray-400">NAMA:</p>
              <p className="font-bold text-gray-900 dark:text-white">{muridDitemui.nama_murid}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">KELAS:</p>
              <p className="font-bold text-gray-900 dark:text-white">{muridDitemui.kelas_id}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">REKOD KEHADIRAN:</p>
              <p className="font-bold text-gray-900 dark:text-white">{muridDitemui.kehadiran} / {muridDitemui.jumlah_hari_sekolah || '60'} Hari</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">KUMPULAN RULAF:</p>
              <p className="font-bold text-[#1793D1]">{muridDitemui.tahap_rulaf || 'Belum Ditetapkan'}</p>
            </div>
          </div>

          {/* BAHAGIAN MARKAH */}
          <div className="p-6 bg-gray-50 dark:bg-[#11141b]/40 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-white dark:bg-[#171A21] p-4 border border-gray-200 dark:border-gray-800 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">MARKAH JAWI</p>
              <p className="text-2xl font-black text-[#1793D1] mt-1">{muridDitemui.markah_jawi}%</p>
            </div>
            <div className="bg-white dark:bg-[#171A21] p-4 border border-gray-200 dark:border-gray-800 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">BACAAN QURAN</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{muridDitemui.bacaan_quran || '-'}</p>
            </div>
            <div className="bg-white dark:bg-[#171A21] p-4 border border-gray-200 dark:border-gray-800 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">UJIAN HAFAZAN</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{muridDitemui.hafazan || '-'}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);
}