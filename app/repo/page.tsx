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

  // 🎯 NAVIGASI FOLDER BERSARANG
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [selectedDarjah, setSelectedDarjah] = useState<string | null>(null);
  const [selectedSubjek, setSelectedSubjek] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<number[]>([]);

  const [peranan, setPeranan] = useState<string>('');
  const [jenisSumbangan, setJenisSumbangan] = useState<'fail' | 'folder'>('fail');

  // 🗄️ PENAPIS DRAFT BOX (SEMUA VS KOLEKSI SAYA)
  const [tapisKoleksiSaya, setTapisKoleksiSaya] = useState(false);

  // State borang tambah BBM
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [pautanTerkunci, setPautanTerkunci] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');

  // State borang tambah Folder
  const [tajukFolder, setTajukFolder] = useState('');
  const [readmeText, setReadmeText] = useState('');

  // 🛠️ KAWALAN ADMIN & MODERATOR
  const adminEmails = ['admin@rulafhub.com', 'ismail@rulafhub.com', 'ust_ismail@rulafhub.com'];
  const isUserAdmin = isLoggedIn && (
    adminEmails.includes(userEmail) || 
    userEmail.startsWith('admin') || 
    userEmail.includes('ust_ismail') || 
    userEmail.includes('ismail')
  );

  useEffect(() => {
    semakUser();
    tarikDataRepo();
  }, []);

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

  // 📤 MUAT NAIK TERUS KE SUPABASE STORAGE (modul-rulaf) DENGAN KUNCI PAUTAN
  const handleUploadKeStorage = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      return alert('Saiz fail melebihi had 50MB!');
    }

    setIsUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const namaBersih = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `bbm-fail/${Date.now()}_${namaBersih}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('modul-rulaf')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modul-rulaf')
        .getPublicUrl(filePath);

      setPautanRepo(publicUrl);
      setPautanTerkunci(true); // 🔒 Kunci medan pautan untuk elak kesilapan manusia (cth: tertekan space)
      if (!tajukRepo) {
        setTajukRepo(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      alert('Gagal memuat naik fail: ' + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const resetPautanManual = () => {
    setPautanRepo('');
    setPautanTerkunci(false);
  };

  // Objek Folder Semasa & Semakan Pemilikan
  const folderSemasaObj = bahanRepo.find(f => f.id === currentFolderId);
  const isPemilikFolderSemasa = currentFolderId === null 
    ? true 
    : (folderSemasaObj?.penyumbang === userEmail || isUserAdmin);

  const pushRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Akses disekat: Hanya Guru dibenarkan memuat naik!');
    if (!isPemilikFolderSemasa) {
      return alert('[!] Akses Ditolak: Anda tidak boleh memuat naik bahan ke dalam folder guru lain!');
    }
    if (!tajukRepo || !pautanRepo) return alert('[!] Sila isi Tajuk dan sediakan fail/pautan!');

    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukRepo.trim(),
        pautan: pautanRepo.trim(),
        penyumbang: userEmail,
        subjek: subjekRepo,
        darjah: darjahRepo,
        topik: topikRepo.trim(),
        is_folder: false,
        parent_id: currentFolderId,
        status: 'approved'
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('🎉 BBM Berjaya diterbitkan ke storan repositori!');
      setTajukRepo('');
      setPautanRepo('');
      setPautanTerkunci(false);
      setTopikRepo('');
      tarikDataRepo();
    }
  };

  const buatFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru dibenarkan membina folder!');
    if (!isPemilikFolderSemasa) {
      return alert('[!] Anda tidak dibenarkan mencipta subfolder di dalam folder guru lain!');
    }
    if (!tajukFolder) return alert('[!] Sila masukkan Nama Folder!');

    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukFolder.trim(),
        readme_text: readmeText.trim(),
        penyumbang: userEmail,
        is_folder: true,
        parent_id: currentFolderId,
        status: 'approved'
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('📁 Folder koleksi peribadi anda berjaya dicipta!');
      setTajukFolder('');
      setReadmeText('');
      tarikDataRepo();
    }
  };

  const kemasKiniStatus = async (id: number, statusBaharu: string) => {
    if (!isUserAdmin) return alert('Hanya Admin boleh mengubah status kelulusan!');
    const { error } = await supabase
      .from('rulaf_repo')
      .update({ status: statusBaharu })
      .eq('id', id);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      tarikDataRepo();
    }
  };

  // Guru boleh padam fail mereka sendiri; Admin boleh padam apa sahaja
  const padamItem = async (id: number, pemilikItem: string) => {
    if (pemilikItem !== userEmail && !isUserAdmin) {
      return alert('⚠️ Anda hanya dibenarkan memadam bahan atau folder milik anda sendiri!');
    }

    if (!window.confirm('⚠️ Adakah anda pasti mahu memadamkan bahan ini secara kekal?')) return;
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

  // Penapisan koleksi mengikut mod "Semua" atau "Koleksi Saya"
  const bahanDisaring = tapisKoleksiSaya 
    ? bahanRepo.filter(item => item.penyumbang === userEmail) 
    : bahanRepo;

  const itemFolderSemasa = bahanDisaring.filter((item) => {
    if (currentFolderId === null) {
      return item.parent_id === null || item.parent_id === undefined;
    }
    return item.parent_id === currentFolderId;
  });

  const manualSubfolders = itemFolderSemasa.filter(item => item.is_folder);
  const failBbmDalamFolder = itemFolderSemasa.filter(item => !item.is_folder);

  const senaraiDarjahUnik = Array.from(new Set(failBbmDalamFolder.map(f => f.darjah || 'Umum'))).sort();
  const senaraiSubjekUnik = Array.from(
    new Set(
      failBbmDalamFolder
        .filter(f => (f.darjah || 'Umum') === selectedDarjah)
        .map(f => f.subjek || 'Umum')
    )
  ).sort();

  const senaraiFailDipaparkan = failBbmDalamFolder.filter(f => {
    const padanDarjah = (f.darjah || 'Umum') === selectedDarjah;
    const padanSubjek = (f.subjek || 'Umum') === selectedSubjek;
    return padanDarjah && padanSubjek;
  });

  const failCarian = bahanDisaring.filter(item =>
    !item.is_folder && (
      item.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.topik?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.darjah?.toLowerCase().includes(carianRepo.toLowerCase())
    )
  );

  const readmeSemasa = folderSemasaObj?.readme_text;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded shadow-md overflow-hidden">
        
        <CountDownUpkk />

        {/* Banner Navigasi Atas */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RULAF-HUB :: REPOSITORI KANDUNGAN & DRAFT BOX GURU</span>
          <span>{isLoggedIn ? `[ ${userEmail} ]` : '[ TETAMU ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Pusat sumber digital terbuka KAFA/SRA. Guru boleh memuat naik fail fizikal terus ke pelayan awan peribadi atau berkongsi bahan ke repositori umum.
          </p>

          {/* TAB PENAPIS RUANG KERJA (DRAFT BOX) */}
          {isLoggedIn && peranan === 'Guru' && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setTapisKoleksiSaya(false); pergiKeRoot(); }}
                className={`px-4 py-2 rounded text-xs font-bold transition-all border ${!tapisKoleksiSaya ? 'bg-[#1793D1] text-white border-[#1793D1]' : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-700'}`}
              >
                🌐 Semua Koleksi Awam
              </button>
              <button
                type="button"
                onClick={() => { setTapisKoleksiSaya(true); pergiKeRoot(); }}
                className={`px-4 py-2 rounded text-xs font-bold transition-all border ${tapisKoleksiSaya ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-700'}`}
              >
                🗄️ Draft Box & Koleksi Saya ({bahanRepo.filter(b => b.penyumbang === userEmail).length})
              </button>
            </div>
          )}

          {/* BORANG SUMBANGAN GURU (DENGAN KAWALAN PEMILIKAN FOLDER) */}
          {isLoggedIn && peranan === 'Guru' ? (
            !isPemilikFolderSemasa ? (
              /* PEMBERITAHUAN JIKA MASUK FOLDER GURU LAIN */
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 p-4 rounded mb-6 text-xs flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400">Mod Baca Sahaja (Folder Milik: {folderSemasaObj?.penyumbang})</p>
                  <p className="text-gray-500 mt-0.5">Anda tidak dibenarkan memuat naik fail atau menyunting folder milik pendidik lain.</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8">
                <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setJenisSumbangan('fail')}
                    className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'fail' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400'}`}
                  >
                    [ 📄 Muat Naik Fail BBM ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisSumbangan('folder')}
                    className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'folder' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400'}`}
                  >
                    [ 📁 Cipta Koleksi / Folder Sendiri ]
                  </button>
                </div>

                {jenisSumbangan === 'fail' ? (
                  <form onSubmit={pushRepo} className="space-y-4">
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm">
                      🚀 Terbit Fail ke: <span className="text-[#1793D1]">{folderSemasaObj?.tajuk || 'Root Repositori Peribadi'}</span>
                    </h3>

                    {/* MODUL UPLOAD STORAGE modul-rulaf */}
                    <div className="p-3 bg-blue-50/50 dark:bg-[#1793D1]/5 border border-[#1793D1]/30 rounded space-y-2">
                      <label className="block text-xs font-bold text-[#1793D1]">
                        📤 Muat Naik Dokumen / PDF Terus ke Storan Awan (modul-rulaf)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.zip"
                        disabled={isUploadingFile}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadKeStorage(e.target.files[0]);
                          }
                        }}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#1793D1] file:text-white hover:file:opacity-80"
                      />
                      {isUploadingFile && (
                        <p className="text-xs text-orange-500 animate-pulse font-bold">Sedang memuat naik fail ke storan awan...</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tajuk Bahan</label>
                        <input
                          type="text"
                          required
                          placeholder="Cth: Latihan Kata Pinjaman Bahasa Arab"
                          value={tajukRepo}
                          onChange={(e) => setTajukRepo(e.target.value)}
                          className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500">Pautan Fail BBM</label>
                          {pautanTerkunci && (
                            <button
                              type="button"
                              onClick={resetPautanManual}
                              className="text-[10px] text-red-500 hover:underline font-bold"
                            >
                              [ Buka Kunci / Tukar Pautan ]
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          readOnly={pautanTerkunci}
                          placeholder="Pautan terisi automatik selepas muat naik"
                          value={pautanRepo}
                          onChange={(e) => setPautanRepo(e.target.value)}
                          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors ${pautanTerkunci ? 'bg-gray-100 dark:bg-gray-800/80 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-mono cursor-not-allowed' : 'bg-white dark:bg-[#171A21] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#1793D1]'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <label className="block text-xs text-gray-500 mb-1">Topik / Bab</label>
                        <input
                          type="text"
                          placeholder="Cth: Syarat Wajib Solat"
                          value={topikRepo}
                          onChange={(e) => setTopikRepo(e.target.value)}
                          className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingFile}
                      className="bg-[#1793D1] text-[#0F1419] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#1272ab] transition-colors disabled:opacity-50"
                    >
                      [ + Sahkan & Terbitkan BBM ]
                    </button>
                  </form>
                ) : (
                  <form onSubmit={buatFolder} className="space-y-4">
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm">📁 Cipta Koleksi Baharu</h3>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nama Folder Koleksi</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Modul Intensif Jawi Ustaz Ismail"
                        value={tajukFolder}
                        onChange={(e) => setTajukFolder(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nota Penerangan (README)</label>
                      <textarea
                        rows={3}
                        placeholder="Tulis penerangan ringkas mengenai silibus atau objektif koleksi ini..."
                        value={readmeText}
                        onChange={(e) => setReadmeText(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#1793D1] text-[#0F1419] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#1272ab] transition-colors"
                    >
                      [ Cipta Folder Koleksi ]
                    </button>
                  </form>
                )}
              </div>
            )
          ) : null}

          {/* BAR CARIAN */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari tajuk BBM, subjek, atau darjah..."
              value={carianRepo}
              onChange={(e) => setCarianRepo(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none text-sm"
            />
          </div>

          {/* BREADCRUMBS NAVIGASI */}
          <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={pergiKeRoot} className="text-[#1793D1] hover:underline font-bold">
                [ 🏠 {tapisKoleksiSaya ? 'Draft Box Saya' : 'Root Repositori'} ]
              </button>

              {currentFolderId !== null && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => { setSelectedDarjah(null); setSelectedSubjek(null); }}
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

          {/* KAWASAN SENARAI BAHAN */}
          {carianRepo.trim() !== '' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Hasil Carian: "{carianRepo}"</h4>
              {failCarian.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">Tiada bahan ditemui.</p>
              ) : (
                failCarian.map(item => (
                  <ItemKadBBM 
                    key={item.id} 
                    item={item} 
                    userEmail={userEmail}
                    isUserAdmin={isUserAdmin} 
                    kemasKiniStatus={kemasKiniStatus} 
                    padamItem={padamItem} 
                  />
                ))
              )}
            </div>
          ) : currentFolderId === null ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">
                {tapisKoleksiSaya ? 'Koleksi & Folder Milik Saya' : 'Koleksi Utama Repositori'}
              </h4>
              {itemFolderSemasa.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">Tiada koleksi ditemui.</p>
              ) : (
                itemFolderSemasa.map((item) => (
                  item.is_folder ? (
                    <div
                      key={item.id}
                      className="p-5 border rounded bg-gray-100/70 dark:bg-[#1a1f29]/50 hover:bg-gray-200 dark:hover:bg-[#1a1f29] border-gray-200 dark:border-gray-800 hover:border-[#1793D1] flex justify-between items-center transition-all"
                    >
                      <div 
                        onClick={() => bukaFolder(item.id)}
                        className="flex items-center gap-3.5 flex-1 cursor-pointer"
                      >
                        <span className="text-3xl">📁</span>
                        <div>
                          <h3 className="font-bold text-base text-gray-900 dark:text-white">{item.tajuk}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Pemilik: {item.penyumbang}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => bukaFolder(item.id)}
                          className="text-xs text-[#1793D1] font-bold hover:underline"
                        >
                          [ Buka ➔ ]
                        </button>
                        {(item.penyumbang === userEmail || isUserAdmin) && (
                          <button
                            onClick={() => padamItem(item.id, item.penyumbang)}
                            className="text-xs text-red-500 hover:underline font-bold"
                          >
                            [ Padam ]
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <ItemKadBBM 
                      key={item.id} 
                      item={item} 
                      userEmail={userEmail}
                      isUserAdmin={isUserAdmin} 
                      kemasKiniStatus={kemasKiniStatus} 
                      padamItem={padamItem} 
                    />
                  )
                ))
              )}
            </div>
          ) : selectedDarjah === null ? (
            <div className="space-y-6">
              {readmeSemasa && (
                <div className="border border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-[#11141b] rounded p-4 text-xs">
                  <span className="text-gray-400 font-bold block mb-1">📋 MAKLUMAT KOLEKSI:</span>
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{readmeSemasa}</p>
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
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                PILIH SUBJEK BAGI {selectedDarjah?.toUpperCase()}:
              </h4>
              {senaraiSubjekUnik.map(subjek => {
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
                        <span className="text-[11px] text-gray-400">{bilangan} bahan</span>
                      </div>
                    </div>
                    <span className="text-xs text-amber-500 font-bold">Buka Subjek ➔</span>
                  </div>
                );
              })}
            </div>
          ) : (
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
                  <ItemKadBBM 
                    key={item.id} 
                    item={item} 
                    userEmail={userEmail}
                    isUserAdmin={isUserAdmin} 
                    kemasKiniStatus={kemasKiniStatus} 
                    padamItem={padamItem} 
                  />
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// 📦 KOMPONEN KAD FAIL DENGAN HAK CIPTA PEMADAMAN PENYUMBANG
function ItemKadBBM({ item, userEmail, isUserAdmin, kemasKiniStatus, padamItem }: any) {
  const bolehUrus = isUserAdmin || (userEmail && item.penyumbang === userEmail);

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
            </div>

            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">{item.tajuk}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Topik: <span className="text-gray-700 dark:text-gray-300 font-semibold">{item.topik || 'Umum'}</span> | Penyumbang: {item.penyumbang}
            </p>

            {/* Kawalan Pemilik & Admin */}
            {bolehUrus && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
                {isUserAdmin && (
                  <>
                    <button
                      onClick={() => kemasKiniStatus(item.id, 'approved')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white"
                    >
                      Lulus
                    </button>
                    <button
                      onClick={() => kemasKiniStatus(item.id, 'danger')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white"
                    >
                      Bahaya
                    </button>
                  </>
                )}
                <button
                  onClick={() => padamItem(item.id, item.penyumbang)}
                  className="ml-auto bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white px-2.5 py-0.5 rounded text-[10px] font-bold transition-all"
                >
                  🗑️ Padam Bahan
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
              [ Buka / Muat Turun ]
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}