'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import CountDownUpkk from '@/components/CountDownUpkk';

export default function RepositoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [carianRepo, setCarianRepo] = useState('');

  // 🎯 NAVIGASI FOLDER BERSARANG (HIERARKI 3 ARAS)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [selectedDarjah, setSelectedDarjah] = useState<string | null>(null);
  const [selectedSubjek, setSelectedSubjek] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<number[]>([]);

  const [peranan, setPeranan] = useState<string>('');
  const [jenisSumbangan, setJenisSumbangan] = useState<'fail' | 'folder'>('fail');

  // State borang tambah BBM
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');

  // State borang tambah Folder
  const [tajukFolder, setTajukFolder] = useState('');
  const [readmeText, setReadmeText] = useState('');

  // 🛠️ JALUR KESELAMATAN & MODERATOR
  const adminEmails = ['admin@rulafhub.com', 'ismail@rulafhub.com', 'ust_ismail@rulafhub.com'];
  const isUserAdmin = isLoggedIn && (
    adminEmails.includes(userEmail) || 
    userEmail.startsWith('admin') || 
    userEmail.includes('ust_ismail') || 
    userEmail.includes('ismail')
  );

  const kemasKiniStatus = async (id: number, statusBaharu: string) => {
    const { error } = await supabase
      .from('rulaf_repo')
      .update({ status: statusBaharu })
      .eq('id', id);

    if (error) {
      alert('Ralat kemas kini status: ' + error.message);
    } else {
      alert(`🎉 Status kandungan berjaya ditukar kepada ${statusBaharu.toUpperCase()}!`);
      tarikDataRepo();
    }
  };

  const padamItem = async (id: number) => {
    if (!window.confirm('⚠️ AMARAN: Padam kandungan ini secara kekal daripada sistem?')) return;
    const { error } = await supabase
      .from('rulaf_repo')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ralat memadam kandungan: ' + error.message);
    } else {
      alert('🗑️ Kandungan berjaya dipadam!');
      tarikDataRepo();
    }
  };

  useEffect(() => {
    semakUser();
    tarikDataRepo();
  }, []);

  // Setkan nilai default darjah/subjek pada borang mengikut folder yang sedang dibuka
  useEffect(() => {
    if (selectedDarjah) setDarjahRepo(selectedDarjah);
    if (selectedSubjek) setSubjekRepo(selectedSubjek);
  }, [selectedDarjah, selectedSubjek]);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      const emailUser = session.user.email || 'Pendidik RuLaF';
      setUserEmail(emailUser);

      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailUser)
        .maybeSingle();

      if (profil && profil.peranan) {
        setPeranan(profil.peranan);
      } else {
        if (emailUser.startsWith('admin') || emailUser.includes('ismail') || emailUser.includes('ust_ismail')) {
          setPeranan('Guru');
        } else {
          setPeranan('Murid');
        }
      }
    }
  };

  const tarikDataRepo = async () => {
    const { data } = await supabase
      .from('rulaf_repo')
      .select('*')
      .order('is_folder', { ascending: false })
      .order('tajuk', { ascending: true });
    if (data) setBahanRepo(data);
  };

  const pushRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru dibenarkan memuat naik!');
    if (!tajukRepo || !pautanRepo) return alert('[!] Sila isi Tajuk dan Pautan fail!');
    
    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukRepo,
        pautan: pautanRepo,
        penyumbang: userEmail,
        subjek: subjekRepo,
        darjah: darjahRepo,
        topik: topikRepo,
        is_folder: false,
        parent_id: currentFolderId,
        status: 'approved'
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('🎉 BBM Berjaya disumbangkan!');
      setTajukRepo('');
      setPautanRepo('');
      setTopikRepo('');
      tarikDataRepo();
    }
  };

  const buatFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru dibenarkan membina folder!');
    if (!tajukFolder) return alert('[!] Sila masukkan Nama Folder!');

    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukFolder,
        readme_text: readmeText,
        penyumbang: userEmail,
        is_folder: true,
        parent_id: currentFolderId,
        status: 'approved'
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('📁 Folder baharu berjaya dicipta!');
      setTajukFolder('');
      setReadmeText('');
      tarikDataRepo();
    }
  };

  // 🎯 LOGIK NAVIGASI STACKED
  const bukaFolder = (id: number) => {
    setFolderHistory((prev) => [...prev, currentFolderId as number].filter(x => x !== null));
    setCurrentFolderId(id);
    setSelectedDarjah(null);
    setSelectedSubjek(null);
  };

  const kembaliSatuAras = () => {
    if (selectedSubjek !== null) {
      setSelectedSubjek(null);
    } else if (selectedDarjah !== null) {
      setSelectedDarjah(null);
    } else if (currentFolderId !== null) {
      const sejarahBaru = [...folderHistory];
      const folderSebelum = sejarahBaru.pop();
      setFolderHistory(sejarahBaru);
      setCurrentFolderId(folderSebelum !== undefined ? folderSebelum : null);
    }
  };

  const pergiKeRoot = () => {
    setFolderHistory([]);
    setCurrentFolderId(null);
    setSelectedDarjah(null);
    setSelectedSubjek(null);
  };

  // Ambil semua item di bawah folder semasa
  const itemFolderSemasa = bahanRepo.filter((item) => {
    if (currentFolderId === null) {
      return item.parent_id === null || item.parent_id === undefined;
    }
    return item.parent_id === currentFolderId;
  });

  // Folder fizikal buatan guru (jika ada subfolder di dalam folder)
  const manualSubfolders = itemFolderSemasa.filter(item => item.is_folder);

  // Senarai Fail BBM (bukan folder) dalam folder semasa
  const failBbmDalamFolder = itemFolderSemasa.filter(item => !item.is_folder);

  // 🗂️ 1. Ekstrak Darjah unik daripada fail dalam folder ini
  const senaraiDarjahUnik = Array.from(new Set(failBbmDalamFolder.map(f => f.darjah || 'Umum'))).sort();

  // 🗂️ 2. Ekstrak Subjek unik mengikut Darjah yang dipilih
  const senaraiSubjekUnik = Array.from(
    new Set(
      failBbmDalamFolder
        .filter(f => (f.darjah || 'Umum') === selectedDarjah)
        .map(f => f.subjek || 'Umum')
    )
  ).sort();

  // 🗂️ 3. Tapis fail akhir mengikut Darjah & Subjek yang sedang dibuka
  const senaraiFailDipaparkan = failBbmDalamFolder.filter(f => {
    const padanDarjah = (f.darjah || 'Umum') === selectedDarjah;
    const padanSubjek = (f.subjek || 'Umum') === selectedSubjek;
    return padanDarjah && padanSubjek;
  });

  // Carian pantas (jika pengguna menaip, terus langkau hirarki)
  const failCarian = bahanRepo.filter(item =>
    !item.is_folder && (
      item.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.topik?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.darjah?.toLowerCase().includes(carianRepo.toLowerCase())
    )
  );

  const folderSemasaObj = bahanRepo.find(f => f.id === currentFolderId);
  const readmeSemasa = folderSemasaObj?.readme_text;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md overflow-hidden transition-all duration-300">
        <CountDownUpkk />
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RULAF-HUB :: REPOSITORI BERSTRUKTUR (DARJAH & SUBJEK)</span>
          <span>{isLoggedIn ? `[ ${userEmail} ]` : '[ TETAMU ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Koleksi Bahan Bantu Mengajar (BBM) disusun rapi mengikut koleksi guru, peringkat tahun/darjah, dan mata pelajaran bagi memudahkan rujukan pantas murid serta pendidik.
          </p>

          {/* BORANG SUMBANGAN GURU */}
          {isLoggedIn && peranan === 'Guru' ? (
            <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8">
              <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('fail')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'fail' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400'}`}
                >
                  [ 📄 Sumbang Fail BBM ]
                </button>
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('folder')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'folder' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400'}`}
                >
                  [ 📁 Cipta Koleksi/Folder Utama ]
                </button>
              </div>

              {jenisSumbangan === 'fail' ? (
                <form onSubmit={pushRepo}>
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">
                    🚀 Terbit Fail ke: <span className="text-[#1793D1]">{folderSemasaObj?.tajuk || 'Root Repositori'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tajuk Bahan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Latihan Makanan & Minuman"
                        value={tajukRepo}
                        onChange={(e) => setTajukRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pautan BBM (Google Drive / Canva / Quizizz)</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={pautanRepo}
                        onChange={(e) => setPautanRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Peringkat Kelas</label>
                      <select
                        value={darjahRepo}
                        onChange={(e) => setDarjahRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      >
                        <option value="Darjah 1">Darjah 1</option>
                        <option value="Darjah 2">Darjah 2</option>
                        <option value="Darjah 3">Darjah 3</option>
                        <option value="Darjah 4">Darjah 4</option>
                        <option value="Darjah 5">Darjah 5</option>
                        <option value="UPKK">UPKK</option>
                        <option value="Darjah 6">Darjah 6</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Subjek</label>
                      <select
                        value={subjekRepo}
                        onChange={(e) => setSubjekRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      >
                        <option value="Jawi">Jawi</option>
                        <option value="Ibadat">Ibadat</option>
                        <option value="Bahasa Arab">Bahasa Arab</option>
                        <option value="Sirah">Sirah</option>
                        <option value="Tauhid">Tauhid</option>
                        <option value="Adab">Adab</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nama Topik / Bab</label>
                      <input
                        type="text"
                        placeholder="Contoh: Solat Jumaat"
                        value={topikRepo}
                        onChange={(e) => setTopikRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
                  >
                    [ + Terbitkan Fail BBM ]
                  </button>
                </form>
              ) : (
                <form onSubmit={buatFolder}>
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">📁 Cipta Folder Koleksi Baharu</h3>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Nama Folder Koleksi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Latihan RuLaF By Ust_Ismail"
                      value={tajukFolder}
                      onChange={(e) => setTajukFolder(e.target.value)}
                      className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Nota & Maklumat Keselamatan README</label>
                    <textarea
                      rows={4}
                      placeholder="Penerangan mengenai bahan-bahan di dalam koleksi ini..."
                      value={readmeText}
                      onChange={(e) => setReadmeText(e.target.value)}
                      className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
                  >
                    [ Cipta Folder Koleksi ]
                  </button>
                </form>
              )}
            </div>
          ) : null}

          {/* BAR CARIAN */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari tajuk BBM, subjek, atau darjah (cth: Gerhana, Darjah 5, Arab)..."
              value={carianRepo}
              onChange={(e) => setCarianRepo(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none text-sm"
            />
          </div>

          {/* 🧭 HEADER BREADCRUMBS BERHIRARKI */}
          <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={pergiKeRoot} className="text-[#1793D1] hover:underline font-bold">
                [ 🏠 Root-Repo ]
              </button>

              {currentFolderId !== null && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => {
                      setSelectedDarjah(null);
                      setSelectedSubjek(null);
                    }}
                    className={`font-bold hover:underline ${selectedDarjah === null ? 'text-gray-900 dark:text-white' : 'text-[#1793D1]'}`}
                  >
                    📁 {folderSemasaObj?.tajuk}
                  </button>
                </>
              )}

              {selectedDarjah !== null && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => setSelectedSubjek(null)}
                    className={`font-bold hover:underline ${selectedSubjek === null ? 'text-gray-900 dark:text-white' : 'text-[#1793D1]'}`}
                  >
                    📂 {selectedDarjah}
                  </button>
                </>
              )}

              {selectedSubjek !== null && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    📖 {selectedSubjek}
                  </span>
                </>
              )}
            </div>

            {(currentFolderId !== null || selectedDarjah !== null || selectedSubjek !== null) && (
              <button
                onClick={kembaliSatuAras}
                className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white font-bold"
              >
                [ ⬅️ Kembali ]
              </button>
            )}
          </div>

          {/* ============================================================== */}
          {/* 📂 KAWASAN KANDUNGAN UTAMA MENGIKUT PERINGKAT                    */}
          {/* ============================================================== */}

          {/* 1. JIKA MEMBUAT CARIAN PANTAS */}
          {carianRepo.trim() !== '' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Hasil Carian: "{carianRepo}"</h4>
              {failCarian.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">Tiada bahan yang sepadan dengan carian.</p>
              ) : (
                failCarian.map(item => <ItemKadBBM key={item.id} item={item} isUserAdmin={isUserAdmin} kemasKiniStatus={kemasKiniStatus} padamItem={padamItem} />)
              )}
            </div>
          ) : currentFolderId === null ? (
            /* 2. ARAS ROOT: PAPAR FOLDER KOLEKSI UTAMA */
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Koleksi Utama Repositori</h4>
              {itemFolderSemasa.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">Repositori masih kosong.</p>
              ) : (
                itemFolderSemasa.map((item) => (
                  item.is_folder ? (
                    <div
                      key={item.id}
                      onClick={() => bukaFolder(item.id)}
                      className="p-5 border rounded bg-gray-100/70 dark:bg-[#1a1f29]/50 hover:bg-gray-200 dark:hover:bg-[#1a1f29] border-gray-200 dark:border-gray-800 hover:border-[#1793D1] cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl">📁</span>
                        <div>
                          <h3 className="font-bold text-base text-gray-900 dark:text-white">{item.tajuk}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Sumbangan: {item.penyumbang}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#1793D1] font-bold">[ Buka Koleksi ➔ ]</span>
                    </div>
                  ) : (
                    <ItemKadBBM key={item.id} item={item} isUserAdmin={isUserAdmin} kemasKiniStatus={kemasKiniStatus} padamItem={padamItem} />
                  )
                ))
              )}
            </div>
          ) : selectedDarjah === null ? (
            /* 3. ARAS DALAM KOLEKSI: STACKED MENGIKUT DARJAH */
            <div className="space-y-6">
              {readmeSemasa && (
                <div className="border border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-[#11141b] rounded p-4 text-xs font-mono">
                  <span className="text-gray-400 font-bold block mb-1">📋 MAKLUMAT KOLEKSI (README):</span>
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{readmeSemasa}</p>
                </div>
              )}

              {/* Subfolder Manual Jika Ada */}
              {manualSubfolders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Subfolder Khas</h4>
                  {manualSubfolders.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => bukaFolder(sub.id)}
                      className="p-4 border rounded bg-gray-100 dark:bg-[#1a1f29] cursor-pointer hover:border-[#1793D1] flex justify-between items-center"
                    >
                      <span className="font-bold text-sm">📁 {sub.tajuk}</span>
                      <span className="text-xs text-[#1793D1]">Buka ➔</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  PILIH TAHUN / DARJAH DALAM KOLEKSI INI:
                </h4>
                {senaraiDarjahUnik.length === 0 ? (
                  <p className="text-center py-6 text-gray-500 text-xs">Belum ada bahan didaftarkan di dalam koleksi ini.</p>
                ) : (
                  senaraiDarjahUnik.map(darjah => {
                    const bilangan = failBbmDalamFolder.filter(f => (f.darjah || 'Umum') === darjah).length;
                    return (
                      <div
                        key={darjah}
                        onClick={() => setSelectedDarjah(darjah)}
                        className="p-4 border rounded bg-gray-100/80 dark:bg-[#171A21] hover:bg-gray-200 dark:hover:bg-[#1c202a] border-gray-200 dark:border-gray-800 hover:border-[#1793D1] cursor-pointer flex justify-between items-center transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📂</span>
                          <div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white block">{darjah}</span>
                            <span className="text-[11px] text-gray-400">{bilangan} fail BBM tersedia</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#1793D1] font-bold">Pilih Darjah ➔</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : selectedSubjek === null ? (
            /* 4. ARAS SUBJEK: STACKED MENGIKUT SUBJEK BAGI DARJAH TERSEBUT */
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                PILIH SUBJEK BAGI {selectedDarjah?.toUpperCase()}:
              </h4>
              {senaraiSubjekUnik.length === 0 ? (
                <p className="text-center py-6 text-gray-500 text-xs">Tiada subjek ditemui.</p>
              ) : (
                senaraiSubjekUnik.map(subjek => {
                  const bilangan = failBbmDalamFolder.filter(
                    f => (f.darjah || 'Umum') === selectedDarjah && (f.subjek || 'Umum') === subjek
                  ).length;
                  return (
                    <div
                      key={subjek}
                      onClick={() => setSelectedSubjek(subjek)}
                      className="p-4 border rounded bg-gray-100/80 dark:bg-[#171A21] hover:bg-gray-200 dark:hover:bg-[#1c202a] border-gray-200 dark:border-gray-800 hover:border-amber-500 cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📖</span>
                        <div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white block">{subjek}</span>
                          <span className="text-[11px] text-gray-400">{bilangan} modul latihan/bahan</span>
                        </div>
                      </div>
                      <span className="text-xs text-amber-500 font-bold">Buka Subjek ➔</span>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* 5. ARAS FAIL BBM SEBENAR: SENARAI FAIL DITAPIS PENUH */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-[#1793D1] uppercase">
                  SENARAI FAIL BBM: {selectedDarjah} ➔ {selectedSubjek}
                </h4>
                <span className="text-[11px] text-gray-400">{senaraiFailDipaparkan.length} Fail Ditemui</span>
              </div>

              {senaraiFailDipaparkan.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">Tiada fail di dalam folder subjek ini.</p>
              ) : (
                senaraiFailDipaparkan.map(item => (
                  <ItemKadBBM key={item.id} item={item} isUserAdmin={isUserAdmin} kemasKiniStatus={kemasKiniStatus} padamItem={padamItem} />
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// 📦 KOMPONEN KAD FAIL BBM TERSUSUN
function ItemKadBBM({ item, isUserAdmin, kemasKiniStatus, padamItem }: any) {
  return (
    <div className="p-4 border rounded bg-gray-100/40 dark:bg-[#11141b]/60 border-gray-200 dark:border-gray-800 hover:border-[#1793D1]/50 transition-all">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex items-start gap-3.5 flex-1">
          <span className="text-2xl select-none mt-0.5">📄</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
                {item.subjek} - {item.darjah}
              </span>
              
              {(!item.status || item.status === 'approved') && (
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-blue-200 dark:border-blue-900/50">
                  🔹 Approved
                </span>
              )}
              {item.status === 'danger' && (
                <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-red-200 dark:border-red-900/50">
                  ⚠️ Danger (Blocked)
                </span>
              )}
              {item.status === 'abandoned' && (
                <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-amber-200 dark:border-amber-900/50">
                  ⚠️ Abandoned
                </span>
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">{item.tajuk}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Topik: <span className="text-gray-700 dark:text-gray-300 font-semibold">{item.topik || 'Umum'}</span> | Penyumbang: {item.penyumbang}
            </p>

            {/* Kawalan Admin */}
            {isUserAdmin && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
                <span className="text-[10px] text-gray-400 font-bold uppercase">🛠️ Kawalan:</span>
                <button
                  onClick={() => kemasKiniStatus(item.id, 'approved')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${(!item.status || item.status === 'approved') ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-400 border-gray-700'}`}
                >
                  Lulus
                </button>
                <button
                  onClick={() => kemasKiniStatus(item.id, 'danger')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${item.status === 'danger' ? 'bg-red-600 text-white border-red-600' : 'text-gray-400 border-gray-700'}`}
                >
                  Bahaya
                </button>
                <button
                  onClick={() => padamItem(item.id)}
                  className="ml-auto bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                >
                  🗑️ Padam
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:self-center">
          {item.status === 'danger' ? (
            <span className="block text-center bg-red-950/40 text-red-400 border border-red-900 px-3 py-1.5 text-xs rounded font-bold uppercase select-none">
              🚫 Disekat
            </span>
          ) : (
            <Link
              href={`/repo/bbm/${item.id}`}
              className="block text-center bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all"
            >
              [ Muat Turun / Lihat ]
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}