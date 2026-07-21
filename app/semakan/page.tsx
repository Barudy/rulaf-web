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
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 flex flex-col items-center selection:bg-[#1793D1] selection:text-white">
      
      <div className="max-w-2xl w-full bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.2)] p-8">
        <h1 className="text-3xl font-black text-white mb-2 border-b border-gray-700 pb-4">Semakan Prestasi RuLaF</h1>
        <p className="text-gray-400 text-sm mb-6">Akses sistem semakan waktu-nyata (Real-time) untuk ibu bapa dan penjaga.</p>

        {/* KOTAK CARIAN */}
        <form onSubmit={klikSemak} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Masukkan No. MyKid (Cth: 170807010333)"
            className="flex-1 p-3 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1] transition-colors"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-[#1793D1] text-[#0F1419] px-6 py-3 font-bold hover:bg-blue-400 transition-colors disabled:bg-gray-600 whitespace-nowrap"
          >
            {isSearching ? 'MENYEMAK...' : '[ SEMAK ]'}
          </button>
        </form>

        {/* PAPARAN RALAT */}
        {mesejRalat && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-400 font-bold text-sm animate-pulse">{mesejRalat}</p>
          </div>
        )}

        {/* PAPARAN REKOD MURID */}
        {muridDitemui && (
          <div className="bg-black border border-gray-700 p-6 shadow-inner">
            <h2 className="text-[#1793D1] font-bold text-lg mb-4 pb-2 border-b border-gray-800">[+] REKOD DIJUMPAI</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1">NAMA MURID:</p>
                <p className="text-white font-bold">{muridDitemui.nama_murid || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1">KELAS:</p>
                <p className="text-white font-bold">{muridDitemui.kelas_id || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1">REKOD KEHADIRAN:</p>
                <p className="text-white font-bold">{muridDitemui.kehadiran ? `${muridDitemui.kehadiran} Hari` : '0'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1">KUMPULAN RULAF:</p>
                <p className={`font-bold ${muridDitemui.tahap_rulaf === 'RuLaF Ta' ? 'text-blue-400' : muridDitemui.tahap_rulaf === 'RuLaF Ba' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {muridDitemui.tahap_rulaf || 'Belum Ditetapkan'}
                </p>
              </div>
              
              <div className="col-span-1 sm:col-span-2 mt-4 pt-4 border-t border-gray-800">
                <p className="text-[#1793D1] font-bold mb-3"> PENCAPAIAN AKADEMIK ({muridDitemui.bulan_tahun || 'Terkini'})</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-900 p-3 rounded-sm border border-gray-700">
                    <p className="text-gray-500 text-xs mb-1">MARKAH JAWI</p>
                    <p className="text-2xl font-black text-white">{muridDitemui.markah_jawi || '0'}%</p>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-sm border border-gray-700">
                    <p className="text-gray-500 text-xs mb-1">BACAAN QURAN</p>
                    <p className="text-lg font-bold text-white">{muridDitemui.bacaan_quran || '-'}</p>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-sm border border-gray-700">
                    <p className="text-gray-500 text-xs mb-1">UJIAN HAFAZAN</p>
                    <p className="text-lg font-bold text-white">{muridDitemui.hafazan || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}