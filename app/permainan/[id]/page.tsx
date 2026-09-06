'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import bankSoalan from '../../data/soalan.json';
import Link from 'next/link';

export default function PermainanKonsolRPGPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [tema, setTema] = useState('dark');
  const [gameMeta, setGameMeta] = useState<any>(null);
  const [soalanList, setSoalanList] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ⚔️ RPG Battle States
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [maxEnemyHp, setMaxEnemyHp] = useState(100);
  const [isBossLevel, setIsBossLevel] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // 📊 Statistik Jawapan & Leaderboard
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [senaraiLeaderboard, setSenaraiLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // 📝 Mod Tulisan & Soalan
  const [modeTulisan, setModeTulisan] = useState<'dwi' | 'jawi' | 'rumi'>('dwi');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [battleLog, setBattleLog] = useState('');
  // Di dalam komponen PermainanKonsolRPGPage
const [userProfile, setUserProfile] = useState<{ mykid: string; nama: string; peranan: string } | null>(null);
const [isAccessDenied, setIsAccessDenied] = useState(false);

const semakKelayakanPemain = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    setIsAccessDenied(true);
    return false;
  }

  const { data: profil } = await supabase
    .from('profil_pengguna')
    .select('mykid, nama, peranan')
    .eq('email', session.user.email)
    .single();

  // 🔒 Sekat tetamu, admin, guru, atau akaun murid tanpa No. MyKid
  if (!profil || profil.peranan !== 'Murid' || !profil.mykid || profil.mykid === '000000000000') {
    setIsAccessDenied(true);
    return false;
  }

  setUserProfile(profil);
  return true;
};

  useEffect(() => {
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    tarikDataGame();
  }, [gameId, currentLevel]);

  const tarikDataGame = async () => {
    setIsLoading(true);
    let meta: any = null;

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
      let calculatedMax = 1;
      if (meta.level3 && meta.level3.length > 0) calculatedMax = 3;
      else if (meta.level2 && meta.level2.length > 0) calculatedMax = 2;
      setMaxLevel(calculatedMax);

      const soalanSemasa = meta[`level${currentLevel}`] || [];
      setSoalanList(soalanSemasa);

      // Inisialisasi Musuh & Status Bos
      const isBoss = currentLevel === calculatedMax;
      setIsBossLevel(isBoss);
      const enemyBaseHp = isBoss ? 150 : 100;
      setEnemyHp(enemyBaseHp);
      setMaxEnemyHp(enemyBaseHp);
      setBattleLog(isBoss ? '⚠️ AMARAN: Bos muncul! Kesilapan akan memulihkan nyawa Bos!' : 'Pertarungan bermula! Serang musuh dengan menjawab tepat.');
      resetTurn();
    }
    setIsLoading(false);
  };

  const resetTurn = () => {
    setIsAnswered(false);
    setSelectedOpt(null);
  };

  // ⚔️ Enjin Tempur Berasaskan Jawapan
  const serang = (jawapanDipilih: string, idx: number) => {
    if (isAnswered || isGameOver || isVictory) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    const soalan = soalanList[currentIdx];
    const targetObj = currentLevel === 1 
      ? (modeTulisan === 'rumi' ? soalan.rumi : soalan.jawi) 
      : (soalan.jawi || soalan.rumi);
    
    const isCorrect = jawapanDipilih.trim() === targetObj.a.trim();
    const damageDealt = Math.ceil(maxEnemyHp / Math.max(soalanList.length, 1));
    const damageTaken = 25; // Penalti nyawa hero jika salah

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const nextEnemyHp = Math.max(0, enemyHp - damageDealt);
      setEnemyHp(nextEnemyHp);
      setBattleLog(`💥 SERANGAN BERJAYA! Anda mengenakan ${damageDealt} kerosakan kepada musuh!`);

      if (nextEnemyHp <= 0) {
        setBattleLog('🎉 MUSUH TEWAS! Misi berjaya diteruskan.');
      }
    } else {
      setMistakes(prev => prev + 1);
      const nextPlayerHp = Math.max(0, playerHp - damageTaken);
      setPlayerHp(nextPlayerHp);

      if (isBossLevel) {
        // Mekanik Bos: Kesilapan menetapkan semula HP Bos ke tahap maksimum
        setEnemyHp(maxEnemyHp);
        setBattleLog(`❌ JAWAPAN SALAH! Bos memulihkan HP ke penuh dan menyerang anda (${damageTaken} kerosakan)!`);
      } else {
        setBattleLog(`❌ JAWAPAN SALAH! Anda menerima serangan musuh sebanyak ${damageTaken} kerosakan!`);
      }

      if (nextPlayerHp <= 0) {
        setIsGameOver(true);
        setBattleLog('💀 ANDA TEWAS! Nyawa anda telah habis.');
      }
    }
  };

  const maraPusingan = () => {
    if (currentIdx + 1 < soalanList.length && enemyHp > 0) {
      setCurrentIdx(prev => prev + 1);
      resetTurn();
    } else {
      // Jika tamat soalan atau musuh mati
      if (currentLevel < maxLevel) {
        setCurrentLevel(prev => prev + 1);
        setCurrentIdx(0);
        setPlayerHp(prev => Math.min(maxPlayerHp, prev + 30)); // Pulihkan sedikit HP
      } else {
        // Kemenangan Penuh Keseluruhan Tahap
        selesaikanPermainan();
      }
    }
  };

  // 🏆 Formula Skor & Penyegerakan Pangkalan Data (Leaderboard & Kerajinan +3)
  const selesaikanPermainan = async () => {
    setIsVictory(true);

    // Formula Skor: (Level * 100) + (Betul * 10) - (Salah * 5)
    const skorTerkira = Math.max(0, (currentLevel * 100) + ((correctAnswers + 1) * 10) - (mistakes * 5));
    setFinalScore(skorTerkira);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profil } = await supabase
          .from('profil_pengguna')
          .select('mykid, nama')
          .eq('email', session.user.email)
          .single();

        const mykidMurid = profil?.mykid || '000000000000';
        const namaMurid = profil?.nama || session.user.email;
        const tarikhHariIni = new Date().toISOString().split('T')[0];

        // 1. Catat ke Papan Pendahulu (rulaf_leaderboard)
        await supabase.from('rulaf_leaderboard').insert([
          {
            mykid: mykidMurid,
            nama_murid: namaMurid,
            skor: skorTerkira,
            level_capai: currentLevel,
            jawapan_betul: correctAnswers + 1,
            jawapan_salah: mistakes,
            tarikh: tarikhHariIni
          }
        ]);

        // 2. Ganjaran Bonus +3 Markah ke rekod_kerajinan_harian
        await supabase.from('rekod_kerajinan_harian').upsert({
          tarikh: tarikhHariIni,
          mykid: mykidMurid,
          subjek: gameMeta?.subjek || 'Jawi',
          tugasan_siap: 3, // Bonus maksimum siap penuh aktiviti arked
          status_hadir: true,
          status_kehadiran: 'hadir',
          catatan: `Bonus Arked RPG (+3 Kerajinan: Skor ${skorTerkira})`
        }, { onConflict: 'tarikh,mykid' });
      }

      // Tarik semula senarai leaderboard terkini
      tarikLeaderboard();
    } catch (err) {
      console.error('Ralat penyegerakan markah RPG:', err);
    }
  };

  const tarikLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('rulaf_leaderboard')
        .select('*')
        .order('skor', { ascending: false })
        .limit(10);

      if (data) setSenaraiLeaderboard(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="animate-pulse text-[#1793D1]">Menyediakan medan pertempuran RPG RuLaF...</p>
      </div>
    );
  }

  const soalanSemasa = soalanList[currentIdx];
  const objSoalan = currentLevel === 1 
    ? (modeTulisan === 'rumi' ? soalanSemasa?.rumi : soalanSemasa?.jawi) 
    : (soalanSemasa?.jawi || soalanSemasa?.rumi);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-3 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl shadow-xl overflow-hidden">
        
        {/* Bar Atas Konsol */}
        <div className="bg-[#1793D1] text-white px-5 py-3 flex justify-between items-center text-xs font-bold">
          <span>⚔️ PERTEMPURAN RPG :: {gameMeta?.tajuk?.toUpperCase()}</span>
          <Link href="/permainan" className="hover:underline">[ ⬅️ Balik Ke Arked ]</Link>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          
          {/* Amaran Peringkat Bos */}
          {isBossLevel && (
            <div className="bg-red-950/40 border border-red-600/80 text-red-400 p-3 rounded-lg text-xs font-bold text-center animate-pulse">
              ⚠️ TAHAP BOS AKHIR — Kesilapan jawapan akan memulihkan nyawa Bos ke tahap maksimum!
            </div>
          )}

          {/* ARENA PERTEMPURAN: BILAH HP HERO VS MUSUH */}
          <div className="bg-gray-100 dark:bg-[#0F1419] border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-inner">
            <div className="flex justify-between items-center gap-4">
              
              {/* Sisi Hero */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl select-none">🧙‍♂️</span>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">Hero Murid</span>
                    <span className="text-[10px] text-gray-400">{playerHp}/{maxPlayerHp} HP</span>
                  </div>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* Status Pusingan / Pangkat */}
              <div className="text-center px-2">
                <span className="text-[10px] font-bold text-[#1793D1] block uppercase tracking-wider">Tahap {currentLevel}</span>
                <span className="text-xs font-black text-amber-500">VS</span>
              </div>

              {/* Sisi Musuh / Bos */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1.5">
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {isBossLevel ? 'Naga Ifrit (Bos)' : 'Pendekar Bayang'}
                    </span>
                    <span className="text-[10px] text-gray-400">{enemyHp}/{maxEnemyHp} HP</span>
                  </div>
                  <span className="text-2xl select-none">{isBossLevel ? '🐉' : '🛡️'}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden flex justify-end">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Log Pertarungan */}
            <p className="text-center text-xs mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-sans font-semibold">
              {battleLog}
            </p>
          </div>

          {/* KOTAK SOALAN & INTERAKSI (JIKA BELUM GAME OVER / MENANG) */}
          {!isGameOver && !isVictory && objSoalan && (
            <div className="space-y-6">
              
              {/* Pemilihan Dwi-Tulisan (Tahap 1) */}
              {currentLevel === 1 && (
                <div className="flex justify-center gap-2">
                  {(['dwi', 'jawi', 'rumi'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setModeTulisan(mode)}
                      className={`px-3 py-1 text-xs rounded border font-bold transition-all ${
                        modeTulisan === mode 
                          ? 'bg-[#1793D1] text-white border-[#1793D1]' 
                          : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {mode === 'dwi' ? 'Dwi-Tulisan' : mode === 'jawi' ? 'Jawi' : 'Rumi'}
                    </button>
                  ))}
                </div>
              )}

              {/* Kad Paparan Soalan & Sokongan Gambar */}
              <div className="bg-gray-50 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-800 p-6 rounded-xl text-center space-y-4">
                <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-xs px-2.5 py-1 rounded font-bold">
                  Soalan {currentIdx + 1} / {soalanList.length}
                </span>

                {/* Sokongan Paparan Soalan Bergambar */}
                {soalanSemasa.gambar_url && (
                  <div className="my-3 flex justify-center">
                    <img 
                      src={soalanSemasa.gambar_url} 
                      alt="Ilustrasi Soalan" 
                      className="max-h-48 rounded-lg border border-gray-300 dark:border-gray-700 object-contain shadow-md"
                    />
                  </div>
                )}

                {/* Teks Soalan */}
                {modeTulisan === 'dwi' && currentLevel === 1 ? (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">
                      {soalanSemasa.jawi?.q}
                    </h2>
                    <p className="text-sm text-gray-500 italic">({soalanSemasa.rumi?.q})</p>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {objSoalan.q}
                  </h2>
                )}
              </div>

              {/* Senarai Butang Serangan (Pilihan Jawapan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objSoalan.options?.map((opt: string, idx: number) => {
                  const optJawi = modeTulisan === 'dwi' && currentLevel === 1 ? soalanSemasa.jawi?.options[idx] : null;
                  const isCorrect = opt.trim() === objSoalan.a.trim();
                  
                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => serang(opt, idx)}
                      className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left flex justify-between items-center ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : selectedOpt === idx
                              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400'
                              : 'opacity-40 border-gray-200 dark:border-gray-800'
                          : 'bg-white dark:bg-[#171A21] border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:scale-[1.01]'
                      }`}
                    >
                      <div>
                        {optJawi && <span className="block font-bold text-base mb-1 font-sans">{optJawi}</span>}
                        <span>{opt}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">[SERANG]</span>
                    </button>
                  );
                })}
              </div>

              {/* Butang Teruskan Pertarungan */}
              {isAnswered && (
                <div className="pt-2 text-center">
                  <button
                    onClick={maraPusingan}
                    className="w-full sm:w-auto px-8 py-3 bg-[#1793D1] text-white font-bold rounded-lg text-xs shadow hover:bg-blue-600 transition-colors"
                  >
                    [ PUSINGAN SETERUSNYA ➡️ ]
                  </button>
                </div>
              )}

            </div>
          )}

          {/* PAPARAN KEKALAHAN (GAME OVER) */}
          {isGameOver && (
            <div className="text-center py-10 space-y-4">
              <span className="text-6xl block select-none">💀</span>
              <h2 className="text-2xl font-black text-rose-500">HERO TEWAS DALAM MISI!</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Nyawa anda telah habis diserang musuh. Ulang kaji semula topik ini dan cuba lagi!
              </p>
              <button
                onClick={() => {
                  setPlayerHp(100);
                  setIsGameOver(false);
                  setCurrentIdx(0);
                  resetTurn();
                  tarikDataGame();
                }}
                className="px-6 py-2.5 bg-gray-700 text-white rounded font-bold text-xs hover:bg-gray-600"
              >
                [ CUBA SEMULA ]
              </button>
            </div>
          )}

          {/* PAPARAN KEMENANGAN & GANJARAN SAHSIAH (+3 KERAJINAN) */}
          {isVictory && (
            <div className="text-center py-8 space-y-5">
              <span className="text-6xl block select-none">🏆</span>
              <h2 className="text-3xl font-black text-emerald-500">MISI PERTEMPURAN SELESAI!</h2>
              <p className="text-xs text-gray-400">
                Semua musuh dan Bos berjaya ditumpaskan. Markah automatik direkodkan ke sistem pentaksiran!
              </p>

              {/* Kotak Kiraan Mata Berasaskan Formula */}
              <div className="inline-block bg-[#1793D1]/10 border border-[#1793D1] p-5 rounded-xl text-center space-y-1">
                <span className="text-xs text-gray-400 font-bold block">JUMLAH MATA RPG</span>
                <span className="text-3xl font-black text-[#1793D1]">{finalScore} PTS</span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  ✓ Ganjaran +3 Markah Kerajinan Ditolak ke Rekod Harian
                </span>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-colors"
                >
                  {showLeaderboard ? 'Tutup Leaderboard' : '🏅 Lihat Leaderboard'}
                </button>
                <Link
                  href="/permainan"
                  className="px-5 py-2.5 bg-[#1793D1] hover:bg-blue-600 text-white font-bold rounded text-xs transition-colors"
                >
                  [ Balik ke Arked ]
                </Link>
              </div>

              {/* PAPARAN LEADERBOARD DINAMIK */}
              {showLeaderboard && (
                <div className="mt-8 text-left bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>🏆 Papan Pendahulu Teratas (Top Players)</span>
                  </h3>
                  <div className="space-y-2">
                    {senaraiLeaderboard.map((player, idx) => (
                      <div 
                        key={player.id || idx}
                        className="flex justify-between items-center p-2.5 bg-white dark:bg-[#171A21] rounded-lg border border-gray-200 dark:border-gray-800 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">{player.nama_murid}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#1793D1] block">{player.skor} PTS</span>
                          <span className="text-[9px] text-gray-400">Tahap {player.level_capai}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}