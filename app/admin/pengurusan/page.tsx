'use client';
import React, { useState } from 'react';
import { supabase } from './../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PengurusanSekolah() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('markah');
  
  // State Tetapan
  const [kelas, setKelas] = useState('3 Murshid');
  const [bulanTahun, setBulanTahun] = useState('');

  // State Data Grid
  const [senaraiMurid, setSenaraiMurid] = useState<any[]>([]);
  const [borangMarkah, setBorangMarkah] = useState<any>({});
  const [isPushing, setIsPushing] = useState(false);

  // Fungsi Tarik Data Murid berdasarkan Kelas
  const janaSenaraiMurid = async () => {
    if (!bulanTahun) return alert('[!] Ralat: Sila masukkan Bulan & Tahun penggredan dahulu (Contoh: April 2026)');

    // Nota Penggodam: Di alam nyata kelak, kita akan tarik senarai ini dari jadual 'rulaf_murid'
    // const { data } = await supabase.from('rulaf_murid').select('*').eq('kelas', kelas);

    // Untuk demo pantas, kita gunakan data empirikal dari rekod PDF RuLaF bosskur!
    let dataPelajar: any[] = [];
    if (kelas === '3 Murshid') {
      dataPelajar = [
        { mykid: '170101130001', nama: 'Nuraira binti Ibrahim' },
        { mykid: '170102130002', nama: 'Inshirah Dhabiyyah binti Mohamad Nasiruddin' },
        { mykid: '170103130003', nama: 'Nur Raisha binti Muhammad Firdaus' },
        { mykid: '170104130004', nama: 'Arina Mikayla binti Muhammad Radzib' },
        { mykid: '170105130005', nama: 'Qaseh Nur Damia binti Abdul Shukur' }
      ];
    } else {
      dataPelajar = [
        { mykid: '150201130001', nama: 'Nur Auni Aleesya binti Muhammad Khairulnizam' },
        { mykid: '150202130002', nama: 'Nur Dahlia Daliysha binti Sulaiman' },
        { mykid: '150203130003', nama: 'Nurmuazah binti Muhizan' },
        { mykid: '150204130004', nama: 'Nur Zakirah Nurain binti Muhamad Zaini' },
        { mykid: '150205130005', nama: 'Ameera binti Abdul Razak' }
      ];
    }

    setSenaraiMurid(dataPelajar);

    // Sediakan 'otak' (state) borang kosong untuk setiap mykid
    const stateAwal: any = {};
    dataPelajar.forEach((murid) => {
      stateAwal[murid.mykid] = {
        kehadiran: '', markah_jawi: '', bacaan_quran: '', hafazan: ''
      };
    });
    setBorangMarkah(stateAwal);
  };

  // Fungsi mengesan ketukan keyboard pada kotak grid (sel)
  const handleInput = (mykid: string, field: string, value: string) => {
    setBorangMarkah((prev: any) => ({
      ...prev,
      [mykid]: {
        ...prev[mykid],
        [field]: value
      }
    }));
  };

  const pushBulkData = async () => {
    setIsPushing(true);
    // Kita bina struktur Array JSON untuk di-'Bulk Insert' ke Supabase
    const payload = senaraiMurid.map((murid) => ({
      mykid: murid.mykid,
      nama_murid: murid.nama,
      kelas_id: kelas,
      bulan_tahun: bulanTahun,
      kehadiran: borangMarkah[murid.mykid].kehadiran,
      markah_jawi: borangMarkah[murid.mykid].markah_jawi,
      bacaan_quran: borangMarkah[murid.mykid].bacaan_quran,
      hafazan: borangMarkah[murid.mykid].hafazan
    }));

    // Arahan Execute (Push)
    const { error } = await supabase.from('markah_murid').insert(payload);

    if (error) {
      alert('Ralat Bulk Insert: ' + error.message);
    } else {
      alert(`[+] BOOM! Data markah untuk ${payload.length} orang murid kelas ${kelas} bagi sesi ${bulanTahun} berjaya dipush serentak!`);
      setSenaraiMurid([]); // Kosongkan paparan selepas berjaya
      setBulanTahun('');
    }
    setIsPushing(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - PENGURUSAN INSTITUSI & PENGGREDAN (BULK MODE)</span>
          <button onClick={() => router.push('/admin')} className="hover:text-white font-bold transition-colors">
            [ cd .. / Kembali ke Admin ]
          </button>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-black text-white mb-6 border-b border-gray-700 pb-4">
            Platform Penggredan Pukal Masa Nyata
          </h1>

          {/* TETAPAN KELAS & BULAN */}
          <div className="bg-black p-6 border border-purple-500 border-l-4 mb-8 shadow-md flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full">
              <label className="block text-xs font-bold mb-1 text-purple-400">PILIH KELAS:</label>
              <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="w-full p-2 bg-gray-900 border border-gray-700 text-white outline-none focus:border-purple-500">
                <option>3 Murshid</option>
                <option>5 Murshid</option>
              </select>
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold mb-1 text-green-400">BULAN & TAHUN PENGGREDAN:</label>
              <input type="text" value={bulanTahun} onChange={(e)=>setBulanTahun(e.target.value)} className="w-full p-2 bg-gray-900 border border-green-500/50 text-white outline-none focus:border-green-400" placeholder="Contoh: April 2026" />
            </div>
            <button onClick={janaSenaraiMurid} className="bg-purple-600 text-white px-6 py-2 font-bold hover:bg-purple-500 transition-colors whitespace-nowrap h-[42px]">
              [ PANGGIL DATA ]
            </button>
          </div>

          {/* DATA GRID SPREADSHEET */}
          {senaraiMurid.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 shadow-md overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-[#1793D1] text-xs border-b border-gray-700">
                    <th className="p-3 font-bold">NAMA MURID</th>
                    <th className="p-3 font-bold w-24">KEHADIRAN</th>
                    <th className="p-3 font-bold w-24">JAWI (%)</th>
                    <th className="p-3 font-bold w-32">BACAAN QURAN</th>
                    <th className="p-3 font-bold w-32">HAFAZAN</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {senaraiMurid.map((murid) => (
                    <tr key={murid.mykid} className="border-b border-gray-800 hover:bg-black/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{murid.nama}</div>
                        <div className="text-xs text-gray-500">{murid.mykid}</div>
                      </td>
                      <td className="p-3">
                        <input type="number" value={borangMarkah[murid.mykid]?.kehadiran} onChange={(e) => handleInput(murid.mykid, 'kehadiran', e.target.value)} className="w-full p-1 bg-black border border-gray-700 text-center text-white outline-none focus:border-[#1793D1]" placeholder="Hari" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={borangMarkah[murid.mykid]?.markah_jawi} onChange={(e) => handleInput(murid.mykid, 'markah_jawi', e.target.value)} className="w-full p-1 bg-black border border-gray-700 text-center text-white outline-none focus:border-[#1793D1]" placeholder="%" />
                      </td>
                      <td className="p-3">
                        <select value={borangMarkah[murid.mykid]?.bacaan_quran} onChange={(e) => handleInput(murid.mykid, 'bacaan_quran', e.target.value)} className="w-full p-1 bg-black border border-gray-700 text-xs text-white outline-none focus:border-[#1793D1]">
                          <option value="">Pilih</option>
                          <option value="Iqra 1-6">Iqra 1-6</option>
                          <option value="Al-Quran">Al-Quran</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input type="text" value={borangMarkah[murid.mykid]?.hafazan} onChange={(e) => handleInput(murid.mykid, 'hafazan', e.target.value)} className="w-full p-1 bg-black border border-gray-700 text-center text-white outline-none focus:border-[#1793D1]" placeholder="Gred" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-black border-t border-gray-700 flex justify-end">
                <button onClick={pushBulkData} disabled={isPushing} className="bg-green-600 text-black px-8 py-2 font-bold hover:bg-green-500 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.4)] disabled:bg-gray-600 disabled:text-gray-400">
                  {isPushing ? 'MENYIMPAN...' : '[ EXECUTE: PUSH BULK DATA ]'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}