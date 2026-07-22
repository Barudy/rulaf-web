'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TebusKodPage() {
  const [langkah, setLangkah] = useState(1);
  const [statusMesej, setStatusMesej] = useState('');

  // State Data Murid & Kod
  const [mykid, setMykid] = useState('');
  const [kodRahsia, setKodRahsia] = useState('');
  const [tahapKognitif, setTahapKognitif] = useState('');
  
  // State Kuiz
  const [soalanSemasa, setSoalanSemasa] = useState<any[]>([]);
  const [jawapanMurid, setJawapanMurid] = useState<string[]>(['', '', '']);
  const [keputusanAI, setKeputusanAI] = useState({ markah: 0, tahapBaru: '', status: '' });

  // [+] SENARAI MURID (Dropdown Mudah - Boleh dipanggil dari DB kelak)
  const senaraiMurid = [
    { nama: "ADI ISKANDAR ALHAQ", mykid: "170807010333", tahapLama: "RuLaF Ba" },
    { nama: "AINIYAH SHABIRA", mykid: "170401010368", tahapLama: "RuLaF Alif" },
    { nama: "NUR MAISARAH", mykid: "170219010222", tahapLama: "RuLaF Ta" }
  ];

  // [+] BANK SOALAN (3 Soalan Mengikut Tahap Kod)
  const bankSoalan: any = {
    'RULAF-A-99': [ // Kod Susah (Tahap Ta)
      { q: "Pilih ejaan Jawi yang tepat bagi: Tanggungjawab", options: ["تڠݢوڠجواب", "تڠݢوڠجوب", "تڠݢونجواب"], a: "تڠݢوڠجواب" },
      { q: "Ejaan 'Masyarakat' dalam Jawi ialah...", options: ["مشارکت", "مشراکت", "ماشراکت"], a: "مشارکت" },
      { q: "Apakah huruf jawi bagi padanan 'Ny'?", options: ["ڽ", "ڠ", "ڤ"], a: "ڽ" }
    ],
    'RULAF-B-55': [ // Kod Sederhana (Tahap Ba)
      { q: "Ejaan bagi perkataan 'Sekolah' ialah...", options: ["سکوله", "سكوله", "سيکوله"], a: "سکوله" },
      { q: "Suku kata 'Bu' dieja sebagai...", options: ["بو", "با", "بي"], a: "بو" },
      { q: "Perkataan 'Buku' mengandungi berapa huruf jawi?", options: ["4", "3", "5"], a: "4" }
    ],
    'RULAF-C-11': [ // Kod Mudah (Tahap Alif)
      { q: "Manakah antara berikut adalah huruf Ba?", options: ["ب", "ت", "ث"], a: "ب" },
      { q: "Huruf 'Alif' ditulis sebagai...", options: ["ا", "ل", "م"], a: "ا" },
      { q: "Padanan huruf 'S' dalam Jawi ialah...", options: ["س", "ش", "ص"], a: "س" }
    ]
  };

  const sahkanKod = () => {
    if (!mykid || !kodRahsia) return alert('Sila pilih nama dan masukkan Kod Rahsia!');
    
    const kod = kodRahsia.toUpperCase();
    if (bankSoalan[kod]) {
      if (kod.includes('-A-')) setTahapKognitif('RuLaF Ta');
      else if (kod.includes('-B-')) setTahapKognitif('RuLaF Ba');
      else if (kod.includes('-C-')) setTahapKognitif('RuLaF Alif');
      
      setSoalanSemasa(bankSoalan[kod]);
      setLangkah(2); // Masuk skrin Kuiz
    } else {
      return alert('[!] Ralat: Kod Rahsia Tidak Sah atau Luput.');
    }
  };

  const pilihJawapan = (index: number, nilai: string) => {
    const jawapanBaru = [...jawapanMurid];
    jawapanBaru[index] = nilai;
    setJawapanMurid(jawapanBaru);
  };

  // [+] LOGIK AI: KIRA MARKAH & TENTUKAN TAHAP BAHARU
  const hantarJawapan = async () => {
    setStatusMesej('Ejen AI sedang menganalisis prestasi dan menentukan tahap RuLaF...');
    
    // 1. Kira Markah
    let betul = 0;
    soalanSemasa.forEach((soalan, i) => {
      if (jawapanMurid[i] === soalan.a) betul++;
    });
    const peratusMarkah = Math.round((betul / 3) * 100);

    // 2. Tentukan Kenaikan/Penurunan Tahap RuLaF
    let tahapBaru = tahapKognitif;
    let status = 'KEKAL TAHAP';

    if (tahapKognitif === 'RuLaF Alif') {
      if (betul === 3) { tahapBaru = 'RuLaF Ba'; status = 'NAIK TAHAP 🚀'; }
      else if (betul === 0) { tahapBaru = 'RuLaF Khas'; status = 'TURUN TAHAP 🔻'; }
    } 
    else if (tahapKognitif === 'RuLaF Ba') {
      if (betul === 3) { tahapBaru = 'RuLaF Ta'; status = 'NAIK TAHAP 🚀'; }
      else if (betul === 0) { tahapBaru = 'RuLaF Alif'; status = 'TURUN TAHAP 🔻'; }
    }
    else if (tahapKognitif === 'RuLaF Ta') {
      if (betul <= 1) { tahapBaru = 'RuLaF Ba'; status = 'TURUN TAHAP 🔻'; }
    }

    setKeputusanAI({ markah: peratusMarkah, tahapBaru, status });

    // 3. Simpan ke Supabase (Markah Jawi & Tahap Baru)
    const { error } = await supabase
      .from('markah_murid')
      .update({ markah_jawi: peratusMarkah, tahap_rulaf: tahapBaru }) // Pastikan ada lajur tahap_rulaf
      .eq('mykid', mykid);

    if (error) {
      alert('Ralat Pangkalan Data: ' + error.message);
      setStatusMesej('');
    } else {
      setLangkah(3); // Skrin Keputusan
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-6 sm:p-10 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-[#171A21] border border-blue-500 rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] overflow-hidden">
        
        <div className="bg-blue-600 text-white px-6 py-3 font-bold flex justify-between">
          <span>~/ RuLaFHub_Redeem_Portal</span>
          <span>[ UJIAN PENGUKUHAN ]</span>
        </div>

        <div className="p-8">
          {/* FASA 1: PILIH NAMA DAN KOD */}
          {langkah === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white text-center">Tebus Kod The RuLaF Box</h2>
              
              {/* Dropdown Nama Murid */}
              <select 
                value={mykid} onChange={(e) => setMykid(e.target.value)}
                className="p-3 bg-gray-900 border border-gray-600 rounded text-white focus:border-blue-400 outline-none"
              >
                <option value="">-- Sila Pilih Nama Anda --</option>
                {senaraiMurid.map((murid, idx) => (
                  <option key={idx} value={murid.mykid}>{murid.nama}</option>
                ))}
              </select>

              <input 
                type="text" placeholder="Kod Rahsia (Cth: RULAF-A-99)" 
                value={kodRahsia} onChange={(e) => setKodRahsia(e.target.value)}
                className="p-3 bg-gray-900 border border-blue-500 rounded text-green-400 font-bold uppercase tracking-widest text-center outline-none"
              />
              <button onClick={sahkanKod} className="mt-4 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-500">
                [ MULA UJIAN ]
              </button>
            </div>
          )}

          {/* FASA 2: JAWAB 3 SOALAN POP QUIZ */}
          {langkah === 2 && (
            <div className="flex flex-col gap-6">
              <div className="p-4 bg-gray-800 border-l-4 border-yellow-500">
                <p className="text-xs text-yellow-400 font-bold">[*] TAHAP DIKESAN: {tahapKognitif}</p>
                <p className="text-xs text-gray-400">Jawab semua soalan untuk naik ke tahap seterusnya.</p>
              </div>

              {soalanSemasa.map((s, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded border border-gray-700">
                  <p className="text-white mb-3 font-bold">{index + 1}. {s.q}</p>
                  <div className="flex flex-col gap-2">
                    {s.options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <input 
                          type="radio" name={`soalan-${index}`} value={opt}
                          onChange={(e) => pilihJawapan(index, e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={hantarJawapan} className="mt-2 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-500">
                [ HANTAR & ANALISIS AI ]
              </button>
              {statusMesej && <p className="text-sm text-yellow-400 text-center animate-pulse">{statusMesej}</p>}
            </div>
          )}

          {/* FASA 3: KEPUTUSAN DAN KENAIKAN TAHAP */}
          {langkah === 3 && (
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-black text-white mb-2">Misi Selesai!</h2>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="p-4 bg-gray-800 border border-blue-500 rounded">
                  <p className="text-sm text-gray-400">Markah Jawi</p>
                  <p className="text-3xl font-bold text-blue-400">{keputusanAI.markah}%</p>
                </div>
                <div className="p-4 bg-gray-800 border border-green-500 rounded">
                  <p className="text-sm text-gray-400">Status Kedudukan</p>
                  <p className="text-xl font-bold text-green-400 mt-2">{keputusanAI.status}</p>
                  <p className="text-xs text-gray-300 mt-1">Tahap Terkini: {keputusanAI.tahapBaru}</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-4">Rekod anda telah dikemas kini secara automatik dalam Pangkalan Data RuLaF.</p>
              
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 border border-gray-500 text-gray-300 py-2 px-6 rounded hover:bg-gray-800"
              >
                [ KEMBALI KE MUKA DEPAN ]
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}