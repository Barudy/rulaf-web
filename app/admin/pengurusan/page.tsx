'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function PengurusanMuridPage() {
  const [tema, setTema] = useState('dark');
  const [kelas, setKelas] = useState('3 Murshid');
  const [bulanTahun, setBulanTahun] = useState('Ogos 2026');
  const [senaraiMurid, setSenaraiMurid] = useState<any[]>([]);
  const [borangMarkah, setBorangMarkah] = useState<any>({});
  const [isPushing, setIsPushing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const temaSediaAda = localStorage.getItem('theme') || 'dark';
    setTema(temaSediaAda);
    if (temaSediaAda === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const paparSenaraiPelajar = async () => {
    if (!kelas || !bulanTahun) return alert('[!] Ralat: Sila pilih kelas dan masukkan tarikh!');
    
    setIsLoading(true);
    setSenaraiMurid([]);
    setBorangMarkah({});

    // 1. Tarik senarai murid master secara dinamik dari table 'data_murid'
    const { data: studentsMaster, error: errorMaster } = await supabase
      .from('data_murid')
      .select('*')
      .eq('kelas_id', kelas);

    if (errorMaster) {
      alert('Ralat menarik senarai master murid: ' + errorMaster.message);
      setIsLoading(false);
      return;
    }

    if (!studentsMaster || studentsMaster.length === 0) {
      alert(`Pemberitahuan: Tiada master data murid ditemui untuk kelas "${kelas}" di dalam jadual data_murid. Sila pastikan data sudah dimuat naik.`);
      setIsLoading(false);
      return;
    }

    // 2. Tarik rekod markah sedia ada (jika ada) dari 'markah_murid'
    const { data: existingGrades, error: errorGrades } = await supabase
      .from('markah_murid')
      .select('*')
      .eq('kelas_id', kelas)
      .eq('bulan_tahun', bulanTahun);

    // 3. Gabungkan master list dengan rekod markah
    const initialBorang: any = {};
    studentsMaster.forEach((student: any) => {
      const gradeRecord = existingGrades?.find((g: any) => g.mykid === student.mykid);
      initialBorang[student.mykid] = {
        hari_hadir: gradeRecord?.hari_hadir !== undefined ? gradeRecord.hari_hadir : '',
        jumlah_hari_sekolah: gradeRecord?.jumlah_hari_sekolah !== undefined ? gradeRecord.jumlah_hari_sekolah : '',
        markah_jawi: gradeRecord?.markah_jawi !== undefined ? gradeRecord.markah_jawi : '',
        ujian_bertulis: gradeRecord?.ujian_bertulis !== undefined ? gradeRecord.ujian_bertulis : '',
        bacaan_quran: gradeRecord?.bacaan_quran || 'Iqra 1',
        hafazan: gradeRecord?.hafazan || 'Gred A',
        kerajinan_usaha: gradeRecord?.kerajinan_usaha !== undefined ? gradeRecord.kerajinan_usaha : '',
        kerjasama_kumpulan: gradeRecord?.kerjasama_kumpulan !== undefined ? gradeRecord.kerjasama_kumpulan : '',
        akhlak: gradeRecord?.akhlak !== undefined ? gradeRecord.akhlak : ''
      };
    });

    setBorangMarkah(initialBorang);
    setSenaraiMurid(studentsMaster);
    setIsLoading(false);
  };

  const handleInput = (mykid: string, field: string, value: string) => {
    setBorangMarkah((prev: any) => ({
      ...prev,
      [mykid]: {
        ...prev[mykid],
        [field]: value
      }
    }));
  };

  const pushSistem = async () => {
    if (senaraiMurid.length === 0) return alert('[!] Sila paparkan kumpulan pelajar terlebih dahulu!');
    setIsPushing(true);

    // Jalankan operasi upsert data komposit 60/40 ke Supabase
    const entries = senaraiMurid.map((student) => {
      const form = borangMarkah[student.mykid] || {};
      return {
        mykid: student.mykid,
        nama_murid: student.nama_murid,
        kelas_id: kelas,
        bulan_tahun: bulanTahun,
        hari_hadir: parseInt(form.hari_hadir) || 0,
        jumlah_hari_sekolah: parseInt(form.jumlah_hari_sekolah) || 0,
        markah_jawi: parseInt(form.markah_jawi) || 0,
        ujian_bertulis: parseInt(form.ujian_bertulis) || 0,
        bacaan_quran: form.bacaan_quran || 'Iqra 1',
        hafazan: form.hafazan || 'Gred A',
        kerajinan_usaha: parseInt(form.kerajinan_usaha) || 0,
        kerjasama_kumpulan: parseInt(form.kerjasama_kumpulan) || 0,
        akhlak: parseInt(form.akhlak) || 0,
        tahap_rulaf: borangMarkah[student.mykid].tahap_rulaf
      };
    });

    const { error } = await supabase
      .from('markah_murid')
      .upsert(entries, { onConflict: 'mykid,bulan_tahun' });

    if (error) {
      alert('Ralat menolak data ke Supabase: ' + error.message);
    } else {
      alert('🎉 Tahniah bosskur! Data rekod murid (60:40) berjaya disegerakkan (sync) ke Supabase Cloud!');
    }
    setIsPushing(false);
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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded-sm p-6 shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] transition-all duration-300">
        
        {/* Header Navigasi */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">🏫 SISTEM PENGURUSAN INSTITUSI BERSEPADU</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-[#1793D1] hover:underline font-bold">[ &lt;-- Kembali ]</Link>
          </div>
        </div>

        {/* Bar Pilihan Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-gray-100 dark:bg-[#11141b] p-6 rounded border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pilih Kelas</label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="3 Murshid">3 Murshid</option>
              <option value="5 Murshid">5 Murshid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bulan & Tahun Penggredan</label>
            <input
              type="text"
              placeholder="Contoh: Ogos 2026"
              value={bulanTahun}
              onChange={(e) => setBulanTahun(e.target.value)}
              className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={paparSenaraiPelajar}
              disabled={isLoading}
              className="w-full bg-[#1793D1] hover:bg-[#1272ab] text-[#0F1419] font-bold py-2.5 rounded text-xs transition-colors"
            >
              {isLoading ? '[ MEMUAT DATA... ]' : '[ 📊 PAPAR KUMPULAN PELAJAR ]'}
            </button>
          </div>
        </div>

        {/* Jadual Masuk Markah */}
        {senaraiMurid.length > 0 && (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
              <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase tracking-wider font-bold">
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800">Nama Pelajar</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800 w-[140px]">Hadir / Jmh Hari</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800 w-[110px]">Jawi %</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800 w-[110px]">Ujian %</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800 w-[130px]">Quran</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800 w-[130px]">Hafazan</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800">Sikap (Rjn, Kjsm, Adb) / 10</th>
                    <th className="p-3 border-b border-gray-200 dark:border-gray-800">Tahap RuLaF</th>
                  </tr>
                </thead>
                <tbody>
                  {senaraiMurid.map((m) => (
                    <tr key={m.mykid} className="hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white">
                        {m.nama_murid}
                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{m.mykid}</span>
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Hdr"
                            value={borangMarkah[m.mykid]?.hari_hadir || ''}
                            onChange={(e) => handleInput(m.mykid, 'hari_hadir', e.target.value)}
                            className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center"
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            type="number"
                            placeholder="Jmh"
                            value={borangMarkah[m.mykid]?.jumlah_hari_sekolah || ''}
                            onChange={(e) => handleInput(m.mykid, 'jumlah_hari_sekolah', e.target.value)}
                            className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center"
                          />
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <input
                          type="number"
                          placeholder="%"
                          value={borangMarkah[m.mykid]?.markah_jawi || ''}
                          onChange={(e) => handleInput(m.mykid, 'markah_jawi', e.target.value)}
                          className="w-16 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <input
                          type="number"
                          placeholder="%"
                          value={borangMarkah[m.mykid]?.ujian_bertulis || ''}
                          onChange={(e) => handleInput(m.mykid, 'ujian_bertulis', e.target.value)}
                          className="w-16 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <select
                          value={borangMarkah[m.mykid]?.bacaan_quran || 'Iqra 1'}
                          onChange={(e) => handleInput(m.mykid, 'bacaan_quran', e.target.value)}
                          className="w-full bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1"
                        >
                          <option value="Iqra 1">Iqra 1</option>
                          <option value="Iqra 2">Iqra 2</option>
                          <option value="Iqra 3">Iqra 3</option>
                          <option value="Iqra 4">Iqra 4</option>
                          <option value="Iqra 5">Iqra 5</option>
                          <option value="Iqra 6">Iqra 6</option>
                          <option value="Al-Quran">Al-Quran</option>
                        </select>
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <select
                          value={borangMarkah[m.mykid]?.hafazan || 'Gred A'}
                          onChange={(e) => handleInput(m.mykid, 'hafazan', e.target.value)}
                          className="w-full bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1"
                        >
                          <option value="Gred A">Gred A</option>
                          <option value="Gred B">Gred B</option>
                          <option value="Gred C">Gred C</option>
                          <option value="Gred D">Gred D</option>
                          <option value="Lulus">Lulus</option>
                          <option value="Gagal">Gagal</option>
                        </select>
                      </td>
                      <td className="p-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Rjn"
                            title="Kerajinan Usaha (1-10)"
                            value={borangMarkah[m.mykid]?.kerajinan_usaha || ''}
                            onChange={(e) => handleInput(m.mykid, 'kerajinan_usaha', e.target.value)}
                            className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center"
                          />
                          <input
                            type="number"
                            placeholder="Kjs"
                            title="Kerjasama Kumpulan (1-10)"
                            value={borangMarkah[m.mykid]?.kerjasama_kumpulan || ''}
                            onChange={(e) => handleInput(m.mykid, 'kerjasama_kumpulan', e.target.value)}
                            className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center"
                          />
                          <input
                            type="number"
                            placeholder="Adb"
                            title="Akhlak Adab (1-10)"
                            value={borangMarkah[m.mykid]?.akhlak || ''}
                            onChange={(e) => handleInput(m.mykid, 'akhlak', e.target.value)}
                            className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center"
                          />
                        </div>
                      </td>
                      <td>
  <select
    // 1. Tangkap nilai sedia ada atau jadikan kosong
    value={borangMarkah[m.mykid]?.tahap_rulaf || ''} 
    // 2. Tembak fungsi handleInput apabila pilihan ditukar
    onChange={(e) => handleInput(m.mykid, 'tahap_rulaf', e.target.value)}
    className="w-12 bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-1.5 py-1 text-center p-2 rounded w-full"
  >
    <option value="">- Pilih Tahap -</option>
    <option value="RuLaF Khas">RuLaF Khas</option>
    <option value="RuLaF Alif">RuLaF Alif</option>
    <option value="RuLaF Ba">RuLaF Ba</option>
    <option value="RuLaF Ta">RuLaF Ta</option>
  </select>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simpan & Segerakkan */}
            <div className="flex justify-end pt-4">
              <button
                onClick={pushSistem}
                disabled={isPushing}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg transition-colors disabled:opacity-50 text-sm"
              >
                {isPushing ? '[ PROSES MENGHANTAR DATA... ]' : '[ 📥 SEGERAKKAN (SYNC) GRED 60:40 KE SUPABASE ]'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}