'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ambilSesi, ambilPerananDinormal, ialahAdmin } from '../lib/akses';

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [peranan, setPeranan] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profil, setProfil] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const session = await ambilSesi();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserEmail(session.user.email || '');
      const norm = await ambilPerananDinormal(session.user.email || '');
      setPeranan(norm);
      setProfil(session.user);
      setIsChecking(false);
    })();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="text-[#1793D1] animate-pulse">Memuatkan Papan Pemuka...</p>
      </div>
    );
  }

  if (peranan === 'guru' || peranan === 'admin') {
    return <PapanPemukaGuru email={userEmail} isAdmin={peranan === 'admin'} />;
  }
  if (peranan === 'murid') {
    return <PapanPemukaMurid email={userEmail} />;
  }
  if (peranan === 'waris') {
    return <PapanPemukaWaris email={userEmail} />;
  }

  // Peranan tidak dikenali: paparan umum
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-lg text-center space-y-4">
        <span className="text-4xl block">🔑</span>
        <h1 className="text-lg font-black text-gray-900 dark:text-white">Paparan Umum</h1>
        <p className="text-xs text-gray-500">
          Sila lengkapkan profil peranan anda dahulu untuk melihat paparan khusus mengikut peranan.
        </p>
        <Link href="/profil" className="block bg-[#1793D1] text-white py-2.5 rounded-lg text-xs font-bold">
          [ Lengkapkan Profil ]
        </Link>
      </div>
    </div>
  );
}

/* =====================================================================
   ██████  PAPAN PEMUKA GURU (DASHBOARD GURU MODEN)
   Termasuk: Ruang BBM Peribadi (Relokasi dari /repo) + Pintasan Pantas
   ===================================================================== */
