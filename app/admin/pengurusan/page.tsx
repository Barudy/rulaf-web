'use client';
import React, { useState } from 'react';
import { supabase } from './../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PengurusanSekolah() {
  const router = useRouter();
  
  // Hierarki 1: Sekolah
  const [sekolah, setSekolah] = useState('JYP0014 : SEKOLAH AGAMA SERI MUAFAKAT (6581)');
  
  // Hierarki 2: Kelas & Sesi
  const [kelas, setKelas] = useState('');
  const [bulanTahun, setBulanTahun] = useState('');

  // Hierarki 3: Pelajar & Markah
  const [senaraiMurid, setSenaraiMurid] = useState<any[]>([]);
  const [borangMarkah, setBorangMarkah] = useState<any>({});
  const [isPushing, setIsPushing] = useState(false);

  // Fungsi Tarik Data Murid dari Supabase berdasarkan kelas dan sesi yang dipilih
  const paparSenaraiPelajar = async () => {
    if (!kelas) return alert('[!] Ralat: Sila pilih kelas.');
    if (!bulanTahun) return alert('[!] Ralat: Sila masukkan Bulan & Tahun penggredan.');

    setIsPushing(true); // Guna state loading jika ada

    // Sistem hanya meminta Supabase serahkan data tanpa mendedahkannya dalam kod sumber
    const { data, error } = await supabase
      .from('data_murid')
      .select('mykid, nama_murid, kelas_id, jantina')
      .eq('kelas_id', kelas)
      .order('nama_murid', { ascending: true }); // Susun ikut abjad

    setIsPushing(false);

    if (error) {
      console.error("Ralat menarik data:", error.message);
      return alert('[!] Gagal menarik data dari pangkalan data.');
    }

    if (data && data.length > 0) {
      // Formatkan semula data dari Supabase supaya serasi dengan kod antaramuka (UI) web
      const dataFormatBaru = data.map((item, index) => ({
        bil: index + 1,             // Penomboran automatik bermula dari 1, 2, 3...
        mykid: item.mykid,
        nama: item.nama_murid,      // Petakan 'nama_murid' (Supabase) kepada 'nama' (UI)
        jantina: item.jantina
      }));
      
      setSenaraiMurid(dataFormatBaru); 
    } else {
      alert('Tiada murid dijumpai untuk kelas ini.');
      setSenaraiMurid([]);
    }
  };

  const handleInput = (mykid: string, field: string, value: string) => {
    setBorangMarkah((prev: any) => ({
      ...prev,
      [mykid]: { ...prev[mykid], [field]: value }
    }));
  };

  const pushSistem = async () => {
    setIsPushing(true);
    const payload = senaraiMurid.map((murid) => ({
      mykid: murid.mykid,
      nama_murid: murid.nama,
      kelas_id: kelas,
      bulan_tahun: bulanTahun,
      kehadiran: borangMarkah[murid.mykid].kehadiran,
      markah_jawi: borangMarkah[murid.mykid].markah_jawi,
      bacaan_quran: borangMarkah[murid.mykid].bacaan_quran,
      hafazan: borangMarkah[murid.mykid].hafazan,
      tahap_rulaf: borangMarkah[murid.mykid]?.tahap_rulaf || murid.tahap_rulaf
    }));

    const { error } = await supabase.from('markah_murid').insert(payload);

    if (error) {
      alert('Ralat Pangkalan Data: ' + error.message);
    } else {
      alert(`[+] Berjaya! Data markah kelas ${kelas} bagi sesi ${bulanTahun} telah dikemas kini ke dalam pangkalan data.`);
      setSenaraiMurid([]); 
      setBulanTahun('');
      setKelas('');
    }
    setIsPushing(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-7xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - SISTEM PENGURUSAN INSTITUSI BERSEPADU</span>
          <button onClick={() => router.push('/admin')} className="hover:text-white font-bold transition-colors">
            [ cd .. / Kembali ke Admin ]
          </button>
        </div>

        <div className="p-8">
          {/* HIERARKI 1: NAMA SEKOLAH */}
          <div className="mb-6 border-b border-gray-700 pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="text-orange-500">❖</span> {sekolah}
            </h1>
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500 px-3 py-1 text-xs font-bold rounded">
              MOD PENGGREDAN AKTIF
            </span>
          </div>

          {/* HIERARKI 2: PILIHAN KELAS (Mirip UI SIMPENI) */}
          <div className="bg-gray-900 border border-gray-700 p-4 mb-8 shadow-md flex flex-col sm:flex-row gap-4 items-end rounded">
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold mb-1 text-gray-300">PILIH KELAS:</label>
              <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="w-full p-2 bg-black border border-gray-600 text-white outline-none focus:border-[#1793D1]">
                <option value="">-- Senarai Kelas --</option>
                <option value="3 Murshid">3 MURSHID</option>
                <option value="5 Murshid">5 MURSHID</option>
              </select>
            </div>
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold mb-1 text-gray-300">BULAN / TAHUN:</label>
              <input type="text" value={bulanTahun} onChange={(e)=>setBulanTahun(e.target.value)} className="w-full p-2 bg-black border border-gray-600 text-white outline-none focus:border-[#1793D1]" placeholder="Contoh: April 2026" />
            </div>
            <div className="w-full sm:w-1/3">
              <button onClick={paparSenaraiPelajar} className="bg-[#1793D1] text-black w-full py-2 font-bold hover:bg-blue-400 transition-colors h-[42px] rounded-sm">
                [ PAPAR PELAJAR ]
              </button>
            </div>
          </div>

          {/* HIERARKI 3: SENARAI MURID & KEMASUKAN MARKAH */}
          {senaraiMurid.length > 0 && (
            <div className="bg-[#14181F] border border-gray-700 shadow-md overflow-hidden rounded">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 font-bold text-white text-sm">
                MAKLUMAT PELAJAR & KEMASUKAN MARKAH - KELAS {kelas.toUpperCase()}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-black/50 text-[#1793D1] text-xs border-b border-gray-700">
                      <th className="p-3 font-bold text-center w-10">BIL</th>
                      <th className="p-3 font-bold">NAMA PELAJAR</th>
                      <th className="p-3 font-bold w-32">NO. KP (MYKID)</th>
                      <th className="p-3 font-bold w-24">JANTINA</th>
                      <th className="p-3 font-bold w-24 text-center">KEHADIRAN</th>
                      <th className="p-3 font-bold w-24 text-center">JAWI (%)</th>
                      <th className="p-3 font-bold w-32 text-center">BACAAN QURAN</th>
                      <th className="p-3 font-bold w-24 text-center">HAFAZAN</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-300">
                    {senaraiMurid.map((murid) => (
                      <tr key={murid.mykid} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 text-center">{murid.bil}.</td>
                        <td className="p-3 font-bold text-white">{murid.nama}</td>
                        <td className="p-3">{murid.mykid}</td>
                        <td className="p-3">{murid.jantina}</td>
                        
                        {/* Ruangan Pengisian Manual */}
                        <td className="p-2">
                          <input type="number" value={borangMarkah[murid.mykid]?.kehadiran} onChange={(e) => handleInput(murid.mykid, 'kehadiran', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-center text-white outline-none focus:border-green-500 rounded-sm" placeholder="Hari" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={borangMarkah[murid.mykid]?.markah_jawi} onChange={(e) => handleInput(murid.mykid, 'markah_jawi', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-center text-white outline-none focus:border-green-500 rounded-sm" placeholder="%" />
                        </td>
                        <td className="p-2">
                          <select value={borangMarkah[murid.mykid]?.bacaan_quran} onChange={(e) => handleInput(murid.mykid, 'bacaan_quran', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-xs text-center text-white outline-none focus:border-green-500 rounded-sm">
                            <option value="">--Pilih--</option>
                            <option value="Iqra 1">Iqra 1</option>
                            <option value="Iqra 2">Iqra 2</option>
                            <option value="Iqra 3">Iqra 3</option>
                            <option value="Iqra 4">Iqra 4</option>
                            <option value="Iqra 5">Iqra 5</option>
                            <option value="Iqra 6">Iqra 6</option>
                            <option value="Al-Quran">Al-Quran</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={borangMarkah[murid.mykid]?.hafazan} onChange={(e) => handleInput(murid.mykid, 'hafazan', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-xs text-center text-white outline-none focus:border-green-500 rounded-sm">
                            <option value="">- Gred -</option>
                            <option value="A">Gred A</option>
                            <option value="B">Gred B</option>
                            <option value="C">Gred C</option>
                            <option value="D">Gred D</option>
                            <option value="E">Gred E</option>
    </select>
                        </td>
  <td className="p-2 border border-gray-700">
    <select
      className="w-full bg-black border border-gray-600 p-1 text-xs text-white focus:border-[#1793D1]"
      defaultValue={murid.tahap_rulaf || ''}
      onChange={(e) => handleInput(murid.mykid, 'tahap_rulaf', e.target.value)}
    >
      <option value="">- Pilih Tahap -</option>
      <option value="RuLaF Ta">[*] RuLaF Ta (Mentor)</option>
      <option value="RuLaF Ba">[~] RuLaF Ba (Sederhana)</option>
      <option value="RuLaF Alif">[!] RuLaF Alif (Lemah)</option>
      <option value="RuLaF Khas">[!!] RuLaF Khas (Pemulihan)</option>
    </select>
  </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                <button onClick={pushSistem} disabled={isPushing} className="bg-green-600 text-white px-8 py-2 font-bold hover:bg-green-500 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.4)] disabled:bg-gray-600 disabled:text-gray-400 rounded-sm">
                  {isPushing ? 'MENYIMPAN DATA...' : 'SIMPAN MARKAH KELAS'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}