'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Sesuaikan path mengikut lokasi folder 'lib' anda
import Link from 'next/link';

export default function RepositoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [carianRepo, setCarianRepo] = useState('');

  // 🎯 STATE BARU UNTUK NAVIGASI FOLDER
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
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

  useEffect(() => {
    semakUser();
    tarikDataRepo();
  }, []);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      setUserEmail(session.user.email || 'Pendidik RuLaF');
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
        parent_id: currentFolderId // Menjadikannya anak kepada folder semasa
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
    if (!tajukFolder) return alert('[!] Sila masukkan Nama Folder!');

    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukFolder,
        readme_text: readmeText,
        penyumbang: userEmail,
        is_folder: true,
        parent_id: currentFolderId // Membenarkan pembuatan sub-folder bersarang!
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
  // Hanya tunjukkan item yang mempunyai parent_id sepadan dengan folder semasa
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
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden">
        
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RULAF-HUB :: REPOSITORI BBM DIGITAL v2.0</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Selamat datang ke repositori berstruktur RuLaFHub. BBM disusun kemas di dalam folder subjek. Klik folder untuk melihat kandungan di dalamnya. Ibu bapa boleh terus muat turun risalah latihan berpandukan pautan yang dikongsi!
          </p>

          {/* BORANG SUMBANG (Hanya muncul jika log masuk) */}
          {isLoggedIn ? (
            <div className="bg-[#11141b] border border-gray-800 p-6 rounded mb-8">
              <div className="flex gap-4 mb-4 border-b border-gray-800 pb-3">
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('fail')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'fail' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-500 hover:text-white'}`}
                >
                  [ 📄 Sumbang Fail BBM ]
                </button>
                <button
                  type="button"
                  onClick={() => setJenisSumbangan('folder')}
                  className={`text-sm font-bold pb-1 transition-all ${jenisSumbangan === 'folder' ? 'text-[#1793D1] border-b-2 border-b-[#1793D1]' : 'text-gray-500 hover:text-white'}`}
                >
                  [ 📁 Cipta Folder Baru ]
                </button>
              </div>

              {jenisSumbangan === 'fail' ? (
                <form onSubmit={pushRepo}>
                  <h3 className="text-white font-bold text-sm mb-4">🚀 Sumbang BBM Baharu (Di dalam Folder Semasa)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tajuk Bahan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Latihan Jawi Imbuhan Awalan"
                        value={tajukRepo}
                        onChange={(e) => setTajukRepo(e.target.value)}
                        className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pautan BBM (Google Drive / Canva / Quizizz)</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={pautanRepo}
                        onChange={(e) => setPautanRepo(e.target.value)}
                        className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Subjek</label>
                      <select
                        value={subjekRepo}
                        onChange={(e) => setSubjekRepo(e.target.value)}
                        className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                      >
                        <option value="Jawi">Jawi</option>
                        <option value="Ibadat">Ibadat</option>
                        <option value="Bahasa Arab">Bahasa Arab</option>
                        <option value="Tauhid">Tauhid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Peringkat Kelas</label>
                      <select
                        value={darjahRepo}
                        onChange={(e) => setDarjahRepo(e.target.value)}
                        className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
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
                      <label className="block text-xs text-gray-400 mb-1">Nama Topik / Bab</label>
                      <input
                        type="text"
                        placeholder="Contoh: Hadas Besar / Gerhana"
                        value={topikRepo}
                        onChange={(e) => setTopikRepo(e.target.value)}
                        className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
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
                  <h3 className="text-white font-bold text-sm mb-4">📂 Bina Folder Baharu (Di dalam Folder Semasa)</h3>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Nama Folder</label>
                    <input
                      type="text"
                      placeholder="Contoh: Latihan RuLaF (By Ust_Ismail)"
                      value={tajukFolder}
                      onChange={(e) => setTajukFolder(e.target.value)}
                      className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Dokumentasi README (Markdown / Teks Biasa)</label>
                    <textarea
                      rows={4}
                      placeholder="Sila masukkan penerangan folder, nama topik, atau pesanan ringkas kepada guru-guru lain di sini..."
                      value={readmeText}
                      onChange={(e) => setReadmeText(e.target.value)}
                      className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono"
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
          ) : (
            <div className="bg-[#11141b] border border-gray-800 p-4 rounded mb-8 text-center text-sm">
              🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline">Log Masuk</a> untuk menyumbangkan folder atau bahan bantu mengajar baru.
            </div>
          )}

          {/* BAR CARIAN */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari folder atau fail dalam bahagian ini..."
              value={carianRepo}
              onChange={(e) => setCarianRepo(e.target.value)}
              className="w-full bg-[#11141b] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-600 text-sm"
            />
          </div>

          {/* 🎯 HEADER NAVIGASI FOLDER (BREADCRUMBS) */}
          <div className="bg-[#11141b] border border-gray-800 px-4 py-3 rounded mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button onClick={pergiKeRoot} className="text-[#1793D1] hover:underline font-bold">
                [ 🏠 Root-Repo ]
              </button>
              {folderHistory.map((histId, idx) => {
                const histObj = bahanRepo.find(f => f.id === histId);
                return (
                  <span key={histId} className="flex items-center gap-1.5">
                    <span className="text-gray-600">/</span>
                    <button onClick={() => {
                      const idxInHistory = folderHistory.indexOf(histId);
                      setFolderHistory(folderHistory.slice(0, idxInHistory));
                      setCurrentFolderId(histId);
                    }} className="text-[#1793D1] hover:underline">
                      {histObj?.tajuk || `Folder-${histId}`}
                    </button>
                  </span>
                );
              })}
              {currentFolderId !== null && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className="text-white font-bold">{folderSemasaObj?.tajuk}</span>
                </>
              )}
            </div>

            {currentFolderId !== null && (
              <button
                onClick={kembaliFolderSediaAda}
                className="text-gray-400 hover:text-white bg-gray-800 px-3 py-1 rounded border border-gray-700 hover:border-gray-500 font-bold transition-all"
              >
                [ ⬅️ Kembali ]
              </button>
            )}
          </div>

          {/* SENARAI HIERARKI REPO */}
          <div className="space-y-4">
            {repoDitapis.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Folder ini kosong. Sila tambah folder atau fail BBM di atas!</p>
            ) : (
              repoDitapis.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 border border-gray-800 rounded transition-all ${
                    item.is_folder 
                      ? 'bg-[#1a1f29]/40 hover:bg-[#1a1f29] hover:border-[#1793D1]/50 cursor-pointer' 
                      : 'bg-[#11141b] hover:border-[#1793D1]/30'
                  }`}
                  onClick={() => item.is_folder && bukaFolder(item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex items-start gap-3.5">
                      <span className="text-2xl mt-0.5 select-none">
                        {item.is_folder ? '📁' : '📄'}
                      </span>
                      <div>
                        {item.is_folder ? (
                          <button
                            type="button"
                            className="text-left font-bold text-white text-lg hover:text-[#1793D1] hover:underline focus:outline-none"
                          >
                            {item.tajuk}
                          </button>
                        ) : (
                          <h2 className="text-lg font-bold text-white mb-1">
                            {item.tajuk}
                          </h2>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          {item.is_folder ? (
                            <span>Kategori: Folder Dokumentasi | Dibuat oleh: {item.penyumbang}</span>
                          ) : (
                            <span>Subjek: {item.subjek} - {item.darjah} | Topik: {item.topik || 'Umum'} | Penyumbang: {item.penyumbang}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {!item.is_folder && (
                      <div className="sm:self-center">
                        <Link
                          href={`/repo/bbm/${item.id}`}
                          className="block text-center bg-gray-800 text-gray-200 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all"
                        >
                          [ Muat Turun / Lihat ]
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 📖 SEKSYEN AUTO README (GAYA GITHUB) */}
          {readmeSemasa && (
            <div className="mt-10 border border-gray-800 bg-[#11141b] rounded overflow-hidden">
              <div className="bg-gray-800/40 border-b border-gray-800 px-4 py-2 text-xs font-bold text-white flex items-center gap-2">
                <span>📖</span>
                <span>README.md</span>
              </div>
              <div className="p-6 text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                {readmeSemasa}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}