function PapanPemukaGuru({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [stat, setStat] = useState({ jumlahBBM: 0, jumlahFolder: 0, jumlahMurid: 0 });
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [fotoProfil, setFotoProfil] = useState('');

  // 📸 Ambil gambar profil guru untuk badge header (fallback: inisial nama)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profil_pengguna')
        .select('profile_picture_url')
        .eq('email', email)
        .maybeSingle();
      setFotoProfil(data?.profile_picture_url || '');
    })();
  }, [email]);

  // Navigasi Folder Bersarang (Koleksi Peribadi Guru Sahaja)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderHistory, setFolderHistory] = useState<number[]>([]);

  // Borang Fail BBM
  const [jenisSumbangan, setJenisSumbangan] = useState<'fail' | 'folder'>('fail');
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [pautanTerkunci, setPautanTerkunci] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');
  const [tajukFolder, setTajukFolder] = useState('');
  const [readmeText, setReadmeText] = useState('');

  const tarikRepoSendiri = useCallback(async () => {
    const { data } = await supabase
      .from('rulaf_repo')
      .select('*')
      .eq('penyumbang', email)
      .order('is_folder', { ascending: false })
      .order('tajuk', { ascending: true });
    if (data) {
      setBahanRepo(data);
      setStat({
        jumlahBBM: data.filter((b) => !b.is_folder).length,
        jumlahFolder: data.filter((b) => b.is_folder).length,
        jumlahMurid: stat.jumlahMurid,
      });
    }
  }, [email]);

  useEffect(() => {
    tarikRepoSendiri();
    (async () => {
      const { count } = await supabase.from('data_murid').select('*', { count: 'exact', head: true });
      setStat((s) => ({ ...s, jumlahMurid: count || 58 }));
    })();
  }, [tarikRepoSendiri]);

  const handleUploadKeStorage = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) return alert('Saiz fail melebihi had 50MB!');
    setIsUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const namaBersih = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `bbm-fail/${Date.now()}_${namaBersih}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('modul-rulaf').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('modul-rulaf').getPublicUrl(filePath);
      setPautanRepo(publicUrl);
      setPautanTerkunci(true);
      if (!tajukRepo) setTajukRepo(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      alert('Gagal memuat naik fail: ' + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const worldFolderSemasa = bahanRepo.find((f) => f.id === currentFolderId);
  const isPemilikFolderSemasa = currentFolderId === null ? true : (worldFolderSemasa?.penyumbang === email || isAdmin);

  const pushRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPemilikFolderSemasa) return alert('[!] Akses Ditolak: Anda tidak boleh memuat naik bahan ke dalam folder guru lain!');
    if (!tajukRepo || !pautanRepo) return alert('[!] Sila isi Tajuk dan sediakan fail/pautan!');
    const { error } = await supabase.from('rulaf_repo').insert([{
      tajuk: tajukRepo.trim(),
      pautan: pautanRepo.trim(),
      penyumbang: email,
      subjek: subjekRepo,
      darjah: darjahRepo,
      topik: topikRepo.trim(),
      is_folder: false,
      parent_id: currentFolderId,
      status: 'approved'
    }]);
    if (error) alert('Ralat: ' + error.message);
    else {
      alert('🎉 BBM Berjaya diterbitkan ke ruang peribadi anda!');
      setTajukRepo(''); setPautanRepo(''); setPautanTerkunci(false); setTopikRepo('');
      tarikRepoSendiri();
    }
  };

  const buatFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPemilikFolderSemasa) return alert('[!] Akses Ditolak: Anda tidak dibenarkan mencipta subfolder di dalam folder guru lain!');
    if (!tajukFolder) return alert('[!] Sila masukkan Nama Folder!');
    const { error } = await supabase.from('rulaf_repo').insert([{
      tajuk: tajukFolder.trim(),
      readme_text: readmeText.trim(),
      penyumbang: email,
      is_folder: true,
      parent_id: currentFolderId,
      status: 'approved'
    }]);
    if (error) alert('Ralat: ' + error.message);
    else {
      alert('📁 Folder koleksi peribadi anda berjaya dicipta!');
      setTajukFolder(''); setReadmeText('');
      tarikRepoSendiri();
    }
  };

  const padamItem = async (id: number, pemilik: string) => {
    if (pemilik !== email && !isAdmin) return alert('⚠️ Anda hanya dibenarkan memadam bahan atau folder milik anda sendiri!');
    if (!window.confirm('⚠️ Adakah anda pasti mahu memadamkan bahan ini secara kekal?')) return;
    const { error } = await supabase.from('rulaf_repo').delete().eq('id', id);
    if (error) alert('Ralat memadam kandungan: ' + error.message);
    else { alert('🗑️ Kandungan berjaya dipadam!'); tarikRepoSendiri(); }
  };

  const bukaFolder = (id: number) => {
    setFolderHistory((prev) => [...prev, currentFolderId as number].filter((x) => x !== null));
    setCurrentFolderId(id);
  };

  const kembali = () => {
    const sejarah = [...folderHistory];
    const folderSebelum = sejarah.pop();
    setFolderHistory(sejarah);
    setCurrentFolderId(folderSebelum !== undefined ? folderSebelum : null);
  };

  const itemTahapSemasa = currentFolderId === null
    ? bahanRepo.filter((i) => i.parent_id === null || i.parent_id === undefined)
    : bahanRepo.filter((i) => i.parent_id === currentFolderId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Profil Guru */}
        <div className="bg-gradient-to-r from-[#0F2027] via-[#1793D1]/90 to-[#0F2027] dark:from-[#0a0e14] dark:via-[#0e4a6b] dark:to-[#0a0e14] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-[#1793D1]/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-black shadow-lg border border-white/20 overflow-hidden">
                {fotoProfil ? (
                  <img src={fotoProfil} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <span>{isAdmin ? '🛡️' : '👨🏫'}</span>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-sky-200/80 font-bold">Papan Pemuka {isAdmin ? 'Pentadbir' : 'Guru'}</p>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Dashboard RuLaFHub</h1>
                <p className="text-xs text-sky-200/70 font-mono mt-1 truncate">{email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <Link href="/admin" className="px-4 py-2 bg-white/95 text-[#0e4a6b] rounded-lg text-xs font-black hover:bg-white transition-all">
                  [ Panel Pentadbir ]
                </Link>
              )}
              <Link href="/profil" className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg text-xs font-bold transition-all">
                [ Profil & Tetapan ]
              </Link>
            </div>
          </div>
        </div>

        {/* Kad Metrik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase">📁 BBM Saya</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stat.jumlahBBM}</span>
          </div>
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase">🗂️ Folder Peribadi</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">{stat.jumlahFolder}</span>
          </div>
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase">👨‍🎓 Murid Berdaftar</span>
            <span className="text-3xl font-black text-[#1793D1] block mt-1">{stat.jumlahMurid}</span>
          </div>
        </div>

        {/* Pintasan Pantas */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🚀</span> Pintasan Fungsi Utama
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/semakan" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">🔍</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Fungsi Semakan</span>
            </Link>
            <Link href="/admin/pengurusan" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">📋</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Pengurusan Murid</span>
            </Link>
            <Link href="/admin/kehadiran" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">📅</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Audit Kehadiran</span>
            </Link>
            <Link href="/admin/cipta-kuiz" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">✍️</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Cipta Kuiz</span>
            </Link>
            <Link href="/blog" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">✍️</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Tulis Blog</span>
            </Link>
            <Link href="/forum" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">💬</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Forum Komuniti</span>
            </Link>
            <Link href="/permainan" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">🎮</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Permainan</span>
            </Link>
            <Link href="/docs" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">📖</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Dokumentasi</span>
            </Link>
            <Link href="/dana" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 hover:border-[#1793D1] hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">💼</span>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#1793D1]">Tabung Dana</span>
            </Link>
          </div>
        </div>

        {/* RUANG BBM PERIBADI GURU (RELOCATED DARI /repo) */}
        <div className="bg-white dark:bg-[#171A21] border border-[#1793D1]/30 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>📂</span> Ruang BBM Peribadi Guru
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Koleksi ini hanya memaparkan bahan milik <span className="font-bold text-[#1793D1]">{email}</span>. Guru lain tidak dapat mengubah folder anda.
              </p>
            </div>
            <button
              onClick={() => { setFolderHistory([]); setCurrentFolderId(null); }}
              className="text-xs text-[#1793D1] font-bold hover:underline self-start sm:self-auto"
            >
              [ 🏠 Ke Root Koleksi Saya ]
            </button>
          </div>

          {/* Breadcrumb */}
          {(currentFolderId !== null || folderHistory.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
              <button onClick={() => { setFolderHistory([]); setCurrentFolderId(null); }} className="text-[#1793D1] font-bold">
                Root
              </button>
              {currentFolderId !== null && worldFolderSemasa && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-bold text-gray-900 dark:text-white">📁 {worldFolderSemasa.tajuk}</span>
                </>
              )}
              <button
                onClick={kembali}
                className="ml-auto bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 px-3 py-1 rounded text-gray-600 dark:text-gray-300 font-bold"
              >
                [ ⬅️ Kembali ]
              </button>
            </div>
          )}

          {/* Tab Bentuk Sumbangan */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
            <button
              type="button"
              onClick={() => setJenisSumbangan('fail')}
              className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'fail' ? 'text-[#1793D1] border-b-2 border-[#1793D1]' : 'text-gray-400'}`}
            >
              [ 📄 Muat Naik Fail BBM ]
            </button>
            <button
              type="button"
              onClick={() => setJenisSumbangan('folder')}
              className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'folder' ? 'text-[#1793D1] border-b-2 border-[#1793D1]' : 'text-gray-400'}`}
            >
              [ 📁 Cipta Folder Sendiri ]
            </button>
          </div>

          {jenisSumbangan === 'fail' ? (
            <form onSubmit={pushRepo} className="space-y-4 bg-gray-50 dark:bg-[#11141b] rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                🚀 Terbit Fail ke: <span className="text-[#1793D1]">{worldFolderSemasa?.tajuk || 'Root Koleksi Peribadi'}</span>
              </h3>
              <div className="p-3 bg-blue-50/50 dark:bg-[#1793D1]/5 border border-[#1793D1]/30 rounded-lg space-y-2">
                <label className="block text-xs font-bold text-[#1793D1]">📤 Muat Naik Dokumen / PDF (modul-rulaf)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.zip"
                  disabled={isUploadingFile}
                  onChange={(e) => e.target.files && e.target.files[0] && handleUploadKeStorage(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#1793D1] file:text-white hover:file:opacity-80"
                />
                {isUploadingFile && <p className="text-xs text-orange-500 animate-pulse font-bold">Sedang memuat naik ke storan awan...</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tajuk Bahan</label>
                  <input type="text" required placeholder="Cth: Latihan Kata Pinjaman" value={tajukRepo} onChange={(e) => setTajukRepo(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-gray-500">Pautan Fail</label>
                    {pautanTerkunci && <button type="button" onClick={() => { setPautanRepo(''); setPautanTerkunci(false); }} className="text-[10px] text-red-500 hover:underline font-bold">[ Buka Kunci ]</button>}
                  </div>
                  <input type="text" required readOnly={pautanTerkunci} value={pautanRepo} onChange={(e) => setPautanRepo(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:outline-none bg-white dark:bg-[#171A21] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" placeholder="Pautan terisi automatik" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Darjah</label>
                  <select value={darjahRepo} onChange={(e) => setDarjahRepo(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {['Darjah 1','Darjah 2','Darjah 3','Darjah 4','Darjah 5','UPKK'].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Subjek</label>
                  <select value={subjekRepo} onChange={(e) => setSubjekRepo(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {['Jawi','Ibadat','Bahasa Arab','Sirah','Tauhid','Adab'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Topik / Bab</label>
                  <input type="text" placeholder="Cth: Syarat Wajib Solat" value={topikRepo} onChange={(e) => setTopikRepo(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
                </div>
              </div>
              <button type="submit" disabled={isUploadingFile} className="bg-[#1793D1] text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#1272ab] transition-colors disabled:opacity-50">
                [ + Sahkan & Terbitkan BBM ]
              </button>
            </form>
          ) : (
            <form onSubmit={buatFolder} className="space-y-4 bg-gray-50 dark:bg-[#11141b] rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">📁 Cipta Koleksi Baharu</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nama Folder Koleksi</label>
                <input type="text" required placeholder="Contoh: Modul Intensif Jawi" value={tajukFolder} onChange={(e) => setTajukFolder(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nota Penerangan (README)</label>
                <textarea rows={3} placeholder="Tulis penerangan ringkas..." value={readmeText} onChange={(e) => setReadmeText(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
              </div>
              <button type="submit" className="bg-[#1793D1] text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#1272ab] transition-colors">
                [ Cipta Folder Koleksi ]
              </button>
            </form>
          )}

          {/* Senarai Item Peribadi */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {currentFolderId === null ? 'Koleksi & Folder Milik Saya' : `Isi Kandungan: ${worldFolderSemasa?.tajuk || ''}`}
            </h4>
            {itemTahapSemasa.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-xs">Tiada koleksi ditemui. Mula cipta BBM anda di atas.</p>
            ) : itemTahapSemasa.map((item) => (
              <div key={item.id} className="p-4 border rounded-xl bg-gray-50 dark:bg-[#11141b]/60 hover:border-[#1793D1]/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  {item.is_folder ? (
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">📁</span>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">{item.tajuk}</h3>
                        <p className="text-xs text-gray-500">Folder peribadi anda</p>
                      </div>
                      <button onClick={() => bukaFolder(item.id)} className="ml-auto text-xs text-[#1793D1] font-bold hover:underline">[ Buka ➔ ]</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">📄</span>
                      <div>
                        <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold mb-1">{item.subjek} - {item.darjah}</span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{item.tajuk}</h3>
                        <p className="text-[11px] text-gray-500">Topik: {item.topik || 'Umum'}</p>
                      </div>
                      <a href={item.pautan} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs bg-gray-200 dark:bg-gray-800 px-3 py-1.5 rounded font-bold text-gray-700 dark:text-gray-200 hover:bg-[#1793D1] hover:text-white transition-all">
                        [ Buka / Muat Turun ]
                      </a>
                    </div>
                  )}
                  <button onClick={() => padamItem(item.id, item.penyumbang)} className="text-xs text-red-500 hover:underline font-bold self-end sm:self-auto">
                    [ Padam ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* =====================================================================
   ██████  PAPAN PEMUKA MURID (DASHBOARD PELAJAR MODEN)
   ===================================================================== */
function PapanPemukaMurid({ email }: { email: string }) {
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profil_pengguna').select('*').eq('email', email).maybeSingle();
      if (data) {
        setProfil(data);
        const { data: hasil } = await supabase
          .from('markah_murid')
          .select('*')
          .eq('mykid', data.mykid)
          .order('id', { ascending: false })
          .limit(1);
        if (hasil && hasil[0]) setProfil((p: any) => ({ ...p, markah: hasil[0] }));
      }
      setLoading(false);
    })();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="text-[#1793D1] animate-pulse">Memuatkan profil pelajar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-300/20 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black shadow-lg">
              {(profil?.nama || 'P')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-emerald-100 font-bold">Papan Pemuka Pelajar</p>
              <h1 className="text-xl font-black">{profil?.nama || 'Pelajar RuLaF'}</h1>
              <p className="text-xs text-emerald-100 font-mono">{email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Kelas', value: profil?.markah?.kelas_id || '-', ikon: '🏫' },
            { label: 'Tahap RuLaF', value: profil?.markah?.tahap_rulaf || '-', ikon: '🏅' },
            { label: 'Jawi', value: profil?.markah?.markah_jawi != null ? `${profil.markah.markah_jawi}%` : '-', ikon: '📝' },
            { label: 'Quran', value: profil?.markah?.bacaan_quran || '-', ikon: '📖' },
          ].map((k) => (
            <div key={k.label} className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
              <span className="text-lg">{k.ikon}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase block mt-1">{k.label}</span>
              <span className="text-base font-black text-gray-900 dark:text-white block truncate">{k.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/semakan" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-all">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500">Fungsi Semakan Prestasi</p>
              <p className="text-[11px] text-gray-500">Lihat markah formatif & pencapaian anda</p>
            </div>
          </Link>
          <Link href="/permainan" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-all">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500">Arked Permainan</p>
              <p className="text-[11px] text-gray-500">Misi RPG & pentaksiran interaktif (Tadrij)</p>
            </div>
          </Link>
          <Link href="/profil" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-all">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500">Profil & Tetapan</p>
              <p className="text-[11px] text-gray-500">Kemas kini profil & tukar kata laluan</p>
            </div>
          </Link>
          <Link href="/forum" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-all">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500">Forum Komuniti</p>
              <p className="text-[11px] text-gray-500">Baca topik & beri komen</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   ██████  PAPAN PEMUKA IBU BAPA (WARIS)
   ===================================================================== */
function PapanPemukaWaris({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-amber-300/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl shadow-lg">👨‍👩‍👧</div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-amber-100 font-bold">Papan Pemuka Ibu Bapa / Waris</p>
              <h1 className="text-xl font-black">Pantau Prestasi Anak</h1>
              <p className="text-xs text-amber-100 font-mono mt-1">{email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/semakan" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-amber-500 transition-all">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Semakan Prestasi (MyKid)</p>
              <p className="text-[11px] text-gray-500">Semak markah & perkembangan anak</p>
            </div>
          </Link>
          <Link href="/forum" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-amber-500 transition-all">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Forum Komuniti</p>
              <p className="text-[11px] text-gray-500">Ikuti perbincangan PAK21</p>
            </div>
          </Link>
          <Link href="/profil" className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 hover:border-amber-500 transition-all">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Profil & Tetapan</p>
              <p className="text-[11px] text-gray-500">Kemas kini profil & tukar kata laluan</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}