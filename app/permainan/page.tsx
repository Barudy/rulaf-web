'use client';
import React, { useState } from 'react';
// Pautkan fail JSON berpusat (Pastikan laluan / path betul mengikut folder bosskur)
import bankSoalan from './../data/soalan.json'; 

export default function GameEnginePage() {
  const [fasa, setFasa] = useState('menu_utama'); 
  const [topikPilihan, setTopikPilihan] = useState(Object.keys(bankSoalan)[0]); // Default topik pertama
  const [modTulisan, setModTulisan] = useState('dwi'); 
  
  // State In-Game
  const [level, setLevel] = useState(1);
  const [skor, setSkor] = useState(0);
  const [indeksSoalan, setIndeksSoalan] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [nyawaPemain, setNyawaPemain] = useState(3);

  // [+] STATE BARU UNTUK INTERAKTIF (WARNA BUTANG)
  const [sedangSemak, setSedangSemak] = useState(false);
  const [jawapanDipilih, setJawapanDipilih] = useState<string | null>(null);

  // Tarik data game dari JSON
  const gameData = bankSoalan[topikPilihan as keyof typeof bankSoalan];
  const soalanSemasaArray = level === 1 ? gameData.level1 : level === 2 ? gameData.level2 : gameData.level3;

  // Fungsi Render Soalan & Jawapan (Sistem Dwi-Bahasa dengan Auto-Fading)
  const paparTeks = (obj: any, jenis: 'q' | 'options' | 'a', indexOption?: number) => {
    
    // [+] LOGIK AUTO-FADING (TADRIJ)
    // Jika Tahap 1, ikut pilihan murid. Jika Tahap 2 atau 3, PAKSA jadi 'jawi' sahaja!
    const modSebenar = level === 1 ? modTulisan : 'jawi'; 

    if (jenis === 'options' && indexOption !== undefined) {
      if (modSebenar === 'jawi') return obj.jawi.options[indexOption];
      if (modSebenar === 'rumi') return obj.rumi.options[indexOption];
      return `${obj.jawi.options[indexOption]} / ${obj.rumi.options[indexOption]}`; // Dwi-Tulisan
    }
    
    if (jenis === 'q') {
      if (modSebenar === 'jawi') return <span dir="rtl" className="font-arabic text-2xl">{obj.jawi.q}</span>;
      if (modSebenar === 'rumi') return <span>{obj.rumi.q}</span>;
      return (
        <div className="flex flex-col gap-2">
          <span dir="rtl" className="font-arabic text-2xl text-blue-300">{obj.jawi.q}</span>
          <span className="text-lg text-gray-300">{obj.rumi.q}</span>
        </div>
      );
    }

    return obj.rumi.a; // Kunci jawapan Rumi untuk semakan AI di belakang tabir
  };
  
  const mulaMain = () => {
    if (soalanSemasaArray.length === 0) return alert("Soalan belum dimasukkan untuk topik ini!");
    setFasa('bermain');
    setLevel(1);
    setSkor(0);
    setIndeksSoalan(0);
    setBossHp(100);
    setNyawaPemain(3);
    setSedangSemak(false);
    setJawapanDipilih(null);
  };

  // [+] FUNGSI SEMAK YANG DITAMBAH BAIK DENGAN ANIMASI INTERAKTIF
  const semakJawapan = (jawapanRumiYgDipilih: string, jawapanBetulRumi: string) => {
    if (sedangSemak) return; // Halang murid klik banyak kali berturut-turut

    setJawapanDipilih(jawapanRumiYgDipilih);
    setSedangSemak(true); // Kunci butang dan mula animasi semakan

    const isCorrect = jawapanRumiYgDipilih === jawapanBetulRumi;

    if (isCorrect) {
      setSkor(skor + 10);
      if (level === 3) setBossHp(bossHp - 50); 
    } else {
      setNyawaPemain(nyawaPemain - 1);
    }

    // Tangguh 1.5 saat supaya murid nampak jawapan mana yang Betul (Hijau) & Salah (Merah)
    setTimeout(() => {
      setJawapanDipilih(null);
      setSedangSemak(false);

      if (!isCorrect && nyawaPemain - 1 === 0) {
        setFasa('kalah');
        return;
      }

      // Pergi ke soalan seterusnya atau naik level
      if (indeksSoalan + 1 < soalanSemasaArray.length) {
        setIndeksSoalan(indeksSoalan + 1);
      } else {
        if (level < 3) {
          setLevel(level + 1);
          setIndeksSoalan(0);
        } else {
          setFasa('menang');
        }
      }
    }, 1500); // 1500 milisaat = 1.5 saat
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-6 sm:p-10 flex flex-col items-center justify-center selection:bg-[#1793D1] selection:text-white">
    <div className="max-w-3xl w-full bg-white dark:bg-[#171A21] border border-gray-200 dark:border-blue-500 rounded shadow-md dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-3 font-black flex justify-between uppercase tracking-wider">
          <span>🎮 RuLaF Game Engine 1.5</span>
          {fasa === 'bermain' && <span>Tahap: {level === 3 ? 'BOSS 🐉' : level}</span>}
        </div>

        <div className="p-8 min-h-[450px] flex flex-col justify-center">
          
          {/* FASA 1: MENU UTAMA */}
          {fasa === 'menu_utama' && (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-black text-center text-blue-400 mb-4">Pusat Latihan RuLaF</h1>
              
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8 transition-colors duration-300">
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">1. PILIH MISI (TAJUK):</label>
                <select 
                  value={topikPilihan} 
                  onChange={(e) => setTopikPilihan(e.target.value)}
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                >
                  {Object.keys(bankSoalan).map((key) => (
                    <option key={key} value={key}>
                      [{bankSoalan[key as keyof typeof bankSoalan].subjek}] {bankSoalan[key as keyof typeof bankSoalan].tajuk}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-400 mt-2">{gameData.deskripsi}</p>
              </div>

              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8 transition-colors duration-300">
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">2. PILIH MOD TULISAN:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setModTulisan('jawi')} className={`p-3 border rounded font-bold ${modTulisan === 'jawi' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white-300 border-gray-200 text-gray-400 dark:bg-gray-900 border-gray-600 text-gray-400'}`}>JAWI SAHAJA</button>
                  <button onClick={() => setModTulisan('rumi')} className={`p-3 border rounded font-bold ${modTulisan === 'rumi' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white-300 border-gray-200 text-gray-400 dark:bg-gray-900 border-gray-600 text-gray-400'}`}>RUMI SAHAJA</button>
                  <button onClick={() => setModTulisan('dwi')} className={`p-3 border rounded font-bold ${modTulisan === 'dwi' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white-300 border-gray-200 text-gray-400 dark:bg-gray-900 border-gray-600 text-gray-400'}`}>DWI-TULISAN</button>
                </div>
              </div>

              <button onClick={mulaMain} className="mt-4 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-xl rounded shadow-lg transition-transform transform hover:scale-105">
                [ MULAKAN MISI ]
              </button>
            </div>
          )}

          {/* FASA 2: BERMAIN (DENGAN FEEDBACK WARNA) */}
          {fasa === 'bermain' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between border-b border-gray-700 pb-4">
                <div className="text-green-400 font-bold text-xl">Skor: {skor}</div>
                <div className="text-red-400 font-bold text-xl">Nyawa: {'❤️'.repeat(nyawaPemain)}</div>
              </div>

              {level === 3 && (
                <div className="bg-red-900/30 p-4 border border-red-500 rounded text-center mb-2">
                  <p className="text-red-400 font-bold uppercase mb-2">💪🔥 Misi Akhir</p>
                  <div className="w-full bg-gray-800 rounded-full h-4">
                    <div className="bg-red-500 h-4 rounded-full transition-all duration-500" style={{ width: `${bossHp}%` }}></div>
                  </div>
                </div>
              )}

              <div className="bg-gray-200/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 p-6 rounded border-l-4 border-blue-500 relative">
                <p className="text-xs text-blue-400 font-bold mb-4">SOALAN {indeksSoalan + 1} / {soalanSemasaArray.length}</p>
                {paparTeks(soalanSemasaArray[indeksSoalan], 'q')}
                
                {/* Pop up kecil comel beritahu Betul / Salah */}
                {sedangSemak && jawapanDipilih === soalanSemasaArray[indeksSoalan].rumi.a && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white font-black px-4 py-1 rounded animate-bounce">Tepat! ✅</div>
                )}
                {sedangSemak && jawapanDipilih && jawapanDipilih !== soalanSemasaArray[indeksSoalan].rumi.a && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white font-black px-4 py-1 rounded animate-bounce">Salah! ❌</div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-2">
                {soalanSemasaArray[indeksSoalan].rumi.options.map((optRumi: string, i: number) => {
                  const jawapanSebenar = soalanSemasaArray[indeksSoalan].rumi.a;
                  const isCorrectAnswer = optRumi === jawapanSebenar;
                  const isSelected = optRumi === jawapanDipilih;

                  // [+] LOGIK WARNA INTERAKTIF
                  let btnColorClass = 'bg-gray-200/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800'; // Warna Asal

                  if (sedangSemak) {
                    if (isCorrectAnswer) {
                      btnColorClass = 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-105 z-10'; // Hijau menyala (Jawapan Betul)
                    } else if (isSelected && !isCorrectAnswer) {
                      btnColorClass = 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]'; // Merah menyala (Pilihan Salah)
                    } else {
                      btnColorClass = 'bg-gray-800 border-gray-700 text-gray-500 opacity-50'; // Butang lain dikelabukan
                    }
                  }

                  return (
                    <button 
                      key={i} 
                      disabled={sedangSemak}
                      onClick={() => semakJawapan(optRumi, jawapanSebenar)}
                      className={`p-4 border rounded transition-all duration-300 text-center font-bold ${modTulisan === 'jawi' ? 'text-2xl font-arabic text-right' : 'text-lg text-left'} ${btnColorClass}`}
                    >
                      {paparTeks(soalanSemasaArray[indeksSoalan], 'options', i)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FASA 3: MENANG / KALAH */}
          {fasa === 'menang' && (
            <div className="text-center flex flex-col items-center gap-6 animate-pulse-once">
              <div className="text-7xl">🏆</div>
              <h1 className="text-4xl font-black text-green-400">Misi Berjaya!</h1>
              <p className="text-gray-300">Tahniah! Anda telah menguasai topik <b>{gameData.tajuk}</b>.</p>
              <p className="text-2xl font-bold text-blue-400">Skor Akhir: {skor}</p>
              <button onClick={() => setFasa('menu_utama')} className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors">
                [ KEMBALI KE MENU ]
              </button>
            </div>
          )}

          {fasa === 'kalah' && (
            <div className="text-center flex flex-col items-center gap-6">
              <div className="text-7xl">💀</div>
              <h1 className="text-4xl font-black text-red-500">Misi Gagal!</h1>
              <p className="text-gray-400">Nyawa anda telah habis. Perhatikan di mana kesilapan anda sebentar tadi dan cuba lagi.</p>
              <button onClick={() => setFasa('menu_utama')} className="mt-4 px-6 py-3 bg-gray-800 border border-red-900 hover:bg-red-900 text-white font-bold rounded">
                [ KEMBALI KE MENU ]
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
