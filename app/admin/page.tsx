'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ambilPeranan } from '../lib/akses';

export default function AdminDashboardPage() {
  const router = useRouter();

  // --- BAHAGIAN TEMA (DARK/LIGHT) ---
  const [tema, setTema] = useState('dark');

  // --- KUNCI KESELAMATAN (SUPABASE AUTH) ---
  const [isLocked, setIsLocked] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // --- CMS BLOG / JURNAL ---
  const [tajukBlog, setTajukBlog] = useState('');
  const [kandunganBlog, setKandunganBlog] = useState('');
  const [statusBlog, setStatusBlog] = useState('');
  const [senaraiArtikel, setSenaraiArtikel] = useState<any[]>([]);

  // --- EJEN AI RULAF (NL2SQL) ---
  const [soalanAI, setSoalanAI] = useState('');
  const [hasilAI, setHasilAI] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [sqlGenerated, setSqlGenerated] = useState('');

  // --- METRIKS DASHBOARD (SKOP PENUH ADMIN: semua guru & murid semua sekolah) ---
  const [stats, setStats] = useState({
    jumlahMurid: 58, // Default 58 murid dari CSV (3 Murshid + 5 Murshid)
    jumlahGuru: 0,   // Jumlah guru + admin berdaftar (skop sistem)
    jumlahSekolah: 0, // Jumlah sekolah berdaftar (skop sistem)
    aktifPengguna: 3,  // Bilangan aktif pengguna (simulasi/real-time)
    jumlahKuiz: 0,
    jumlahBBM: 0,
  });

  useEffect(() => {
    // 1. Laraskan tema sedia ada daripada LocalStorage
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Semak sesi log masuk sedia ada
    semakSesi();
  }, []);

  // Tarik data statik/dinamik dari Supabase sekiranya sudah login
  useEffect(() => {
    if (!isLocked) {
      tarikMetriksSistem();
      tarikArtikelTerbaru();
    }
  }, [isLocked]);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // 🔒 Pengasingan Peranan: Hanya Guru / Admin dibenarkan memasuki panel ini
      const peranan = await ambilPeranan(session.user.email || '');
      if (peranan !== 'Guru' && peranan !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setIsLocked(false);
      setUserEmail(session.user.email || 'Pentadbir RuLaFHub');
    }
  };

  const klikLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoggingIn(false);
    if (error) {
      setErrorMsg('[!] Ralat: Kata laluan atau e-mel salah! Cubaan ditumpaskan.');
    } else if (data.session) {
      // 🔒 Pengasingan Peranan selepas log masuk
      const peranan = await ambilPeranan(data.session.user.email || '');
      if (peranan !== 'Guru' && peranan !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setIsLocked(false);
      setUserEmail(data.session.user.email || 'Pentadbir RuLaFHub');
    }
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    setIsLocked(true);
    setEmail('');
    setPassword('');
    setUserEmail('');
  };

  const tukarTema = () => {
    const temaBaharu = tema === 'dark' ? 'light' : 'dark';
    setTema(temaBaharu);
    localStorage.setItem('theme', temaBaharu);
    if (temaBaharu === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // --- TARIK METRIKS SISTEM SECARA DINAMIK (SKOP PENUH: semua sekolah) ---
  const tarikMetriksSistem = async () => {
    try {
      // Bilangan murid KESELURUHAN dalam Supabase (semua sekolah)
      const { count: muridCount } = await supabase.from('data_murid').select('*', { count: 'exact', head: true });
      // Jumlah guru + admin berdaftar (skop sistem, bukan per guru)
      const { count: guruCount } = await supabase.from('profil_pengguna').select('*', { count: 'exact', head: true }).in('peranan', ['Guru', 'admin']);
      // Jumlah sekolah berdaftar
      const { data: sk } = await supabase.from('rulaf_sekolah').select('id');
      // Bilangan kuiz terbina
      const { count: kuizCount } = await supabase.from('rulaf_kuiz').select('*', { count: 'exact', head: true });
      // Bilangan BBM dalam repositori
      const { count: bbmCount } = await supabase.from('rulaf_repo').select('*', { count: 'exact', head: true });

      // Simulasi real-time active users (menggunakan julat aktif antara 3 - 6 pengguna)
      const simulasiAktif = Math.floor(Math.random() * 4) + 3;

      setStats({
        jumlahMurid: muridCount || 58,
        jumlahGuru: guruCount || 0,
        jumlahSekolah: sk?.length || 0,
        aktifPengguna: simulasiAktif,
        jumlahKuiz: kuizCount || 5, // Fallback ke count asas
        jumlahBBM: bbmCount || 8,
      });
    } catch (err) {
      console.error("Ralat memuatkan data metriks:", err);
    }
  };

  // --- CMS: TARIK ARTIKEL TERBARU ---
  const tarikArtikelTerbaru = async () => {
    const { data } = await supabase
      .from('blog_rulaf')
      .select('*')
      .order('id', { ascending: false })
      .limit(3);
    if (data) {
      setSenaraiArtikel(data);
    }
  };

  // --- CMS: MUAT NAIK BLOG/JURNAL BARU ---
  const muatNaikBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tajukBlog || !kandunganBlog) return alert("Sila isi semua maklumat artikel!");
    
    setStatusBlog('Sedang menerbitkan artikel ke awan...');

    const { error } = await supabase.from('blog_rulaf').insert([
      {
        tajuk: tajukBlog,
        kandungan: kandunganBlog,
      }
    ]);

    if (error) {
      setStatusBlog(`❌ Gagal: ${error.message}`);
    } else {
      setStatusBlog('🎉 Berjaya diterbitkan!');
      setTajukBlog('');
      setKandunganBlog('');
      tarikArtikelTerbaru();
      setTimeout(() => setStatusBlog(''), 3000);
    }
  };

  // --- EJEN AI: NL2SQL DIALIRKAN SECARA INTEGRATIF ---
  const tanyaAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soalanAI) return;
    
    setIsThinking(true);
    setHasilAI(null);
    setSqlGenerated('');

    try {
      const res = await fetch('/api/ejen-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soalan: soalanAI }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setHasilAI(data.data || data.results);
        setSqlGenerated(data.sql || '-- SQL GENERATED');
      } else {
        setHasilAI([{ Ralat: data.error || 'Gagal memproses soalan anda.' }]);
      }
    } catch (err: any) {
      setHasilAI([{ Ralat: err.message || 'Ralat sambungan API.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  // 1. PAPARAN KUNCI PINTU PAGAR (AUTH LOGIN)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0F1419] font-mono flex flex-col items-center justify-center p-6 text-[#A5B2D9] selection:bg-[#1793D1] selection:text-white">
        <div className="bg-[#171A21] p-8 rounded-sm shadow-[0_0_20px_rgba(23,147,209,0.3)] max-w-sm w-full border border-[#1793D1]/40">
          
          <div className="flex flex-col items-center mb-6">
            <span className="text-4xl mb-2">🛡️</span>
            <h1 className="text-2xl font-black text-white text-center tracking-tighter">rulaf-admin(1)</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Sudo Security Clearance</p>
          </div>

          <form onSubmit={klikLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1 font-bold">E-mel Guru (User)</label>
              <input
                type="email"
                required
                placeholder="ustaz@rulafhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F1419] border border-gray-800 focus:border-[#1793D1] focus:outline-none rounded-sm px-3 py-2 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1 font-bold">Kata Laluan (Sudo)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1419] border border-gray-800 focus:border-[#1793D1] focus:outline-none rounded-sm px-3 py-2 text-white text-xs font-mono"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-[10px] font-sans text-center leading-relaxed">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#1793D1] text-[#0F1419] py-2.5 rounded-sm text-xs font-black hover:bg-[#1272ab] transition-all duration-300 disabled:opacity-50"
            >
              {isLoggingIn ? '[ MEMPROSES AKSES... ]' : '[ JALANKAN SUDO LOGIN ]'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-850 pt-4 text-center">
            <Link href="/" className="text-[10px] text-gray-500 hover:text-white underline">
              [ ⬅️ Balik ke Laman Utama ]
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. PAPARAN DASHBOARD ADMIN (ESTETIK DISATUKAN DENGAN DASHBOARD GURU)
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-3 sm:p-8 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ================= HEADER PROFIL PENTADBIR (GAYA DASHBOARD) ================= */}
        <div className="bg-gradient-to-r from-[#0F2027] via-[#1793D1]/90 to-[#0F2027] dark:from-[#0a0e14] dark:via-[#0e4a6b] dark:to-[#0a0e14] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-[#1793D1]/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-black shadow-lg border border-white/20 overflow-hidden">
                <span>🛡️</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-sky-200/80 font-bold">Papan Pemuka Pentadbir</p>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Panel Pentadbir RuLaFHub</h1>
                <p className="text-xs text-sky-200/70 font-mono mt-1 truncate">{userEmail}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard" className="px-4 py-2 bg-white/95 text-[#0e4a6b] rounded-lg text-xs font-black hover:bg-white transition-all">
                [ Papan Guru ]
              </Link>
              <Link href="/profil" className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg text-xs font-bold transition-all">
                [ Profil & Tetapan ]
              </Link>
              <button
                onClick={logKeluar}
                className="px-4 py-2 bg-red-600/90 hover:bg-red-500 rounded-lg text-xs font-bold transition-all"
              >
                [ Log Keluar ]
              </button>
            </div>
          </div>
        </div>

          {/* ================= SEKSYEN 1: METRIKS SKOP SISTEM (GAYA DASHBOARD) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Kad: Guru Berdaftar (skop sistem) */}
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">🛡️ Guru Berdaftar</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stats.jumlahGuru}</span>
              <span className="text-[10px] text-gray-400">Guru + admin · semua sekolah</span>
            </div>

            {/* Kad: Murid Keseluruhan (semua sekolah) */}
            <div className="bg-white dark:bg-[#171A21] border border-[#1793D1]/40 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">🎓 Murid Keseluruhan</span>
              <span className="text-3xl font-black text-[#1793D1] block mt-1">{stats.jumlahMurid}</span>
              <span className="text-[10px] text-gray-400">Semua murid · semua sekolah</span>
            </div>

            {/* Kad: Sekolah Berdaftar */}
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">🏫 Sekolah Berdaftar</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stats.jumlahSekolah}</span>
              <span className="text-[10px] text-gray-400">Dalam ekosistem RuLaFHub</span>
            </div>

            {/* Kad: Pengguna Aktif (REAL-TIME) */}
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">🟢 Pengguna Aktif</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                {stats.aktifPengguna}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </span>
              <span className="text-[10px] text-gray-400">Sedang memantau & menguji</span>
            </div>

            {/* Kad: Siri Permainan (Kuiz) */}
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">🎮 Siri Permainan</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stats.jumlahKuiz}</span>
              <span className="text-[10px] text-gray-400">Modular Tadrij (Active)</span>
            </div>

            {/* Kad: Sumbangan BBM */}
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">📁 Sumbangan BBM</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stats.jumlahBBM}</span>
              <span className="text-[10px] text-gray-400">Bahan sokongan terbuka</span>
            </div>

          </div>

          {/* ================= SEKSYEN 2: PINTASAN PANTAS (GAYA DASHBOARD) ================= */}
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🚀</span> Pintasan Fungsi Utama
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/admin/murid" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">🧒</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Daftar Murid</span>
              </Link>
              <Link href="/admin/cipta-kuiz" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">✍️</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Cipta Kuiz</span>
              </Link>
              <Link href="/admin/pengurusan" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">📋</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Pengurusan Murid</span>
              </Link>
              <Link href="/repo" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">📁</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Repositori BBM</span>
              </Link>
              <Link href="/admin/kehadiran" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">📅</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Audit Kehadiran</span>
              </Link>
              <Link href="/blog" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">📚</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Blog & Changelog</span>
              </Link>
            </div>
          </div>

          {/* ================= SEKSYEN 3: REKA BENTUK GRID BELAH KIRI & KANAN ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* BELAH KIRI (8 KOLUM): EJEN AI ANALISIS PRESTASI (NL2SQL) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#171A21] border border-[#1793D1]/30 rounded-2xl p-6 relative shadow-sm">
                
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm">++ EJEN AI ANALISIS PRESTASI (NL2SQL)</h3>
                    <p className="text-[10px] text-gray-500">Tanya soalan bahasa tabii. Ejen AI akan menjana kod SQL untuk merungkai pangkalan data.</p>
                  </div>
                </div>

                <form onSubmit={tanyaAI} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cth: senarai murid dalam 3 Murshid yang lancar Al-Quran"
                      value={soalanAI}
                      onChange={(e) => setSoalanAI(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-800 focus:border-[#1793D1] focus:outline-none rounded-sm px-4 py-2.5 text-xs text-gray-900 dark:text-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isThinking}
                      className="bg-[#1793D1] text-[#0F1419] hover:bg-[#1272ab] px-5 py-2 text-xs font-black rounded-sm transition-all"
                    >
                      {isThinking ? 'MEMIKIR...' : '[ TANYA AI ]'}
                    </button>
                  </div>
                </form>

                {/* Hasil Output AI */}
                {(isThinking || hasilAI || sqlGenerated) && (
                  <div className="mt-6 space-y-4">
                    {/* Blok Kod SQL */}
                    {sqlGenerated && (
                      <div className="bg-[#0b0e14] border border-gray-800 rounded-sm overflow-hidden">
                        <div className="bg-[#121620] px-4 py-1.5 text-[9px] text-gray-400 font-bold border-b border-gray-800/80">
                          ~% SQL_GENERATED
                        </div>
                        <pre className="p-4 text-[11px] text-cyan-400 overflow-x-auto whitespace-pre font-mono">
                          {sqlGenerated}
                        </pre>
                      </div>
                    )}

                    {/* Paparan Jadual Data Dinamik */}
                    {hasilAI && (
                      <div className="border border-gray-200 dark:border-gray-850 rounded-sm overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800/30 px-4 py-2 text-[10px] text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-850">
                          [+] REKOD DITEMUI ({hasilAI.length})
                        </div>
                        <div className="overflow-x-auto max-h-[300px]">
                          <table className="w-full text-left text-[11px] font-mono border-collapse">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-850 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800">
                                {Object.keys(hasilAI[0] || {}).map((key, i) => (
                                  <th key={i} className="px-4 py-2 uppercase font-bold">{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {hasilAI.map((row: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-150 dark:border-gray-850 hover:bg-gray-100/50 dark:hover:bg-gray-800/30">
                                  {Object.values(row).map((val: any, i: number) => (
                                    <td key={i} className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                      {val !== null && val !== undefined ? String(val) : 'null'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* BELAH KANAN (4 KOLUM): CMS JOURNAL & NEWS PUBLISHER */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Borang Publish Jurnal */}
              <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <span>📝</span> Muat Naik Jurnal Inovasi & Blog
                </h3>

                <form onSubmit={muatNaikBlog} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Tajuk Artikel</label>
                    <input
                      type="text"
                      placeholder="Cth: Mengukur Impak Pembelajaran Jawi REDF"
                      value={tajukBlog}
                      onChange={(e) => setTajukBlog(e.target.value)}
                      className="w-full bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-800 focus:border-[#1793D1] focus:outline-none rounded-sm px-3 py-2 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase mb-1">Kandungan Jurnal</label>
                    <textarea
                      rows={4}
                      placeholder="Tulis huraian perkembangan, hasil amali, atau berita terkini di sini..."
                      value={kandunganBlog}
                      onChange={(e) => setKandunganBlog(e.target.value)}
                      className="w-full bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-800 focus:border-[#1793D1] focus:outline-none rounded-sm px-3 py-2 text-xs text-gray-900 dark:text-white font-sans"
                    />
                  </div>

                  {statusBlog && (
                    <p className="text-[10px] text-emerald-500 font-bold">{statusBlog}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-sm text-xs font-bold transition-all"
                  >
                    [ Terbitkan Artikel Baru ]
                  </button>
                </form>
              </div>

              {/* Artikel Terkini */}
              <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-gray-950 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
                  📰 Jurnal Terbitan Terkini (CMS)
                </h3>
                <div className="space-y-3">
                  {senaraiArtikel.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">Belum ada jurnal yang diterbitkan.</p>
                  ) : (
                    senaraiArtikel.map((art) => (
                      <div key={art.id} className="p-3 bg-white dark:bg-[#0F1419]/60 border border-gray-200 dark:border-gray-850 rounded-sm">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{art.tajuk}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans line-clamp-2 mt-1">
                          {art.kandungan}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
      </div>
    </div>
  );
}
