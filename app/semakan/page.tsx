'use client';
import { useState } from 'react'; 
import { supabase } from '../lib/supabaseClient';

export default function SemakanIbuBapa() { 
  const [carian, setCarian] = useState(''); 
  const [muridDitemui, setMuridDitemui] = useState<any>(null); 
  const [mesejRalat, setMesejRalat] = useState('');
  const [sedangMencari, setSedangMencari] = useState(false);

  const klikSemak = async () => { 
    setMesejRalat('');
    setMuridDitemui(null);
    if (!carian) return setMesejRalat('Sila masukkan nama murid.');

    setSedangMencari(true);

    // Menarik data markah dari Supabase berdasarkan nama
    const { data, error } = await supabase
      .from('markah_murid')
      .select('*')
      .eq('mykid', carian); // Carian tepat (EQUAL)

    if (error) {
      setMesejRalat('Ralat sistem: ' + error.message);
    } else if (data && data.length === 0) {
      setMesejRalat('Rekod murid tidak ditemui. Sila semak ejaan nama atau MyKid anak anda.');
    } else if (data && data.length > 0) {
      // TAMBAHKAN  PADA KOD DI BAWAH INI
      setMuridDitemui(data[0]); 
    }
    setSedangMencari(false);
  };

  return ( 
    <div className="min-h-screen bg-[#171A21] p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-[#282C34] p-8 rounded-lg shadow-lg border border-[#1793D1]">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Semakan Prestasi RuLaF</h1>
        <p className="text-gray-400 text-center mb-8 font-mono text-sm">Akses sistem semakan waktu-nyata (Real-time)</p>

        {/* Kotak Carian */}
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={carian} 
            onChange={(e) => setCarian(e.target.value)} 
            placeholder="Masukkan Nombor Mykid Anak Anda..." 
            className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-[#1793D1] outline-none rounded font-mono"
          />
          <button 
            onClick={klikSemak} 
            disabled={sedangMencari}
            className="bg-[#1793D1] hover:bg-blue-500 text-white font-bold py-3 px-6 rounded transition-colors disabled:bg-gray-600"
          >
            {sedangMencari ? 'Mencari...' : 'Semak'}
          </button>
        </div>

        {mesejRalat && <p className="text-red-400 font-mono text-center">{mesejRalat}</p>}

        {/* Kad Keputusan Markah ala Terminal */}
        {muridDitemui && (
          <div className="mt-8 bg-black p-6 rounded border border-gray-700 font-mono text-sm">
            <h2 className="text-[#1793D1] text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              [+] REKOD DIJUMPAI
            </h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <p><span className="text-white font-bold">NAMA:</span> {muridDitemui.nama}</p>
              <p><span className="text-white font-bold">KELAS:</span> {muridDitemui.kelas}</p>
              <p><span className="text-white font-bold">KEHADIRAN:</span> {muridDitemui.kehadiran}</p>
              <p><span className="text-white font-bold">MARKAH JAWI:</span> {muridDitemui.jawi}</p>
              <p><span className="text-white font-bold">BACAAN QURAN:</span> {muridDitemui.quran}</p>
              <p><span className="text-white font-bold">UJIAN HAFAZAN:</span> {muridDitemui.hafazan}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  ); 
}