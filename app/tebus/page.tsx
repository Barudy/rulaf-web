'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TebusKodPage() {
  const [langkah, setLangkah] = useState(1);
  const [statusMesej, setStatusMesej] = useState('');

  // State Data Murid & Kod
  const [senaraiMurid, setSenaraiMurid] = useState<any[]>([]); // [+] STATE KOSONG (TIADA HARDCODE)
  const [mykid, setMykid] = useState('');
  const [kodRahsia, setKodRahsia] = useState('');
  const [tahapKognitif, setTahapKognitif] = useState('');
  
  // State Kuiz
  const [soalanSemasa, setSoalanSemasa] = useState<any[]>([]);
  const [jawapanMurid, setJawapanMurid] = useState<string[]>(['', '', '']);
  const [keputusanAI, setKeputusanAI] = useState({ markah: 0, tahapBaru: '', status: '' });

  // [+] SEDUT DATA NAMA DARI SUPABASE SECARA DINAMIK
  useEffect(() => {
    tarikSenaraiMurid();
  }, []);

  const tarikSenaraiMurid = async () => {
    const { data, error } = await supabase
      .from('markah_murid')
      .select('nama_murid, mykid, tahap_rulaf')
      .order('nama_murid', { ascending: true }); // Susun ikut abjad
      
    if (data) {
      setSenaraiMurid(data);
    } else if (error) {
      console.error("Ralat memuat turun senarai murid:", error.message);
    }
  };

  // [+] BANK SOALAN (Bebas Data Peribadi)
  const bankSoalan: any = {
    'RULAF-A-99': [ 
      { q: "Pilih ejaan Jawi yang tepat bagi: Tanggungjawab", options: ["تڠݢوڠجواب", "تڠݢوڠجوب", "تڠݢونجواب"], a: "تڠݢوڠجواب" },
      { q: "Ejaan 'Masyarakat' dalam Jawi ialah...", options: ["مشارکت", "مشراکت", "ماشراکت"], a: "مشارکت" },
      { q: "Apakah huruf jawi bagi padanan 'Ny'?", options: ["ڽ", "ڠ", "ڤ"], a: "ڽ" }
    ],
    'RULAF-B-55': [ 
      { q: "Ejaan bagi perkataan 'Sekolah' ialah...", options: ["سکوله", "سكوله", "سيکوله"], a: "سکوله" },
      { q: "Suku kata 'Bu' dieja sebagai...", options: ["بو", "با", "بي"], a: "بو" },
      { q: "Perkataan 'Buku' mengandungi berapa huruf jawi?", options: ["4", "3", "5"], a: "4" }
    ],
    'RULAF-C-11': [ 
      { q: "Manakah antara berikut adalah huruf Ba?", options: ["ب", "ت", "ث"], a: "ب" },
      { q: "Huruf 'Alif' ditulis sebagai...", options: ["ا", "ل", "م"], a: "ا" },
      { q: "Padanan huruf 'S' dalam Jawi ialah...", options: ["س", "ش", "ص"], a: "س" }
    ]
  };

  const sahkanKod = () => {
    if (!mykid || !kodRahsia) return alert('Sila pilih nama dan masukkan Kod Rahsia!');
    
    // Tarik tahap lama dari senarai yang di-fetch
    const muridDipilih = senaraiMurid.find(m => m.mykid === mykid);
    const tahapLama = muridDipilih?.tahap_rulaf || 'RuLaF Alif'; // Default jika tiada

    const kod = kodRahsia.toUpperCase();
    if (bankSoalan[kod]) {
      // Tetapkan tahap kognitif untuk rujukan AI
      setTahapKognitif(tahapLama);
      setSoalanSemasa(bankSoalan[kod]);
      setLangkah(2); 
    } else {
      return alert('[!] Ralat: Kod Rahsia Tidak Sah atau Luput.');
    }
  };

  const pilihJawapan = (index: number, nilai: string) => {
    const jawapanBaru = [...jawapanMurid];
    jawapanBaru[index] = nilai;
    setJawapanMurid(jawapanBaru);
  };

  const hantarJawapan = async () => {
    setStatusMesej('Ejen AI sedang menganalisis prestasi dan menentukan tahap RuLaF...');
    
    let betul = 0;
    soalanSemasa.forEach((soalan, i) => {
      if (jawapanMurid[i] === soalan.a) betul++;
    });
    const peratusMarkah = Math.round((betul / 3) * 100);

    let tahapBaru = tahapKognitif;
    let status = 'KEKAL TAHAP';

    if (tahapKognitif === 'RuLaF Alif' || tahapKognitif === 'RuLaF Khas') {
      if (betul === 3) { tahapBaru = 'RuLaF Ba'; status = 'NAIK TAHAP 🚀'; }
    } 
    else if (tahapKognitif === 'RuLaF Ba') {
      if (betul === 3) { tahapBaru = 'RuLaF Ta'; status = 'NAIK TAHAP 🚀'; }
      else if (betul === 0) { tahapBaru = 'RuLaF Alif'; status = 'TURUN TAHAP 🔻'; }
    }
    else if (tahapKognitif === 'RuLaF Ta') {
      if (betul <= 1) { tahapBaru = 'RuLaF Ba'; status = 'TURUN TAHAP 🔻'; }
    }

    setKeputusanAI({ markah: peratusMarkah, tahapBaru, status });

    const { error } = await supabase
      .from('markah_murid')
      .update({ markah_jawi: peratusMarkah, tahap_rulaf: tahapBaru }) 
      .eq('mykid', mykid);

    if (error) {
      alert('Ralat Pangkalan Data: ' + error.message);
      setStatusMesej('');
    } else {
      setLangkah(3); 
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
          {langkah === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white text-center">Tebus Kod The RuLaF Box</h2>
              
              {/* Dropdown Nama Murid (Data ditarik dari DB) */}
              <select 
                value={mykid} onChange={(e) => setMykid(e.target.value)}
                className="p-3 bg-gray-900 border border-gray-600 rounded text-white focus:border-blue-400 outline-none"
              >
                <option value="">-- Sila Pilih Nama Anda --</option>
                {senaraiMurid.map((murid, idx) => (
                  <option key={idx} value={murid.mykid}>{murid.nama_murid}</option>
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