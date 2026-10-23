'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import CountDownUpkk from '@/components/CountDownUpkk';
import { ialahAdmin } from '../lib/akses';
import PaparMarkdown from '@/components/PaparMarkdown';
import { formatTarikh, tidakDiurus, masaRelatif, tarikhKemasKini } from '../lib/tarikh';

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
  // 📖 README editor (gaya GitHub) untuk folder BBM semasa
  const [readmeEdit, setReadmeEdit] = useState(false);
  const [readmeDraf, setReadmeDraf] = useState('');
  const [simpanReadmeBusy, setSimpanReadmeBusy] = useState(false);
  const [adaUpdatedAt, setAdaUpdatedAt] = useState(false);

  const [peranan, setPeranan] = useState<string>('');
  const [isUserAdmin, setIsUserAdmin] = useState(false);

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
      setIsUserAdmin(ialahAdmin(emailUser));

      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailUser)
        .maybeSingle();

      if (profil && profil.peranan) {
        setPeranan(profil.peranan);
      } else {
        setPeranan(ialahAdmin(emailUser) ? 'Guru' : 'Murid');
      }
    }
  };

  const tarikDataRepo = async () => {
    const { data } = await supabase
      .from('rulaf_repo')
      .select('*')
      .order('is_folder', { ascending: false })
      .order('tajuk', { ascending: true });
    if (data) {
      setBahanRepo(data);
      // Kesan sama ada lajur updated_at sudah dimigrasi (tanpa memecahkan aliran lama)
      setAdaUpdatedAt(data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'updated_at'));
    }
  };

  const kemasKiniStatus = async (id: number, statusBaharu: string) => {
    if (!isUserAdmin) return alert('Hanya Admin boleh mengubah status kelulusan!');
    const { error } = await supabase
      .from('rulaf_repo')
      .update({ status: statusBaharu })
      .eq('id', id);
    if (error) alert('Ralat: ' + error.message);
    else tarikDataRepo();
  };

  const simpanSuntingBbm = async (id: number, medan: any) => {
    if (!medan.tajuk.trim()) return alert('[!] Tajuk tidak boleh kosong.');
    const muatan: any = {
      tajuk: medan.tajuk.trim(),
      topik: (medan.topik || '').trim(),
      subjek: (medan.subjek || '').trim(),
      darjah: (medan.darjah || '').trim(),
    };
    if (adaUpdatedAt) muatan.updated_at = new Date().toISOString();
    const { error } = await supabase
      .from('rulaf_repo')
      .update(muatan)
      .eq('id', id);
    if (error) alert('Ralat menyimpan suntingan: ' + error.message);
    else tarikDataRepo();
  };

  const padamItem = async (id: number, pemilikItem: string) => {    if (pemilikItem !== userEmail && !isUserAdmin) {
      return alert('⚠️ Anda hanya dibenarkan memadam bahan atau folder milik anda sendiri!');
    }
    if (!window.confirm('⚠️ Adakah anda pasti mahu memadamkan bahan ini secara kekal?')) return;
    const { error } = await supabase.from('rulaf_repo').delete().eq('id', id);
    if (error) alert('Ralat memadam kandungan: ' + error.message);
    else { alert('🗑️ Kandungan berjaya dipadam!'); tarikDataRepo(); }
  };

  const simpanReadme = async () => {
    if (currentFolderId === null) return;
    if (folderSemasaObj && folderSemasaObj.penyumbang !== userEmail && !isUserAdmin) {
      return alert('⚠️ Hanya pemilik folder atau Admin boleh menyunting README.');
    }
    setSimpanReadmeBusy(true);
    const muatanReadme: any = { readme_text: readmeDraf.trim() };
    if (adaUpdatedAt) muatanReadme.updated_at = new Date().toISOString();
    const { error } = await supabase
      .from('rulaf_repo')
      .update(muatanReadme)
      .eq('id', currentFolderId);
    setSimpanReadmeBusy(false);
    if (error) alert('Ralat menyimpan README: ' + error.message);
    else { setReadmeEdit(false); tarikDataRepo(); }
  };

  const bukaFolder = (id: number) => {
    setReadmeEdit(false);
    setFolderHistory((prev) => [...prev, currentFolderId as number].filter(x => x !== null));
    setCurrentFolderId(id);
    setSelectedDarjah(null);
    setSelectedSubjek(null);
  };

  const kembaliSatuAras = () => {
    if (selectedSubjek !== null) setSelectedSubjek(null);
    else if (selectedDarjah !== null) setSelectedDarjah(null);
    else if (currentFolderId !== null) {
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

  // 🔒 Keselamatan: kandungan 'danger' atau di bawah folder 'danger' tidak dipaparkan kepada publik.
  // Admin masih boleh melihatnya untuk tujuan moderasi.
  const adaLeluhurDisekat = (item: any): boolean => {
    let parentId = item?.parent_id;
    const dilihat = new Set<number>();
    while (parentId !== null && parentId !== undefined && !dilihat.has(parentId)) {
      dilihat.add(parentId);
      const induk = bahanRepo.find((b) => b.id === parentId);
      if (!induk) break;
      if (induk.status === 'danger') return true;
      parentId = induk.parent_id;
    }
    return false;
  };

  const bolehLihat = (item: any) =>
    isUserAdmin || (item?.status !== 'danger' && !adaLeluhurDisekat(item));

  const bahanRepoTerlihat = bahanRepo.filter(bolehLihat);

  const itemFolderSemasa = bahanRepoTerlihat.filter((item) => {
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

  const failCarian = bahanRepoTerlihat.filter(item =>
    !item.is_folder && (
      item.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.topik?.toLowerCase().includes(carianRepo.toLowerCase()) ||
      item.darjah?.toLowerCase().includes(carianRepo.toLowerCase())
    )
  );

  // 🕒 Aktiviti terkini ala GitHub: 5 fail terbaharu (ikut kemas kini/ muat naik)
  const aktivitiTerkini = [...bahanRepoTerlihat]
    .filter((i) => !i.is_folder)
    .sort((a, b) => {
      const ma = new Date(tarikhKemasKini(a) || 0).getTime();
      const mb = new Date(tarikhKemasKini(b) || 0).getTime();
      return mb - ma;
    })
    .slice(0, 5);

  const folderSemasaObj = bahanRepoTerlihat.find(f => f.id === currentFolderId);
  const readmeSemasa = folderSemasaObj?.readme_text;

  // 📅 Tarikh aktiviti terakhir (gaya GitHub) untuk folder RUR
  const aktivitiTerakhir = (item: any) => {
    const anak = bahanRepoTerlihat.filter((b) => b.parent_id === item.id);
    const masa = [tarikhKemasKini(item), ...anak.map((a) => tarikhKemasKini(a))]
      .filter(Boolean)
      .map((t) => new Date(t as string).getTime())
      .filter((t) => !Number.isNaN(t));
    return masa.length > 0 ? new Date(Math.max(...masa)).toISOString() : item.created_at;
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded shadow-md overflow-hidden">
        
        <CountDownUpkk />

        {/* Banner Navigasi Atas */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RUR :: RULAFHUB USERS REPOSITORY (PARODY AUR)</span>
          <span>{isLoggedIn ? `[ ${userEmail} ]` : '[ TETAMU ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Pusat sumber digital terbuka KAFA/SRA. Semak dan muat turun bahan BBM yang telah dikongsi oleh para guru di sini.
          </p>

          {/* Pemberitahuan Relokasi Pengurusan BBM ke Dashboard Guru */}
          {isLoggedIn && (peranan === 'Guru' || peranan === 'admin') && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded p-4 mb-6 text-xs flex flex-wrap items-center gap-2">
              <span className="text-lg">💡</span>
              <p className="text-gray-700 dark:text-gray-300 flex-1">
                <strong className="text-[#1793D1]">Nota Guru:</strong> Cipta & urus koleksi BBM anda melalui <strong>Dashboard Guru</strong> agar ruang kerja setiap guru terasing dengan selamat.
              </p>
              <Link href="/dashboard" className="bg-[#1793D1] text-white px-3 py-1.5 rounded font-bold text-[11px]">
                [ Buka Dashboard Guru ]
              </Link>
            </div>
          )}

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
                [ 🏠 Root RUR ]
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
                    simpanSuntingBbm={simpanSuntingBbm}
                  />
                ))
              )}
            </div>
          ) : currentFolderId === null ? (
            <div className="space-y-4">
              {aktivitiTerkini.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#11141b] border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm">🕒</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Aktiviti Terkini RUR</span>
                    <span className="ml-auto text-[10px] text-gray-400">ala GitHub</span>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {aktivitiTerkini.map((item) => (
                      <Link
                        key={item.id}
                        href={`/repo/bbm/${item.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1c202a] transition-colors"
                      >
                        <span className="text-base">📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-gray-800 dark:text-gray-200">{item.tajuk}</p>
                          <p className="truncate text-[10px] text-gray-500">
                            {item.subjek || 'Umum'} · {item.darjah || 'Umum'} · {item.penyumbang}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-[#1793D1]">
                          {masaRelatif(tarikhKemasKini(item))}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-xs font-bold text-gray-400 uppercase">Koleksi Utama RUR (RuLaFHub Users Repository)</h4>
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
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            📅 Dicipta {formatTarikh(item.created_at)} · ⏱️ Aktif {formatTarikh(aktivitiTerakhir(item))} · {masaRelatif(aktivitiTerakhir(item))}
                          </p>
                          {tidakDiurus(aktivitiTerakhir(item)) && (
                            <span className="inline-block mt-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 dark:border-amber-900/50">
                              ⚠️ Tidak diurus 6+ bulan
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => bukaFolder(item.id)}
                          className="text-xs text-[#1793D1] font-bold hover:underline"
                        >
                          [ Buka ➔ ]
                        </button>
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

              {/* 📖 README.md gaya GitHub — di bawah folder BBM */}
              {(() => {
                const bolehSunting = isUserAdmin || (folderSemasaObj && folderSemasaObj.penyumbang === userEmail);
                return (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#11141b] border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm">📖</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 font-mono">README.md</span>
                      <span className="ml-auto" />
                      {bolehSunting && !readmeEdit && (
                        <button
                          onClick={() => { setReadmeDraf(readmeSemasa || ''); setReadmeEdit(true); }}
                          className="text-[11px] font-bold text-[#1793D1] hover:underline"
                        >
                          {readmeSemasa ? '✏️ Sunting' : '＋ Cipta README'}
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      {readmeEdit ? (
                        <div className="space-y-2">
                          <textarea
                            rows={6}
                            value={readmeDraf}
                            onChange={(e) => setReadmeDraf(e.target.value)}
                            placeholder={'Cth:\n# Tajuk Koleksi\n## Subtajuk\n**Tebal** · *italik* · `kod`\n- Senarai ringkas\n1. Senarai bernombor\n[Lawati laman](https://contoh.com)\n> Petikan / nota penting\n---'}
                            className="w-full bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-mono"
                          />
                          <div className="flex gap-2">
                            <button onClick={simpanReadme} disabled={simpanReadmeBusy} className="bg-[#1793D1] text-white px-4 py-1.5 rounded text-[11px] font-black hover:bg-[#1272ab] disabled:opacity-50">
                              {simpanReadmeBusy ? 'Menyimpan…' : '💾 Simpan README'}
                            </button>
                            <button onClick={() => setReadmeEdit(false)} className="border border-gray-300 dark:border-gray-700 px-4 py-1.5 rounded text-[11px] font-bold text-gray-600 dark:text-gray-300">
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : readmeSemasa ? (
                        <PaparMarkdown teks={readmeSemasa} kelas="text-gray-700 dark:text-gray-300" />
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">Tiada README untuk koleksi ini{bolehSunting ? ' — klik “Cipta README” untuk menambah.' : '.'}</p>
                      )}
                    </div>
                  </div>
                );
              })()}
              
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
                    simpanSuntingBbm={simpanSuntingBbm}
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
function ItemKadBBM({ item, userEmail, isUserAdmin, kemasKiniStatus, padamItem, simpanSuntingBbm }: any) {
  const bolehUrus = isUserAdmin || (userEmail && item.penyumbang === userEmail);
  const [sunting, setSunting] = useState(false);
  const [draf, setDraf] = useState({ tajuk: item.tajuk || '', topik: item.topik || '', subjek: item.subjek || '', darjah: item.darjah || '' });
  const [simpanBusy, setSimpanBusy] = useState(false);

  const inputKecil = 'w-full bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none';

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
            <p className="text-[10px] text-gray-400 mt-0.5">
              🕒 Dikemas kini {masaRelatif(tarikhKemasKini(item))} · {formatTarikh(tarikhKemasKini(item))}
            </p>

            {bolehUrus && sunting && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-[#0F1419] border border-[#1793D1]/40 rounded space-y-2">
                <input value={draf.tajuk} onChange={(e) => setDraf({ ...draf, tajuk: e.target.value })} placeholder="Tajuk BBM" className={inputKecil} />
                <div className="grid grid-cols-3 gap-2">
                  <input value={draf.topik} onChange={(e) => setDraf({ ...draf, topik: e.target.value })} placeholder="Topik" className={inputKecil} />
                  <input value={draf.subjek} onChange={(e) => setDraf({ ...draf, subjek: e.target.value })} placeholder="Subjek" className={inputKecil} />
                  <input value={draf.darjah} onChange={(e) => setDraf({ ...draf, darjah: e.target.value })} placeholder="Darjah" className={inputKecil} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { setSimpanBusy(true); await simpanSuntingBbm(item.id, draf); setSimpanBusy(false); setSunting(false); }}
                    disabled={simpanBusy}
                    className="bg-[#1793D1] text-white px-3 py-1 rounded text-[11px] font-black hover:bg-[#1272ab] disabled:opacity-50"
                  >
                    {simpanBusy ? 'Menyimpan…' : '💾 Simpan'}
                  </button>
                  <button onClick={() => { setSunting(false); setDraf({ tajuk: item.tajuk || '', topik: item.topik || '', subjek: item.subjek || '', darjah: item.darjah || '' }); }} className="border border-gray-300 dark:border-gray-700 px-3 py-1 rounded text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Batal
                  </button>
                </div>
              </div>
            )}

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
                  onClick={() => setSunting((s) => !s)}
                  className="bg-[#1793D1]/10 text-[#1793D1] border border-[#1793D1]/40 hover:bg-[#1793D1] hover:text-white px-2.5 py-0.5 rounded text-[10px] font-bold transition-all"
                >
                  {sunting ? '✏️ Tutup' : '✏️ Sunting'}
                </button>
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