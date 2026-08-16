'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import bankSoalan from './../../data/soalan.json';
import Link from 'next/link';

export default function PermainanKonsolPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [tema, setTema] = useState('dark');
  const [gameMeta, setGameMeta] = useState<any>(null);
  const [soalanList, setSoalanList] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1); // Tahap 1, 2, 3
  const [maxLevel, setMaxLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pilihan Dwi-Tulisan (Level 1 Sahaja)
  const [modeTulisan, setModeTulisan] = useState<'dwi' | 'jawi' | 'rumi'>('dwi');

  // States untuk interaktiviti
  const [selectedOpt, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Click-to-Order (Drag & Drop replacement)
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);

  // Canvas menulis Jawi
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    tarikDataGame();
  }, [gameId, currentLevel]);

  const tarikDataGame = async () => {
    setIsLoading(true);
    let meta: any = null;
    let soalan: any[] = [];

    // Cari terus di soalan.json
    const dataSiri = (bankSoalan as any)[gameId];

    if (dataSiri) {
      meta = {
        subjek: dataSiri.subjek,
        tajuk: dataSiri.tajuk,
        deskripsi: dataSiri.deskripsi,
        level1: dataSiri.level1 || [],
        level2: dataSiri.level2 || [],
        level3: dataSiri.level3 || []
      };
    } else {
      // Cuba tarik dari database Supabase jika ia kuiz ciptaan guru
      try {
        const { data } = await supabase.from('rulaf_kuiz').select('*').eq('id', gameId).single();
        if (data) {
          meta = {
            subjek: data.subjek,
            tajuk: data.tajuk,
            deskripsi: data.deskripsi,
            level1: data.soalan.level1 || [],
            level2: data.soalan.level2 || [],
            level3: data.soalan.level3 || []
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (meta) {
      setGameMeta(meta);
      
      // Kira maxLevel yang sahih untuk siri ini
      let calculatedMax = 1;
      if (meta.level3 && meta.level3.length > 0) calculatedMax = 3;
      else if (meta.level2 && meta.level2.length > 0) calculatedMax = 2;
      setMaxLevel(calculatedMax);

      const soalanSemasa = meta[`level${currentLevel}`] || [];
      setSoalanList(soalanSemasa);
      setupInteraktiviti(soalanSemasa[0]);
    } else {
      setGameMeta(null);
      setSoalanList([]);
    }
    setIsLoading(false);
  };

  const setupInteraktiviti = (soalan: any) => {
    if (!soalan) return;
    setIsAnswered(false);
    setSelectedIdx(null);
    setFeedbackMsg('');
    setSelectedWords([]);

    // Dapatkan sasaran soalan berasaskan mode tulisan semasa di Tahap 1
    const soalanSemasa = currentLevel === 1 
      ? (modeTulisan === 'rumi' ? soalan.rumi : soalan.jawi) 
      : (soalan.jawi || soalan.rumi);

    if (soalanSemasa && soalanSemasa.q && (soalanSemasa.q.toLowerCase().includes("susun") || soalanSemasa.q.toLowerCase().includes("nyatakan"))) {
      const kataSplit = soalanSemasa.a.split(" ");
      setScrambledWords([...kataSplit].sort(() => Math.random() - 0.5));
    }
  };

  // 🔊 Sebutan Suara Lafaz Arab
  const mainkanAudioSintesis = (teks: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(teks);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Maaf, fungsi audio tidak disokong pada pelayar peranti ini.');
    }
  };

  const pilihKataSusun = (kata: string) => {
    setSelectedWords(prev => [...prev, kata]);
    setScrambledWords(prev => prev.filter(w => w !== kata));
  };

  const batalKataSusun = (kata: string) => {
    setScrambledWords(prev => [...prev, kata]);
    setSelectedWords(prev => prev.filter(w => w !== kata));
  };

  // Kanvas Lakar Jawi
  const mulakanLukis = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.clientY - canvas.getBoundingClientRect().top);
    setIsDrawing(true);
  };

  const lukis = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.clientY - canvas.getBoundingClientRect().top);
    ctx.strokeStyle = tema === 'dark' ? '#1793D1' : '#0F1419';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const padamKanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hantarJawapan = (jawapanDipilih?: string) => {
    if (isAnswered) return;

    const soalan = soalanList[currentIdx];
    const targetObj = currentLevel === 1 
      ? (modeTulisan === 'rumi' ? soalan.rumi : soalan.jawi) 
      : (soalan.jawi || soalan.rumi);
    const jawapanBetul = targetObj.a;

    let betul = false;
    if (jawapanDipilih) {
      betul = jawapanDipilih === jawapanBetul;
    } else if (selectedWords.length > 0) {
      betul = selectedWords.join(" ") === jawapanBetul;
    }

    if (betul) {
      setScore(prev => prev + 1);
      setFeedbackMsg("🎉 Cemerlang! Jawapan anda adalah tepat sekali.");
    } else {
      setFeedbackMsg(`❌ Kurang Tepat. Jawapan yang betul ialah: "${jawapanBetul}"`);
    }
    setIsAnswered(true);
  };

  const maraMisi = () => {
    if (currentIdx + 1 < soalanList.length) {
      setCurrentIdx(prev => prev + 1);
      setupInteraktiviti(soalanList[currentIdx + 1]);
    } else {
      if (currentLevel < maxLevel) {
        setCurrentLevel(prev => prev + 1);
        setCurrentIdx(0);
      } else {
        setIsFinished(true);
        simpanMarkahSupabase();
      }
    }
  };

  const simpanMarkahSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profil } = await supabase.from('profil_pengguna').select('mykid, nama').eq('email', session.user.email).single();
        if (profil && profil.mykid) {
          const totalSoalan = soalanList.length * maxLevel;
          const peratusAkademik = Math.round((score / totalSoalan) * 100) || 80;
          
          await supabase.from('markah_murid').upsert({
            mykid: profil.mykid,
            nama_murid: profil.nama,
            markah_jawi: peratusAkademik,
            bulan_tahun: "Ogos 2026"
          }, { onConflict: 'mykid' });
        }
      }
    } catch (e) {
      console.error("Gagal simpan markah ke Supabase:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono text-gray-500">
        <p className="animate-pulse text-[#1793D1]">Menghubungkan konsol permainan asli...</p>
      </div>
    );
  }

  const soalanSemasa = soalanList[currentIdx];
  
  // Sembuhkan ralat jika level tidak dijumpai
  if (!gameMeta || soalanList.length === 0 || !soalanSemasa) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center p-6 text-gray-800 dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-[#171A21] border border-red-500 p-8 rounded shadow-lg text-center">
          <p className="text-red-500 font-bold mb-4">⚠️ Misi Tidak Ditemui!</p>
          <p className="text-sm text-gray-500 mb-6">Misi pelajaran ini kosong atau gagal dimuat naik ke peranti.</p>
          <Link href="/permainan" className="bg-gray-800 text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#1793D1] transition-all">[ Balik ke Arked ]</Link>
        </div>
      </div>
    );
  }

  // Tentukan soalan siri berasaskan mode tulisan yang dipilih oleh murid (Level 1)
  const objSoalan = currentLevel === 1 
    ? (modeTulisan === 'rumi' ? soalanSemasa.rumi : soalanSemasa.jawi) 
    : (soalanSemasa.jawi);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded shadow-lg overflow-hidden transition-all duration-300">
        
        {/* Banner */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-6 py-4 flex justify-between items-center font-bold text-sm">
          <span>🎮 KONSOL AKTIF :: {gameMeta.tajuk.toUpperCase()}</span>
          <Link href="/permainan" className="text-white hover:underline">[ ⬅️ Balik Ke Arked ]</Link>
        </div>

        <div className="p-6 sm:p-10">
          {!isFinished ? (
            <div className="space-y-8">
              
              {/* Level Progress */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-100 dark:bg-[#11141b] p-4 rounded border border-gray-200 dark:border-gray-800">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">TAHAP SEMASA:</span>
                  <span className="text-lg font-black text-[#1793D1]">
                    {currentLevel === 1 ? `TAHAP 1 (MOD: ${modeTulisan.toUpperCase()})` : `TAHAP ${currentLevel} (JAWI SAHAJA)`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-bold block">SKOR SEMASA:</span>
                  <span className="text-lg font-black text-green-600 dark:text-green-400">{score} Mata</span>
                </div>
              </div>

              {/* Selector Mode Tulisan (Hanya terpapar di Tahap 1 untuk menyokong teori multimedia) */}
              {currentLevel === 1 && (
                <div className="flex gap-2 justify-center bg-gray-100 dark:bg-[#11141b] p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-500 self-center mr-2">PILIH TULISAN:</span>
                  <button
                    onClick={() => { setModeTulisan('dwi'); setupInteraktiviti(soalanSemasa); }}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${modeTulisan === 'dwi' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                  >
                    Dwi-Tulisan
                  </button>
                  <button
                    onClick={() => { setModeTulisan('jawi'); setupInteraktiviti(soalanSemasa); }}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${modeTulisan === 'jawi' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                  >
                    Jawi Sahaja
                  </button>
                  <button
                    onClick={() => { setModeTulisan('rumi'); setupInteraktiviti(soalanSemasa); }}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${modeTulisan === 'rumi' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                  >
                    Rumi Sahaja
                  </button>
                </div>
              )}

              {/* Soalan Box */}
              {objSoalan ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-[#11141b]/40 border border-gray-200 dark:border-gray-800 rounded">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                      <span className="bg-[#1793D1] text-[#0F1419] px-2 py-0.5 text-xs font-bold rounded">
                        Soalan {currentIdx + 1} daripada {soalanList.length}
                      </span>
                      {objSoalan.q.toLowerCase().includes("niat") && (
                        <button 
                          onClick={() => mainkanAudioSintesis(objSoalan.a)} 
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
                        >
                          🔊 Dengar Sebutan Arab
                        </button>
                      )}
                    </div>

                    {/* Pembentangan visual berpandukan pilihan mode tulisan */}
                    <div className="space-y-3">
                      {currentLevel === 1 && modeTulisan === 'dwi' ? (
                        <>
                          <h2 className="text-2xl font-black text-gray-950 dark:text-white leading-relaxed text-right font-sans">
                            {soalanSemasa.jawi?.q}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            ({soalanSemasa.rumi?.q})
                          </p>
                        </>
                      ) : (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                          {objSoalan.q}
                        </h2>
                      )}
                    </div>
                  </div>

                  {/* 1. INTERAKTIF: Klik Susun Ayat */}
                  {(objSoalan.q.toLowerCase().includes("susun") || objSoalan.q.toLowerCase().includes("nyatakan")) ? (
                    <div className="space-y-4">
                      <div className="min-h-16 p-4 bg-gray-50 dark:bg-[#0F1419] border-2 border-dashed border-gray-300 dark:border-gray-800 rounded flex flex-wrap gap-2 items-center">
                        {selectedWords.length === 0 && <span className="text-xs text-gray-400">Susun jawapan anda di sini...</span>}
                        {selectedWords.map((word, i) => (
                          <button key={i} onClick={() => batalKataSusun(word)} className="bg-[#1793D1] text-[#0F1419] font-bold px-3 py-1.5 rounded text-xs hover:bg-red-500 hover:text-white transition-all">
                            {word}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scrambledWords.map((word, i) => (
                          <button key={i} onClick={() => pilihKataSusun(word)} className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1.5 rounded text-xs hover:border-amber-500 border border-transparent transition-colors">
                            {word}
                          </button>
                        ))}
                      </div>
                      {!isAnswered && (
                        <button onClick={() => hantarJawapan()} className="w-full py-3 bg-[#1793D1] text-[#0F1419] font-bold text-sm rounded shadow hover:bg-blue-600 transition-colors">
                          [ HANTAR JAWAPAN SUSUNAN ]
                        </button>
                      )}
                    </div>
                  ) : objSoalan.q.toLowerCase().includes("tulis") ? (
                    // 2. INTERAKTIF: Kanvas Menulis Jawi Tunggal
                    <div className="space-y-4">
                      <p className="text-xs text-amber-500">Sila tulis lakar huruf tunggal anda di dalam kotak kanvas di bawah:</p>
                      <div className="relative border-2 border-gray-300 dark:border-gray-800 rounded overflow-hidden bg-white dark:bg-gray-950">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={200}
                          onMouseDown={mulakanLukis}
                          onMouseMove={lukis}
                          onMouseUp={() => setIsDrawing(false)}
                          onMouseLeave={() => setIsDrawing(false)}
                          className="mx-auto cursor-crosshair"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button onClick={padamKanvas} className="px-4 py-2 bg-gray-500 text-white text-xs font-bold rounded">
                          Padam Kanvas
                        </button>
                        <button onClick={() => hantarJawapan("A")} className="flex-1 py-2.5 bg-green-600 text-white text-xs font-bold rounded">
                          Selesai Menulis (Sahkan)
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 3. MULTIPLE CHOICE STANDARD
                    <div className="grid grid-cols-1 gap-3">
                      {objSoalan.options.map((opt: string, idx: number) => {
                        // Sembuhkan ralat jika data rumi tak wujud
                        const optJawi = currentLevel === 1 && modeTulisan === 'dwi' ? soalanSemasa.jawi?.options[idx] : null;
                        
                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => {
                              setSelectedIdx(idx);
                              hantarJawapan(opt);
                            }}
                            className={`w-full text-left p-4 rounded border text-sm font-medium transition-all ${
                              isAnswered 
                                ? opt === objSoalan.a
                                  ? 'bg-green-100 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400'
                                  : selectedOpt === idx
                                    ? 'bg-red-100 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400'
                                    : 'bg-white dark:bg-[#171A21] border-gray-200 dark:border-gray-800 opacity-60'
                                : 'bg-white dark:bg-[#171A21] border-gray-200 dark:border-gray-800 hover:border-[#1793D1]/50'
                            }`}
                          >
                            {currentLevel === 1 && modeTulisan === 'dwi' && optJawi ? (
                              <div className="flex flex-col text-right">
                                <span className="font-bold text-base text-gray-950 dark:text-white font-sans">{optJawi}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">({opt})</span>
                              </div>
                            ) : (
                              <span>{opt}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Feedback Area */}
                  {isAnswered && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900/50 text-sm">
                      <p className="font-bold text-gray-900 dark:text-white mb-3">{feedbackMsg}</p>
                      <button onClick={maraMisi} className="px-5 py-2 bg-[#1793D1] text-[#0F1419] font-bold rounded text-xs shadow hover:bg-blue-600 transition-colors">
                        [ TERUSKAN MISI TERDEKAT ]
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10">Misi soalan tidak ditemui.</p>
              )}
            </div>
          ) : (
            // Selesai Permainan
            <div className="text-center space-y-6 py-10">
              <span className="text-6xl block">🏆</span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Semua Misi Selesai!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tahniah! Anda telah berjaya menyelesaikan keseluruhan tahap (Tadrij) dengan skor akhir:
              </p>
              <div className="inline-block bg-green-500/10 border border-green-500 text-green-500 font-black text-2xl px-8 py-3 rounded">
                {score} Mata
              </div>
              <p className="text-xs text-gray-400">
                Data prestasi anda telah berjaya disegerakkan (sync) terus ke portal penggredan guru.
              </p>
              <div className="pt-6">
                <Link href="/permainan" className="bg-[#1793D1] text-[#0F1419] font-bold px-6 py-3 rounded text-sm">
                  [ KEMBALI KE ARKED ]
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
