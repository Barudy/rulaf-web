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

  // 🔒 Kunci Pra-Permainan
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'senang' | 'sederhana' | 'sukar'>('sederhana');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // ⚔️ RPG Battle States
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [maxEnemyHp, setMaxEnemyHp] = useState(100);
  const [isBossLevel, setIsBossLevel] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // 📊 Statistik & Leaderboard
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [senaraiLeaderboard, setSenaraiLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // 📝 Mod Tulisan & Pilihan
  const [modeTulisan, setModeTulisan] = useState<'dwi' | 'jawi' | 'rumi'>('dwi');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [battleLog, setBattleLog] = useState('');

  const [userProfile, setUserProfile] = useState<{ mykid: string; nama: string; peranan: string } | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // 🧩 State Khas Susun Atur
  const [susunWords, setSusunWords] = useState<string[]>([]);
  const [availableChips, setAvailableChips] = useState<{ id: number; word: string; used: boolean }[]>([]);

  // =========================================================================
  // 🎯 KUNCI PENYELESAIAN TS(2448): DIISYTIHARKAN DI ATAS SEBELUM DIGUNAKAN
  // =========================================================================
  const soalanSemasa = soalanList[currentIdx];
  const objSoalan = modeTulisan === 'jawi' 
    ? soalanSemasa?.jawi 
    : modeTulisan === 'rumi' 
      ? soalanSemasa?.rumi 
      : (soalanSemasa?.jawi || soalanSemasa?.rumi);

  const senaraiPilihan = (objSoalan?.options && objSoalan.options.length > 0)
    ? objSoalan.options
    : (objSoalan?.a ? [objSoalan.a] : []);

  // Semakan Akses Murid
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
    semakKelayakanPemain().then((layak) => {
      if (layak) tarikDataGame();
      else setIsLoading(false);
    });
  }, [gameId]);

  // Kemas kini Tahap Dinamik & Reset HP Musuh
  useEffect(() => {
    if (!gameMeta) return;

    const keyLevel = `level${currentLevel}`;
    const soalanArasSemasa = gameMeta[keyLevel] || [];
    setSoalanList(soalanArasSemasa);
    setCurrentIdx(0);
    setIsAnswered(false);
    setSelectedOpt(null);

    const isBoss = currentLevel === maxLevel;
    setIsBossLevel(isBoss);
    const hpMusuhBaru = isBoss ? 150 : 100;
    setEnemyHp(hpMusuhBaru);
    setMaxEnemyHp(hpMusuhBaru);
    setBattleLog(isBoss ? '⚠️ AMARAN: Bos Akhir muncul! Kesilapan memulihkan nyawa Bos!' : `Tahap ${currentLevel} bermula! Bersedia menyerang.`);
  }, [currentLevel, gameMeta, maxLevel]);

  // Inisialisasi Cebisan Perkataan Bila Bertukar Soalan
  useEffect(() => {
    if (!soalanSemasa) return;
    setSusunWords([]);

    const targetObj = modeTulisan === 'jawi' 
      ? soalanSemasa.jawi 
      : modeTulisan === 'rumi' 
        ? soalanSemasa.rumi 
        : (soalanSemasa.jawi || soalanSemasa.rumi);
    const rawChips = targetObj?.options || [];

    const shuffled = [...rawChips]
      .sort(() => Math.random() - 0.5)
      .map((word: string, i: number) => ({ id: i, word, used: false }));

    setAvailableChips(shuffled);
  }, [currentIdx, currentLevel, soalanSemasa, modeTulisan]);

  // Kawalan Pemasa
  useEffect(() => {
    if (!isGameStarted || difficulty === 'senang' || isAnswered || isGameOver || isVictory) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          serang('[MASA TAMAT]', -1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, currentIdx, currentLevel, isAnswered, isGameOver, isVictory, difficulty]);

  // Penalti Keluar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGameStarted && !isVictory && !isGameOver && !isLoading) {
        rekodPenaltiKeluar();
        e.preventDefault();
        e.returnValue = 'AMARAN: Keluar sekarang membatalkan markah kerajinan anda!';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGameStarted, isVictory, isGameOver, isLoading, userProfile]);

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
            level1: data.soalan?.level1 || [],
            level2: data.soalan?.level2 || [],
            level3: data.soalan?.level3 || []
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
    }
    setIsLoading(false);
  };

  const mulakanMisi = () => {
    if (difficulty === 'senang') {
      setModeTulisan('rumi');
      setTimeLeft(null);
    } else if (difficulty === 'sukar') {
      setModeTulisan('jawi');
      setTimeLeft(15);
    } else {
      setModeTulisan('dwi');
      setTimeLeft(30);
    }
    setIsGameStarted(true);
  };

  const resetTurnWithTimer = () => {
    setIsAnswered(false);
    setSelectedOpt(null);
    if (difficulty === 'sederhana') setTimeLeft(30);
    else if (difficulty === 'sukar') setTimeLeft(15);
    else setTimeLeft(null);
  };

  const rekodPenaltiKeluar = async () => {
    if (!userProfile?.mykid || isVictory || isGameOver) return;
    const tarikhHariIni = new Date().toISOString().split('T')[0];
    await supabase.from('rekod_kerajinan_harian').upsert({
      tarikh: tarikhHariIni,
      mykid: userProfile.mykid,
      subjek: gameMeta?.subjek || 'Jawi',
      tugasan_siap: 0,
      status_hadir: true,
      status_kehadiran: 'lewat',
      catatan: 'PENALTI DISIPLIN: Keluar sebelum tamat pertempuran RPG.'
    }, { onConflict: 'tarikh,mykid' });
  };

  const handleChipClick = (chipId: number, word: string) => {
    if (isAnswered) return;
    setSusunWords((prev) => [...prev, word]);
    setAvailableChips((prev) =>
      prev.map((c) => (c.id === chipId ? { ...c, used: true } : c))
    );
  };

  const resetSusunWords = () => {
    if (isAnswered) return;
    setSusunWords([]);
    setAvailableChips((prev) => prev.map((c) => ({ ...c, used: false })));
  };

  const serang = (jawapanDipilih: string, idx: number) => {
    if (isAnswered || isGameOver || isVictory) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    const targetObj = modeTulisan === 'jawi' 
      ? soalanSemasa?.jawi 
      : modeTulisan === 'rumi' 
        ? soalanSemasa?.rumi 
        : (soalanSemasa?.jawi || soalanSemasa?.rumi);
    const jawapanBetul = targetObj?.a || '';
    const isCorrect = jawapanDipilih.trim() === jawapanBetul.trim() && jawapanDipilih !== '[MASA TAMAT]';
    const damageDealt = Math.ceil(maxEnemyHp / Math.max(soalanList.length, 1));
    const damageTaken = 25;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const nextEnemyHp = Math.max(0, enemyHp - damageDealt);
      setEnemyHp(nextEnemyHp);
      setBattleLog(`💥 SERANGAN BERJAYA! Musuh menerima ${damageDealt} kerosakan!`);
      if (nextEnemyHp <= 0) setBattleLog('🎉 MUSUH TUMBANG! Bersedia untuk pusingan seterusnya.');
    } else {
      setMistakes((prev) => prev + 1);
      const nextPlayerHp = Math.max(0, playerHp - damageTaken);
      setPlayerHp(nextPlayerHp);

      if (jawapanDipilih === '[MASA TAMAT]') {
        setBattleLog(`⏰ MASA TAMAT! Hero menerima ${damageTaken} kerosakan balas!`);
      } else if (isBossLevel) {
        setEnemyHp(maxEnemyHp);
        setBattleLog(`❌ SALAH! Bos serang balas (${damageTaken} dmg) & memulihkan nyawa penuh!`);
      } else {
        setBattleLog(`❌ JAWAPAN SALAH! Hero menerima ${damageTaken} kerosakan!`);
      }

      if (nextPlayerHp <= 0) {
        setIsGameOver(true);
        setBattleLog('💀 HERO TEWAS! Nyawa anda telah habis.');
      }
    }
  };

  const maraPusingan = () => {
    if (currentIdx + 1 < soalanList.length) {
      setCurrentIdx((prev) => prev + 1);
      resetTurnWithTimer();
    } else {
      if (currentLevel < maxLevel && !isGameOver) {
        setCurrentLevel((prev) => prev + 1);
        setPlayerHp((prev) => Math.min(maxPlayerHp, prev + 30));
        resetTurnWithTimer();
      } else if (!isGameOver) {
        selesaikanPermainan();
      }
    }
  };

  const selesaikanPermainan = async () => {
    setIsVictory(true);
    const multiplier = difficulty === 'sukar' ? 2.0 : difficulty === 'sederhana' ? 1.5 : 1.0;
    const baseScore = Math.max(0, (currentLevel * 100) + ((correctAnswers + 1) * 10) - (mistakes * 5));
    const skorTerkira = Math.round(baseScore * multiplier);
    setFinalScore(skorTerkira);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const mykidMurid = userProfile?.mykid || '000000000000';
        const namaMurid = userProfile?.nama || session.user.email;
        const tarikhHariIni = new Date().toISOString().split('T')[0];

        await supabase.from('rulaf_leaderboard').insert([{
          mykid: mykidMurid,
          nama_murid: namaMurid,
          skor: skorTerkira,
          level_capai: currentLevel,
          jawapan_betul: correctAnswers + 1,
          jawapan_salah: mistakes,
          tarikh: tarikhHariIni
        }]);

        await supabase.from('rekod_kerajinan_harian').upsert({
          tarikh: tarikhHariIni,
          mykid: mykidMurid,
          subjek: gameMeta?.subjek || 'Jawi',
          tugasan_siap: 3,
          status_hadir: true,
          status_kehadiran: 'hadir',
          catatan: `Arked RPG [Mod ${difficulty.toUpperCase()}] (+3 Kerajinan: Skor ${skorTerkira})`
        }, { onConflict: 'tarikh,mykid' });
      }
      tarikLeaderboard();
    } catch (err) {
      console.error(err);
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
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center font-mono text-white text-xs">
        [ MEMUAT DATA PERTEMPURAN... ]
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="max-w-md bg-white dark:bg-[#171A21] border border-red-500/50 p-8 rounded-xl shadow-lg">
          <span className="text-5xl block mb-3">⛔</span>
          <h2 className="text-lg font-bold text-red-500 mb-2">AKSES PERMAINAN DISEKAT</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Modul RPG ini adalah pentaksiran khas untuk akaun Murid berdaftar sahaja.
          </p>
          <Link href="/permainan" className="bg-gray-800 text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#1793D1]">
            [ Kembali ke Laman Arked ]
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================
  // 🌟 SKRIN 1: LOBI PRA-PERTEMPURAN
  // ==============================================================
  if (!isGameStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-4xl block">⚔️</span>
            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {gameMeta?.tajuk}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
              {gameMeta?.deskripsi}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-[#1793D1] uppercase tracking-wider block text-center">
              — PILIH TAHAP KESUKARAN —
            </label>

            <div className="grid grid-cols-1 gap-3">
              <div
                onClick={() => setDifficulty('senang')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  difficulty === 'senang'
                    ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">🟢 MOD SENANG</span>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-500">1.0x SKOR</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-sans">
                  Tiada had masa soalan. Tulisan Rumi sepenuhnya.
                </p>
              </div>

              <div
                onClick={() => setDifficulty('sederhana')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  difficulty === 'sederhana'
                    ? 'border-[#1793D1] bg-[#1793D1]/10 dark:bg-[#1793D1]/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1793D1]">🟡 MOD SEDERHANA</span>
                  <span className="text-xs font-mono font-bold bg-[#1793D1]/20 px-2 py-0.5 rounded text-[#1793D1]">1.5x SKOR</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-sans">
                  Had masa 30 saat setiap soalan. Dwi-Tulisan (Jawi & Rumi).
                </p>
              </div>

              <div
                onClick={() => setDifficulty('sukar')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  difficulty === 'sukar'
                    ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-rose-500">🔴 MOD SUKAR</span>
                  <span className="text-xs font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-500">2.0x SKOR</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-sans">
                  Had masa 15 saat setiap soalan. Tulisan Jawi sahaja.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={mulakanMisi}
              className="w-full py-3.5 bg-[#1793D1] hover:bg-blue-600 text-white font-black rounded-lg text-xs tracking-wider transition-all shadow-lg"
            >
              [ ⚔️ MULAKAN PERTEMPURAN SEKARANG ]
            </button>
            <Link
              href="/permainan"
              className="block text-center w-full py-2 text-xs text-gray-400 hover:text-white"
            >
              [ ⬅️ Batal & Balik ke Arked ]
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // ⚔️ SKRIN 2: ARENA PERTEMPURAN RPG
  // ==============================================================
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-3 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl shadow-xl overflow-hidden">
        
        {/* Bar Atas Konsol */}
        <div className="bg-[#1793D1] text-white px-5 py-3 flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>⚔️ {gameMeta?.tajuk?.toUpperCase()}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] uppercase">
              MOD: {difficulty} {difficulty === 'sukar' ? '(2.0x)' : difficulty === 'sederhana' ? '(1.5x)' : '(1.0x)'}
            </span>
          </div>
          <button
            onClick={async () => {
              if (!isVictory && !isGameOver) {
                const pasti = window.confirm('⚠️ AMARAN: Jika keluar sekarang, markah kerajinan hari ini akan DIBATALKAN (Penalti 0).');
                if (pasti) {
                  await rekodPenaltiKeluar();
                  router.push('/permainan');
                }
              } else {
                router.push('/permainan');
              }
            }}
            className="text-red-200 hover:text-white hover:underline text-xs"
          >
            [ ⬅️ Keluar Misi ]
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          {isBossLevel && (
            <div className="bg-red-950/40 border border-red-600/80 text-red-400 p-3 rounded-lg text-xs font-bold text-center animate-pulse">
              ⚠️ TAHAP BOS AKHIR (TAHAP {currentLevel}) — Kesilapan jawapan memulihkan nyawa Bos!
            </div>
          )}

          {/* Bar Nyawa RPG */}
          <div className="bg-gray-100 dark:bg-[#0F1419] border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-inner">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl select-none">🧙‍♂️</span>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">Hero Murid</span>
                    <span className="text-[10px] text-gray-400">{playerHp}/{maxPlayerHp} HP</span>
                  </div>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }} />
                </div>
              </div>

              <div className="text-center px-2">
                <span className="text-[10px] font-bold text-[#1793D1] block uppercase tracking-wider">Tahap {currentLevel} / {maxLevel}</span>
                <span className="text-xs font-black text-amber-500">VS</span>
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1.5">
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {isBossLevel ? 'Naga Ifrit (Bos)' : `Musuh Aras ${currentLevel}`}
                    </span>
                    <span className="text-[10px] text-gray-400">{enemyHp}/{maxEnemyHp} HP</span>
                  </div>
                  <span className="text-2xl select-none">{isBossLevel ? '🐉' : '🛡️'}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden flex justify-end">
                  <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }} />
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-sans font-semibold">
              {battleLog}
            </p>
          </div>

          {/* Kotak Soalan & Jawapan */}
          {!isGameOver && !isVictory && objSoalan && (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-[#1793D1]/10 text-[#1793D1] px-2.5 py-1 rounded font-bold">
                  Tahap {currentLevel} • Soalan {currentIdx + 1} / {soalanList.length}
                </span>
                {timeLeft !== null && (
                  <span className={`font-mono font-bold px-2.5 py-1 rounded ${timeLeft <= 5 ? 'bg-rose-500 text-white animate-bounce' : 'bg-amber-500/20 text-amber-500'}`}>
                    ⏳ Baki: {timeLeft}s
                  </span>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-800 p-6 rounded-xl text-center space-y-4">
                {(soalanSemasa?.img || soalanSemasa?.gambar_url || soalanSemasa?.gambarUrl) && (
                  <div className="my-3 flex justify-center">
                    <img 
                      src={soalanSemasa.img || soalanSemasa.gambar_url || soalanSemasa.gambarUrl} 
                      alt="Visual Soalan" 
                      className="max-h-56 rounded-lg border border-gray-300 dark:border-gray-700 object-contain shadow-md bg-white/50 dark:bg-black/40 p-1.5" 
                    />
                  </div>
                )}

                {modeTulisan === 'dwi' ? (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{soalanSemasa?.jawi?.q}</h2>
                    <p className="text-sm text-gray-500 italic">({soalanSemasa?.rumi?.q})</p>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">{objSoalan.q}</h2>
                )}
              </div>

              {/* 🎯 KAWASAN JAWAPAN TUNGGAL (PILIHAN ATAU SUSUN ATUR) */}
              {soalanSemasa?.type === 'susun_atur' ? (
                <div className="space-y-4">
                  {/* Kotak Ayat Terbina */}
                  <div className="min-h-[60px] p-4 bg-white dark:bg-[#11141b] border-2 border-dashed border-[#1793D1]/50 rounded-xl flex flex-wrap items-center justify-center gap-2">
                    {susunWords.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Tekan perkataan di bawah untuk menyusun ayat...</span>
                    ) : (
                      susunWords.map((w, idx) => (
                        <span key={idx} className="bg-[#1793D1] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                          {w}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Cebisan Perkataan (Word Chips) */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {availableChips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        disabled={chip.used || isAnswered}
                        onClick={() => handleChipClick(chip.id, chip.word)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                          chip.used
                            ? 'opacity-20 bg-gray-200 dark:bg-gray-800 cursor-not-allowed'
                            : 'bg-white dark:bg-[#171A21] border-gray-300 dark:border-gray-700 hover:border-[#1793D1] text-gray-800 dark:text-gray-200 active:scale-95 shadow-sm'
                        }`}
                      >
                        {chip.word}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isAnswered || susunWords.length === 0}
                      onClick={resetSusunWords}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-red-500 border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      [ ↺ Set Semula ]
                    </button>
                    <button
                      type="button"
                      disabled={isAnswered || susunWords.length === 0}
                      onClick={() => {
                        const jawapanLengkap = susunWords.join(' ');
                        serang(jawapanLengkap, 0);
                      }}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50"
                    >
                      ⚔️ [ SAHKAN AYAT & SERANG ]
                    </button>
                  </div>
                </div>
              ) : (
                /* Render Pilihan Standard 3 Butang */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {senaraiPilihan.map((opt: string, idx: number) => {
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
                            : 'bg-white dark:bg-[#171A21] border-gray-200 dark:border-gray-800 hover:border-[#1793D1]'
                        }`}
                      >
                        <span>{opt}</span>
                        <span className="text-xs text-gray-400 font-mono">[SERANG]</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Butang Mara Pusingan Seterusnya */}
              {isAnswered && (
                <div className="pt-2 text-center">
                  <button
                    onClick={maraPusingan}
                    className="w-full sm:w-auto px-8 py-3 bg-[#1793D1] text-white font-bold rounded-lg text-xs shadow hover:bg-blue-600 transition-colors"
                  >
                    [ {currentIdx + 1 < soalanList.length ? 'SOALAN SETERUSNYA ➡️' : `MARA KE TAHAP ${currentLevel + 1 <= maxLevel ? currentLevel + 1 : 'SELESAI'} 🏆`} ]
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {isGameOver && (
            <div className="text-center py-10 space-y-4">
              <span className="text-6xl block select-none">💀</span>
              <h2 className="text-2xl font-black text-rose-500">HERO TEWAS DALAM MISI!</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Nyawa anda telah habis diserang musuh. Sila cuba lagi!
              </p>
              <button
                onClick={() => {
                  setPlayerHp(100);
                  setIsGameOver(false);
                  setCurrentLevel(1);
                  setCurrentIdx(0);
                  resetTurnWithTimer();
                  tarikDataGame();
                }}
                className="px-6 py-2.5 bg-gray-700 text-white rounded font-bold text-xs hover:bg-gray-600"
              >
                [ CUBA SEMULA DARI AWAL ]
              </button>
            </div>
          )}

          {/* Kemenangan */}
          {isVictory && (
            <div className="text-center py-8 space-y-5">
              <span className="text-6xl block select-none">🏆</span>
              <h2 className="text-3xl font-black text-emerald-500">MISI PERTEMPURAN SELESAI!</h2>
              <div className="inline-block bg-[#1793D1]/10 border border-[#1793D1] p-5 rounded-xl text-center space-y-1">
                <span className="text-xs text-gray-400 font-bold block">JUMLAH MATA RPG (MOD {difficulty.toUpperCase()})</span>
                <span className="text-3xl font-black text-[#1793D1]">{finalScore} PTS</span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  ✓ Ganjaran +3 Markah Kerajinan Direkodkan
                </span>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-colors"
                >
                  {showLeaderboard ? 'Tutup Leaderboard' : '🏅 Lihat Leaderboard'}
                </button>
                <Link href="/permainan" className="px-5 py-2.5 bg-[#1793D1] hover:bg-blue-600 text-white font-bold rounded text-xs transition-colors">
                  [ Balik ke Arked ]
                </Link>
              </div>

              {showLeaderboard && (
                <div className="mt-8 text-left bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">🏆 Top Players</h3>
                  <div className="space-y-2">
                    {senaraiLeaderboard.map((player, idx) => (
                      <div key={player.id || idx} className="flex justify-between items-center p-2.5 bg-white dark:bg-[#171A21] rounded-lg border border-gray-200 dark:border-gray-800 text-xs">
                        <span className="font-bold">#{idx + 1} {player.nama_murid}</span>
                        <span className="font-bold text-[#1793D1]">{player.skor} PTS</span>
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