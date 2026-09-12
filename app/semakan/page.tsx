'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// 🎯 FUNGSI PENJANAAN TAHAP RULAF & WARNA SECARA AUTOMATIK
export function tentukanTahapRuLaF(skor: number) {
  if (skor >= 80.0) {
    return { tahap: 'RuLaF Ta', warna: 'text-emerald-500' };
  } else if (skor >= 60.0) {
    return { tahap: 'RuLaF Ba', warna: 'text-[#1793D1]' };
  } else if (skor >= 40.0) {
    return { tahap: 'RuLaF Alif', warna: 'text-amber-500' };
  } else {
    return { tahap: 'RuLaF Khas', warna: 'text-rose-500' };
  }
}

export default function SemakanIbuBapa() {
  const [carian, setCarian] = useState('');
  const [muridDitemui, setMuridDitemui] = useState<any>(null);
  const [mesejRalat, setMesejRalat] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAkaun, setLoadingAkaun] = useState(true);

  useEffect(() => {
    semakAkaunDanTarikData();
  }, []);

  // 🧮 FUNGSI PENGIRAAN SERAGAM (UNTUK LOG MASUK & CARIAN MANUAL)
  const formatDanKiraPrestasi = (dataMarkah: any) => {
    // 1. Akademik (Ujian Bertulis + Markah Jawi)
    const ujianBertulis = parseFloat(dataMarkah.ujian_bertulis) || 0;
    const markahJawi = parseFloat(dataMarkah.markah_jawi) || 0;
    const purataAkademik = ((ujianBertulis + markahJawi) / 200) * 100;

    // 2. Sahsiah Holistik (Skala 1-10 & Kehadiran)
    const akhlak = parseFloat(dataMarkah.akhlak) || 0;
    const kerajinan = parseFloat(dataMarkah.kerajinan_usaha) || 0;
    const kerjasama = parseFloat(dataMarkah.kerjasama_kumpulan) || 0;
    const hariHadir = parseFloat(dataMarkah.hari_hadir || dataMarkah.kehadiran) || 0;
    const jumlahHari = parseFloat(dataMarkah.jumlah_hari_sekolah) || 140;

    const kehadiranSkala = ((hariHadir / Math.max(jumlahHari, 1)) * 100) / 10;
    const jumlahSahsiah = akhlak + kerajinan + kerjasama + kehadiranSkala;
    const peratusSahsiah = (jumlahSahsiah / 40) * 100;

    // 3. Formula Kumulatif 60% Akademik + 40% Sahsiah
    const skorKeseluruhan = (purataAkademik * 0.6) + (peratusSahsiah * 0.4);

    // 4. Auto-Generate Tahap RuLaF berdasarkan skor
    const autoTahap = tentukanTahapRuLaF(skorKeseluruhan);

    return {
      ...dataMarkah,
      nama: dataMarkah.nama_murid,
      kelas: dataMarkah.kelas_id,
      nilai_akademik: purataAkademik.toFixed(1),
      nilai_sahsiah: peratusSahsiah.toFixed(1),
      sahsiah: `${peratusSahsiah.toFixed(1)}%`,
      bulan_tahun: dataMarkah.bulan_tahun || 'Ogos 2026',
      tahap_rulaf: autoTahap.tahap,
      warna_tahap: autoTahap.warna,
      skor_akhir: skorKeseluruhan.toFixed(2)
    };
  };

  // 🎯 SISTEM PENYELARASAN PINTU INTEGRASI (LOG MASUK MURID)
  const semakAkaunDanTarikData = async () => {
    setLoadingAkaun(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      setIsLoggedIn(true);

      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('nama, peranan, mykid')
        .eq('email', session.user.email)
        .single();

      if (profil && profil.peranan === 'Murid') {
        if (profil.mykid) {
          // 🔥 FIX: Ditambah .order('id', { ascending: false }) supaya baca rekod terkini!
          const { data: markahData, error } = await supabase
            .from('markah_murid')
            .select('*')
            .eq('mykid', profil.mykid.trim())
            .order('id', { ascending: false })
            .limit(1);

          if (markahData && markahData.length > 0) {
            setMuridDitemui(formatDanKiraPrestasi(markahData[0]));
          } else {
            setMesejRalat('Rekod markah belum di-upsert oleh guru untuk MyKid anda.');
          }
        } else {
          setMesejRalat(`Akaun anda (${profil.nama}) belum dihubungkan dengan No. MyKid.`);
        }
      }
    }
    setLoadingAkaun(false);
  };

  // 🔍 CARIAN MANUAL IBU BAPA / GUEST
  const klikSemak = async () => {
    if (!carian) {
      setMesejRalat('Sila masukkan No. MyKid anak anda.');
      return;
    }
    setMesejRalat('');
    setMuridDitemui(null);

    const { data, error } = await supabase
      .from('markah_murid')
      .select('*')
      .eq('mykid', carian.trim())
      .order('id', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      setMesejRalat('Rekod tidak dijumpai. Sila pastikan No. MyKid adalah tepat.');
    } else {
      setMuridDitemui(formatDanKiraPrestasi(data[0]));
    }
  };

  if (loadingAkaun) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="text-gray-500 dark:text-[#A5B2D9] animate-pulse">Menghubungi Ejen AI RuLaF...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-6 sm:p-10 flex flex-col items-center justify-center transition-colors duration-300 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl w-full bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        
        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Semakan Prestasi RuLaF</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
            {isLoggedIn ? "[ DASHBOARD PINTAR PELAJAR ]" : "[ PORTAL SEMAKAN GUEST / IBU BAPA ]"}
          </p>
        </div>

        {!isLoggedIn && (
          <div className="p-8 bg-gray-100 dark:bg-[#11141b] border-b border-gray-200 dark:border-gray-800 flex gap-4 transition-colors duration-300">
            <input 
              type="text" 
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && klikSemak()}
              placeholder="Masukkan No. MyKid (Cth: 000000000000)"
              className="flex-1 w-full bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded focus:outline-none focus:border-[#1793D1] transition-colors"
            />
            <button 
              onClick={klikSemak}
              className="bg-[#1793D1] hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-md transition-colors"
            >
              SEMAK
            </button>
          </div>
        )}

        {mesejRalat && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center font-bold text-sm border-b border-red-200 dark:border-red-900/50">
            [!] {mesejRalat}
          </div>
        )}

        {muridDitemui && (
          <div className="p-8">
            <h2 className="text-[#1793D1] font-bold mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
              [+] REKOD DIJUMPAI
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">NAMA MURID:</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.nama_murid || muridDitemui.nama || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">KELAS:</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.kelas_id || muridDitemui.kelas || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">BULAN / TAHUN KEMAS KINI:</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.bulan_tahun || 'Belum Ditetapkan'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">KUMPULAN RULAF:</p>
                <p className={`text-lg font-black ${muridDitemui.warna_tahap}`}>
                  {muridDitemui.tahap_rulaf}
                </p>
              </div>
            </div>

            <h3 className="text-[#1793D1] text-sm font-bold mb-4">PENCAPAIAN HOLISTIK (60/40)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Kad Gred Utama */}
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded col-span-1 sm:col-span-4 flex flex-col sm:flex-row items-center justify-between transition-colors duration-300">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">GRED PURATA KUMULATIF:</p>
                  <p className="text-xs text-gray-400">60% Akademik + 40% Sahsiah</p>
                </div>
                <p className="text-4xl font-black text-[#1793D1] mt-2 sm:mt-0">{muridDitemui.skor_akhir}%</p>
              </div>

              {/* Kad Pecahan */}
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">AKADEMIK</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.nilai_akademik}%</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">SAHSIAH</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.nilai_sahsiah}%</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">BACAAN QURAN</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.bacaan_quran || '-'}</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">UJIAN HAFAZAN</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.ujian_hafazan || muridDitemui.hafazan || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}