'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Sesuaikan path mengikut lokasi folder 'lib' anda
import Link from 'next/link';

export default function RepositoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [carianRepo, setCarianRepo] = useState('');

  // 🎯 STATE UNTUK NAVIGASI FOLDER (FASA 2)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [peranan, setPeranan] = useState<string>(''); // 'Guru' atau 'Murid'
  const [folderHistory, setFolderHistory] = useState<number[]>([]); // Untuk butang 'Back'

  // State untuk menentukan jenis sumbangan (Fail vs Folder)
  const [jenisSumbangan, setJenisSumbangan] = useState<'fail' | 'folder'>('fail');

  // State borang tambah BBM (Fail)
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');

  // State borang tambah Folder
  const [tajukFolder, setTajukFolder] = useState('');
  const [readmeText, setReadmeText] = useState('');

  // 🛠️ JALUR KESELAMATAN & MODERATOR (V4)
  const adminEmails = ['admin@rulafhub.com', 'ismail@rulafhub.com', 'ust_ismail@rulafhub.com'];
  const isUserAdmin = isLoggedIn && (
    adminEmails.includes(userEmail) || 
    userEmail.startsWith('admin') || 
    userEmail.includes('ust_ismail') || 
    userEmail.includes('ismail')
  );

  // Fungsi Kemas Kini Status (Lulus / Bahaya / Ditinggalkan)
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

  // Fungsi Padam Kandungan Secara Kekal (Hak Moderator)
  const padamItem = async (id: number) => {
    if (!window.confirm('⚠️ AMARAN: Adakah anda pasti mahu memadam kandungan ini secara kekal daripada sistem?')) return;
    const { error } = await supabase
      .from('rulaf_repo')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ralat memadam kandungan: ' + error.message);
    } else {
      alert('🗑️ Kandungan berjaya dipadam daripada pangkalan data!');
      tarikDataRepo();
    }
  };

  useEffect(() => {
    semakUser();
    tarikDataRepo();
  }, []);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      const emailUser = session.user.email || 'Pendidik RuLaF';
      setUserEmail(emailUser);

      // 🔍 Tarik peranan pengguna dari jadual profil_pengguna di Supabase
      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailUser)
        .maybeSingle();

      if (profil && profil.peranan) {
        setPeranan(profil.peranan);
      } else {
        // Fallback automatik jika tiada rekod dalam profil_pengguna
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
      .order('is_folder', { ascending: false }) // Tunjukkan folder di atas dahulu
      .order('tajuk', { ascending: true });
    if (data) setBahanRepo(data);
  };

  // 📝 Fungsi Cipta Fail BBM Baharu
  const pushRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru sahaja dibenarkan memuat naik BBM!');
    if (!tajukRepo || !pautanRepo) return alert('[!] Sila isi Tajuk dan Pautan Google Drive!');
    
    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukRepo,
        pautan: pautanRepo,
        penyumbang: userEmail,
        subjek: subjekRepo,
        darjah: darjahRepo,
        topik: topikRepo,
        is_folder: false,
        parent_id: currentFolderId, // Menjadikannya anak kepada folder semasa
        status: 'approved' // Lalai: diluluskan secara selamat
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('🎉 BBM Berjaya disumbangkan ke folder semasa!');
      setTajukRepo('');
      setPautanRepo('');
      setTopikRepo('');
      tarikDataRepo();
    }
  };

  // 📁 Fungsi Cipta Folder Baharu
  const buatFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru sahaja dibenarkan membina folder!');
    if (!tajukFolder) return alert('[!] Sila masukkan Nama Folder!');

    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukFolder,
        readme_text: readmeText,
        penyumbang: userEmail,
        is_folder: true,
        parent_id: currentFolderId, // Membenarkan pembuatan sub-folder bersarang!
        status: 'approved' // Lalai: diluluskan secara selamat
      }
    ]);

    if (error) {
      alert('Ralat membuat folder: ' + error.message);
    } else {
      alert('📁 Folder baharu berjaya dicipta!');
      setTajukFolder('');
      setReadmeText('');
      tarikDataRepo();
    }
  };

  // 🎯 FUNGSI NAVIGASI
  const bukaFolder = (id: number) => {
    setFolderHistory((prev) => [...prev, currentFolderId as number].filter(x => x !== null));
    setCurrentFolderId(id);
  };

  const kembaliFolderSediaAda = () => {
    const sejarahBaru = [...folderHistory];
    const folderSebelum = sejarahBaru.pop();
    setFolderHistory(sejarahBaru);
    setCurrentFolderId(folderSebelum !== undefined ? folderSebelum : null);
  };

  const pergiKeRoot = () => {
    setFolderHistory([]);
    setCurrentFolderId(null);
  };

  // 🔍 TAPIS DAN PAPAR KANDUNGAN IKUT HIERARKI FOLDER
  const itemFolderSemasa = bahanRepo.filter((item) => {
    if (currentFolderId === null) {
      return item.parent_id === null || item.parent_id === undefined;
    }
    return item.parent_id === currentFolderId;
  });

  // Tapisan carian global
  const repoDitapis = itemFolderSemasa.filter(item =>
    item.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
    item.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
    item.topik?.toLowerCase().includes(carianRepo.toLowerCase())
  );

  // Cari fail README.md untuk folder semasa jika ada
  const folderSemasaObj = bahanRepo.find(f => f.id === currentFolderId);
  const readmeSemasa = folderSemasaObj?.readme_text;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RULAF-HUB :: REPOSITORI BBM DIGITAL v2.0</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Selamat datang ke repositori berstruktur RuLaFHub. BBM disusun kemas di dalam folder subjek. Klik folder untuk melihat kandungan di dalamnya. Ibu bapa boleh terus muat turun risalah latihan berpandukan pautan yang dikongsi!
          </p>

          {/* BORANG SUMBANG (Hanya muncul jika log masuk & adalah GURU) */}
          {isLoggedIn && peranan === 'Guru' ? (
            <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8 transition-colors duration-300">
              <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('fail')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'fail' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}
                >
                  [ 📄 Sumbang Fail BBM ]
                </button>
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('folder')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'folder' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'}`}
                >
                  [ 📁 Cipta Folder Baru ]
                </button>
              </div>

              {jenisSumbangan === 'fail' ? (
                <form onSubmit={pushRepo}>
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">🚀 Sumbang BBM Baharu (Di dalam Folder Semasa)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tajuk Bahan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Latihan Jawi Imbuhan Awalan"
                        value={tajukRepo}
                        onChange={(e) => setTajukRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pautan BBM (Google Drive / Canva / Quizizz)</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={pautanRepo}
                        onChange={(e) => setPautanRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Subjek</label>
                      <select
                        value={subjekRepo}
                        onChange={(e) => setSubjekRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      >
                        <option value="Jawi">Jawi</option>
                        <option value="Ibadat">Ibadat</option>
                        <option value="Bahasa Arab">Bahasa Arab</option>
                        <option value="Tauhid">Tauhid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Peringkat Kelas</label>
                      <select
                        value={darjahRepo}
                        onChange={(e) => setDarjahRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      >
                        <option value="Darjah 1">Darjah 1</option>
                        <option value="Darjah 2">Darjah 2</option>
                        <option value="Darjah 3">Darjah 3</option>
                        <option value="Darjah 4">Darjah 4</option>
                        <option value="Darjah 5">Darjah 5</option>
                        <option value="Darjah 6">Darjah 6</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Topik / Bab</label>
                      <input
                        type="text"
                        placeholder="Contoh: Hadas Besar / Gerhana"
                        value={topikRepo}
                        onChange={(e) => setTopikRepo(e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
                  >
                    [ + Terbitkan BBM ]
                  </button>
                </form>
              ) : (
                <form onSubmit={buatFolder}>
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">📂 Bina Folder Baharu (Di dalam Folder Semasa)</h3>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Folder</label>
                    <input
                      type="text"
                      placeholder="Contoh: Latihan RuLaF (By Ust_Ismail)"
                      value={tajukFolder}
                      onChange={(e) => setTajukFolder(e.target.value)}
                      className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dokumentasi README (Markdown / Teks Biasa)</label>
                    <textarea
                      rows={4}
                      placeholder="Sila masukkan penerangan folder, nama topik, atau pesanan ringkas kepada guru-guru lain di sini..."
                      value={readmeText}
                      onChange={(e) => setReadmeText(e.target.value)}
                      className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
                  >
                    [ Cipta Folder Baru ]
                  </button>
                </form>
              )}
            </div>
          ) : isLoggedIn && peranan === 'Murid' ? (
            <div className="bg-blue-100/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded mb-8 text-center text-sm text-blue-800 dark:text-blue-300 font-sans transition-colors duration-300">
              🎓 Anda telah log masuk sebagai <strong>Murid ({userEmail})</strong> :: Akses Terhad (Muat Turun & Navigasi Repositori Sahaja)
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded mb-8 text-center text-sm transition-colors duration-300">
              🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline font-bold">Log Masuk</a> sebagai Guru untuk menyumbangkan folder atau bahan bantu mengajar baru.
            </div>
          )}

          {/* BAR CARIAN */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari folder atau fail dalam bahagian ini..."
              value={carianRepo}
              onChange={(e) => setCarianRepo(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-500 text-sm transition-colors duration-300"
            />
          </div>

          {/* 🎯 HEADER NAVIGASI FOLDER (BREADCRUMBS) */}
          <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded mb-6 flex flex-wrap justify-between items-center gap-3 text-xs transition-colors duration-300">
            <div className="flex items-center gap-2">
              <button onClick={pergiKeRoot} className="text-[#1793D1] hover:underline font-bold">
                [ 🏠 Root-Repo ]
              </button>
              {folderHistory.map((histId, idx) => {
                const histObj = bahanRepo.find(f => f.id === histId);
                return (
                  <span key={histId} className="flex items-center gap-1.5">
                    <span className="text-gray-400 dark:text-gray-600">/</span>
                    <button onClick={() => {
                      const idxInHistory = folderHistory.indexOf(histId);
                      setFolderHistory(folderHistory.slice(0, idxInHistory));
                      setCurrentFolderId(histId);
                    }} className="text-[#1793D1] hover:underline font-bold">
                      {histObj?.tajuk || `Folder-${histId}`}
                    </button>
                  </span>
                );
              })}
              {currentFolderId !== null && (
                <>
                  <span className="text-gray-400 dark:text-gray-600">/</span>
                  <span className="text-gray-900 dark:text-white font-bold">{folderSemasaObj?.tajuk}</span>
                </>
              )}
            </div>

            {currentFolderId !== null && (
              <button
                onClick={kembaliFolderSediaAda}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-bold transition-all"
              >
                [ ⬅️ Kembali ]
              </button>
            )}
          </div>

          {/* SENARAI HIERARKI REPO */}
          <div className="space-y-4">
            {repoDitapis.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-10">Folder ini kosong. Sila tambah folder atau fail BBM di atas!</p>
            ) : (
              repoDitapis.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 border rounded transition-all duration-300 ${
                    item.is_folder 
                      ? 'bg-gray-100/70 dark:bg-[#1a1f29]/40 hover:bg-gray-200 dark:hover:bg-[#1a1f29] border-gray-200 dark:border-gray-800 hover:border-[#1793D1]/50 dark:hover:border-[#1793D1]/50 cursor-pointer' 
                      : 'bg-gray-100/40 dark:bg-[#11141b]/60 border-gray-200 dark:border-gray-800 hover:border-[#1793D1]/30 dark:hover:border-[#1793D1]/30'
                  }`}
                  onClick={() => item.is_folder && bukaFolder(item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex items-start gap-3.5">
                      <span className="text-2xl mt-0.5 select-none">
                        {item.is_folder ? '📁' : '📄'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
                            {item.subjek} - {item.darjah}
                          </span>
                          
                          {/* 🔹 PENUNJUK STATUS PERAKUAN MODERASI (TICK BIRU / DANGER / ABANDONED) */}
                          {(!item.status || item.status === 'approved') && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-blue-200 dark:border-blue-900/50">
                              🔹 Approved
                            </span>
                          )}
                          {item.status === 'danger' && (
                            <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-red-200 dark:border-red-900/50">
                              ⚠️ Danger (Blocked)
                            </span>
                          )}
                          {item.status === 'abandoned' && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-amber-200 dark:border-amber-900/50">
                              ⚠️ Abandoned
                            </span>
                          )}
                        </div>

                        {item.is_folder ? (
                          <button
                            type="button"
                            className="text-left font-bold text-gray-900 dark:text-white text-lg hover:text-[#1793D1] hover:underline focus:outline-none"
                          >
                            {item.tajuk}
                          </button>
                        ) : (
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {item.tajuk}
                          </h2>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.is_folder ? (
                            <span>Kategori: Folder Dokumentasi | Dibuat oleh: {item.penyumbang}</span>
                          ) : (
                            <span>Subjek: {item.subjek} - {item.darjah} | Topik: {item.topik || 'Umum'} | Penyumbang: {item.penyumbang}</span>
                          )}
                        </p>

                        {/* 🛠️ PANEL KAWALAN MODERATOR (HAK ADMIN SEKAT & PADAM KANDUNGAN) */}
                        {isUserAdmin && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">🛠️ Kawalan:</span>
                            <button
                              onClick={() => kemasKiniStatus(item.id, 'approved')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${(!item.status || item.status === 'approved') ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}`}
                            >
                              Lulus
                            </button>
                            <button
                              onClick={() => kemasKiniStatus(item.id, 'danger')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${item.status === 'danger' ? 'bg-red-600 text-white border-red-600' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:text-red-500 dark:hover:text-red-400'}`}
                            >
                              Bahaya (Sekat)
                            </button>
                            <button
                              onClick={() => kemasKiniStatus(item.id, 'abandoned')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${item.status === 'abandoned' ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:text-amber-500 dark:hover:text-amber-400'}`}
                            >
                              Tinggalkan
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

                    {!item.is_folder && (
                      <div className="sm:self-center" onClick={(e) => e.stopPropagation()}>
                        {item.status === 'danger' ? (
                          <span className="block text-center bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs rounded font-bold uppercase select-none animate-pulse">
                            🚫 Pautan Disekat
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
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 📖 SEKSYEN AUTO README (GAYA GITHUB) */}
          {readmeSemasa && (
            <div className="mt-10 border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#11141b] rounded overflow-hidden transition-colors duration-300">
              <div className="bg-gray-200/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-white flex items-center gap-2">
                <span>📖</span>
                <span>README.md</span>
              </div>
              <div className="p-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                {readmeSemasa}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
