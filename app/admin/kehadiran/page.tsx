'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

interface Murid {
  mykid: string;
  nama_murid: string;
  kelas_id: string;
  jantina?: string;
}

interface RekodHarian {
  id?: number;
  tarikh: string;
  mykid: string;
  subjek: string;
  status_hadir: boolean;
  status_kehadiran: 'hadir' | 'lewat' | 'sakit' | 'berkenyataan' | 'ponteng';
  tugasan_siap: number;
  catatan: string;
}

export default function AuditKehadiranPage() {
  const [tema, setTema] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Penapis Kelas & Kalendar
  const [kelas, setKelas] = useState('3 Murshid');
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState(8); // 8 = September (0-indexed: 0=Jan, 8=Sep)

  // Data Murid & Rekod
  const [senaraiMurid, setSenaraiMurid] = useState<Murid[]>([]);
  const [selectedMyKid, setSelectedMyKid] = useState<string>('');
  const [rekodBulan, setRekodBulan] = useState<RekodHarian[]>([]);
  const [isLoadingRekod, setIsLoadingRekod] = useState(false);

  // Modal Sunting Status Harian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    tarikh: string;
    status: 'hadir' | 'lewat' | 'sakit' | 'berkenyataan' | 'ponteng';
    catatan: string;
    tugasan_siap: number;
  }>({
    tarikh: '',
    status: 'hadir',
    catatan: '',
    tugasan_siap: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Dwi-Tema
  useEffect(() => {
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  // 2. Semakan Keselamatan Guru / Admin
  useEffect(() => {
    const semakAkses = async () => {
      setIsCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
      }
      setIsCheckingAuth(false);
    };
    semakAkses();
  }, []);

  // 3. Tarik Senarai Murid Mengikut Kelas
  useEffect(() => {
    const tarikMurid = async () => {
      try {
        const { data, error } = await supabase
          .from('data_murid')
          .select('mykid, nama_murid, kelas_id, jantina')
          .eq('kelas_id', kelas)
          .order('nama_murid', { ascending: true });

        if (data && data.length > 0) {
          setSenaraiMurid(data);
          setSelectedMyKid(data[0].mykid);
        } else {
          // Sandaran jika jadual data_murid belum lengkap
          setSenaraiMurid([]);
          setSelectedMyKid('');
        }
      } catch (e) {
        console.error('Ralat menarik senarai murid:', e);
      }
    };
    tarikMurid();
  }, [kelas]);

  // 4. Tarik Rekod Kehadiran Murid Dipilih bagi Bulan Terpilih
  const tarikRekodKehadiran = useCallback(async () => {
    if (!selectedMyKid) return;
    setIsLoadingRekod(true);

    const tarikhAwal = `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;
    const jumlahHariBulan = new Date(tahun, bulan + 1, 0).getDate();
    const tarikhAkhir = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(jumlahHariBulan).padStart(2, '0')}`;

    try {
      const { data, error } = await supabase
        .from('rekod_kerajinan_harian')
        .select('*')
        .eq('mykid', selectedMyKid)
        .gte('tarikh', tarikhAwal)
        .lte('tarikh', tarikhAkhir);

      if (data) {
        setRekodBulan(data as RekodHarian[]);
      } else {
        setRekodBulan([]);
      }
    } catch (e) {
      console.error(e);
      setRekodBulan([]);
    } finally {
      setIsLoadingRekod(false);
    }
  }, [selectedMyKid, tahun, bulan]);

  useEffect(() => {
    tarikRekodKehadiran();
  }, [tarikRekodKehadiran]);

  // Pemetaan Tarikh ke Rekod
  const petaRekodHarian = useMemo(() => {
    const map = new Map<string, RekodHarian>();
    rekodBulan.forEach(r => map.set(r.tarikh, r));
    return map;
  }, [rekodBulan]);

  // Pengiraan Kalendar Bulanan (Isnin hingga Ahad)
  const kalendarGrid = useMemo(() => {
    const totalDays = new Date(tahun, bulan + 1, 0).getDate();
    const firstDayIndex = (new Date(tahun, bulan, 1).getDay() + 6) % 7; // 0 = Isnin, 6 = Ahad

    const grid: ({ dayNumber: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ dayNumber: d, dateStr });
    }
    return grid;
  }, [tahun, bulan]);

  // Statistik Kehadiran Kumulatif Murid
  const statistik = useMemo(() => {
    let hadir = 0, lewat = 0, sakit = 0, berkenyataan = 0, ponteng = 0;

    rekodBulan.forEach(r => {
      const st = r.status_kehadiran || (r.status_hadir ? 'hadir' : 'ponteng');
      if (st === 'hadir') hadir++;
      else if (st === 'lewat') lewat++;
      else if (st === 'sakit') sakit++;
      else if (st === 'berkenyataan') berkenyataan++;
      else if (st === 'ponteng') ponteng++;
    });

    const totalDirekod = hadir + lewat + sakit + berkenyataan + ponteng;
    const peratusSahsiah = totalDirekod > 0 
      ? (((hadir + lewat + (sakit * 0.8) + (berkenyataan * 0.8)) / totalDirekod) * 100).toFixed(1) 
      : '0.0';

    return { hadir, lewat, sakit, berkenyataan, ponteng, totalDirekod, peratusSahsiah };
  }, [rekodBulan]);

  // Tindakan Buka Modal Edit
  const bukaModalEdit = (dateStr: string) => {
    const sediaAda = petaRekodHarian.get(dateStr);
    setModalData({
      tarikh: dateStr,
      status: sediaAda?.status_kehadiran || (sediaAda?.status_hadir ? 'hadir' : 'ponteng'),
      catatan: sediaAda?.catatan || '',
      tugasan_siap: sediaAda?.tugasan_siap ?? 2
    });
    setIsModalOpen(true);
  };

  // Simpan / Kemas Kini Rekod ke Supabase
  // Simpan / Kemas Kini Rekod ke Supabase (Mod Kebal: Update jika ada ID, Insert jika baru)
const simpanStatusKehadiran = async () => {
  if (!selectedMyKid || !modalData.tarikh) return;
  setIsSaving(true);

  const isHadirBool = modalData.status === 'hadir' || modalData.status === 'lewat';
  const sediaAda = petaRekodHarian.get(modalData.tarikh);

  try {
    let errorOperasi = null;

    if (sediaAda && sediaAda.id) {
      // 🔄 JIKA REKOD SUDAH WUJUD: Lakukan kemas kini (UPDATE) mengikut ID rekod
      const { error } = await supabase
        .from('rekod_kerajinan_harian')
        .update({
          status_hadir: isHadirBool,
          status_kehadiran: modalData.status,
          tugasan_siap: modalData.tugasan_siap,
          catatan: modalData.catatan
        })
        .eq('id', sediaAda.id);

      errorOperasi = error;
    } else {
      // ➕ JIKA HARI TERSEBUT KOSONG: Masukkan rekod baharu (INSERT)
      const { error } = await supabase
        .from('rekod_kerajinan_harian')
        .insert({
          tarikh: modalData.tarikh,
          mykid: selectedMyKid,
          subjek: 'Jawi',
          status_hadir: isHadirBool,
          status_kehadiran: modalData.status,
          tugasan_siap: modalData.tugasan_siap,
          catatan: modalData.catatan
        });

      errorOperasi = error;
    }

    if (errorOperasi) {
      alert('Ralat menyimpan rekod: ' + errorOperasi.message);
    } else {
      setIsModalOpen(false);
      tarikRekodKehadiran(); // Muat semula data kalendar serta-merta
    }
  } catch (err: any) {
    alert('Ralat: ' + err.message);
  } finally {
    setIsSaving(false);
  }
};

  // Fungsi Warna Mengikut Skim Status
  const getBadgeStyle = (status?: string) => {
    switch (status) {
      case 'hadir':
        return 'bg-emerald-500 text-white border-emerald-400';
      case 'lewat':
        return 'bg-purple-600 text-white border-purple-400';
      case 'sakit':
        return 'bg-sky-500 text-white border-sky-400';
      case 'berkenyataan':
        return 'bg-amber-500 text-black border-amber-400';
      case 'ponteng':
        return 'bg-rose-500 text-white border-rose-400';
      default:
        return 'bg-gray-200 dark:bg-gray-800 text-gray-400 border-transparent';
    }
  };

  const muridSemasa = senaraiMurid.find(m => m.mykid === selectedMyKid);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="animate-pulse text-[#1793D1]">Mengesahkan hak akses guru...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl shadow-xl overflow-hidden">
        
        {/* Banner Navigasi */}
        <div className="bg-[#1793D1] text-white px-6 py-4 flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>RULAFHUB :: KONSOL AUDIT & KALENDAR KEHADIRAN BULANAN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:underline">[ 🛠️ Panel Pentadbir ]</Link>
            <Link href="/" className="hover:underline">[ 🏠 Laman Utama ]</Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Bar Kawalan: Kelas, Bulan, Tahun & Murid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-100 dark:bg-[#11141b] p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">KELAS:</label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
              >
                <option value="3 Murshid">Darjah 3 Murshid (10 Subjek)</option>
                <option value="5 Murshid">Darjah 5 Murshid (4 Subjek)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">BULAN:</label>
              <select
                value={bulan}
                onChange={(e) => setBulan(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
              >
                {['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'].map((nm, idx) => (
                  <option key={idx} value={idx}>{nm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">TAHUN:</label>
              <select
                value={tahun}
                onChange={(e) => setTahun(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1793D1] mb-1">PILIH MURID:</label>
              <select
                value={selectedMyKid}
                onChange={(e) => setSelectedMyKid(e.target.value)}
                className="w-full bg-white dark:bg-[#171A21] border border-[#1793D1] rounded px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
              >
                {senaraiMurid.map(m => (
                  <option key={m.mykid} value={m.mykid}>
                    {m.nama_murid} ({m.mykid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kad Maklumat Murid & Ringkasan Metrik */}
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Murid Sedang Disemak</span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                  {muridSemasa?.nama_murid || 'Tiada Murid Dipilih'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                  MyKid: {selectedMyKid || '-'} | Kelas: {kelas} | Jantina: {muridSemasa?.jantina || '-'}
                </p>
              </div>

              {/* Skor Sahsiah Bulanan */}
              <div className="flex gap-4 items-center bg-gray-50 dark:bg-[#11141b] px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 block font-bold">KADAR KEHADIRAN</span>
                  <span className="text-2xl font-black text-[#1793D1]">{statistik.peratusSahsiah}%</span>
                </div>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="text-[10px] space-y-0.5 font-bold">
                  <div className="text-emerald-500">Hadir Tepat: {statistik.hadir}</div>
                  <div className="text-purple-400">Hadir Lewat: {statistik.lewat}</div>
                  <div className="text-sky-400">Sakit (MC): {statistik.sakit}</div>
                  <div className="text-amber-500">Kebenaran: {statistik.berkenyataan}</div>
                  <div className="text-rose-500">Ponteng: {statistik.ponteng}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Warna Status Kehadiran (Legend) */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-gray-50 dark:bg-[#11141b] p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="font-bold text-gray-400 text-[11px]">PETUNJUK:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-[10px]">
              Hadir (H)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-600 text-white font-bold text-[10px]">
              Lewat (L)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500 text-white font-bold text-[10px]">
              Sakit / MC (S)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[10px]">
              Berkenyataan (B)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500 text-white font-bold text-[10px]">
              Ponteng / TH
            </span>
            <span className="text-gray-400 text-[10px] ml-auto">* Klik mana-mana petak tarikh untuk menyunting status.</span>
          </div>

          {/* GRID KALENDAR AUDIT (ISNIN - AHAD) */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 py-1">
              <span>ISN</span>
              <span>SEL</span>
              <span>RAB</span>
              <span>KHA</span>
              <span>JUM</span>
              <span className="text-rose-400">SAB</span>
              <span className="text-rose-400">AHD</span>
            </div>

            {isLoadingRekod ? (
              <div className="p-12 text-center text-[#1793D1] animate-pulse font-mono text-sm">
                Menyegerakkan data rekod harian...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {kalendarGrid.map((slot, idx) => {
                  if (!slot) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-24 rounded-lg bg-gray-100/40 dark:bg-[#11141b]/30 border border-transparent"
                      />
                    );
                  }

                  const rekod = petaRekodHarian.get(slot.dateStr);
                  const status = rekod?.status_kehadiran || (rekod?.status_hadir ? 'hadir' : undefined);
                  const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);

                  return (
                    <div
                      key={slot.dateStr}
                      onClick={() => bukaModalEdit(slot.dateStr)}
                      className={`h-24 p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        status
                          ? 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#171A21] hover:scale-[1.02] shadow-sm'
                          : isWeekend
                            ? 'bg-gray-100/60 dark:bg-[#11141b]/60 border-dashed border-gray-200 dark:border-gray-800 opacity-60'
                            : 'bg-white dark:bg-[#171A21] border-gray-200 dark:border-gray-800 hover:border-[#1793D1]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold ${isWeekend ? 'text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                          {slot.dayNumber}
                        </span>

                        {status && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${getBadgeStyle(status)}`}>
                            {status === 'berkenyataan' ? 'Kebenaran' : status}
                          </span>
                        )}
                      </div>

                      {rekod ? (
                        <div className="text-[10px] text-gray-500 font-sans truncate">
                          <span className="text-[#1793D1] font-bold block">{rekod.subjek || 'Jawi'} ({rekod.tugasan_siap} siap)</span>
                          {rekod.catatan && <span className="italic truncate block">{rekod.catatan}</span>}
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-400 italic">Tiada rekod</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL SUNTING STATUS KEHADIRAN HARIAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171A21] border border-[#1793D1] max-w-md w-full rounded-xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Audit Kehadiran Harian</h3>
                <p className="text-xs text-[#1793D1] font-bold mt-0.5">{modalData.tarikh}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-500">Pilih status kehadiran rasmi murid untuk tarikh ini:</p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'hadir', label: 'Hadir Penuh (H)', color: 'bg-emerald-500' },
                  { key: 'lewat', label: 'Hadir Lewat (L)', color: 'bg-purple-600' },
                  { key: 'sakit', label: 'Sakit / MC (S)', color: 'bg-sky-500' },
                  { key: 'berkenyataan', label: 'Berkenyataan (B)', color: 'bg-amber-500 text-black' },
                  { key: 'ponteng', label: 'Ponteng / TH', color: 'bg-rose-500 col-span-2' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setModalData(prev => ({ ...prev, status: item.key as any }))}
                    className={`p-2 rounded font-bold text-center border transition-all ${
                      modalData.status === item.key
                        ? `${item.color} border-white shadow-md`
                        : 'bg-gray-100 dark:bg-[#11141b] text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">BILANGAN TUGASAN SELESAI (0 - 3):</label>
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={modalData.tugasan_siap}
                  onChange={(e) => setModalData(prev => ({ ...prev, tugasan_siap: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">CATATAN / SEBAB (JIKA SAKIT/LEWAT):</label>
                <textarea
                  rows={3}
                  placeholder="Cth: Sijil cuti sakit diserahkan / bas rosak..."
                  value={modalData.catatan}
                  onChange={(e) => setModalData(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={simpanStatusKehadiran}
                disabled={isSaving}
                className="flex-1 bg-[#1793D1] text-white py-2.5 rounded font-bold text-xs hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : '[ Simpan Status ]'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-bold text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}