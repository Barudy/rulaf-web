'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SemakanIbuBapa() {
  const [carian, setCarian] = useState('');
  const [muridDitemui, setMuridDitemui] = useState<any>(null);
  const [mesejRalat, setMesejRalat] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAkaun, setLoadingAkaun] = useState(true);

  useEffect(() => {
    semakAkaunDanTarikData();
  }, []);

  // 🎯 SISTEM PENYELARASAN PINTU INTEGRASI (MYKID LINKING)
  const semakAkaunDanTarikData = async () => {
    setLoadingAkaun(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setIsLoggedIn(true);
      
      // 1. Tarik profil pengguna berserta lajur 'mykid' yang telah dilinkkan
      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('nama, peranan, mykid') // ✅ PENTING: Menarik lajur 'mykid' terus dari profil pengguna
        .eq('email', session.user.email)
        .single();

      if (profil && profil.peranan === 'Murid') {
        if (profil.mykid) {
          // 2. Jika mykid wujud pada akaun murid, tarik markah secara AUTOMATIK & TEPAT!
          const { data: markahData, error } = await supabase
            .from('markah_murid')
            .select('*')
            .eq('mykid', profil.mykid) // ✅ MENCARI MENGGUNAKAN INDEKS UNIK MYKID (Sifar Ralat Nama!)
            .limit(1);

          if (markahData && markahData.length > 0) {
            prosesDataPaparan(markahData[0]);
          } else {
            setMesejRalat('Rekod markah belum di-upsert oleh guru untuk MyKid anda.');
          }
        } else {
          setMesejRalat(`Akaun anda (${profil.nama}) belum dihubungkan dengan No. MyKid. Sila hubungi pentadbir sekolah.`);
        }
      }
    }
    setLoadingAkaun(false);
  };

  // Fungsi Carian Manual (Untuk Tetamu / Ibu Bapa belum log masuk)
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
      .eq('mykid', carian)
      .order('id', { ascending: false }) 
      .limit(1);

    if (error || !data || data.length === 0) {
      setMesejRalat('Rekod tidak dijumpai. Sila pastikan No. MyKid adalah tepat.');
    } else {
      const dataMarkah = data[0];
      
      // --- 1. PENGIRAAN MARKAH AKADEMIK (JAWI & UJIAN) ---
      const ujianBertulis = parseFloat(dataMarkah.ujian_bertulis) || 0;
      const markahJawi = parseFloat(dataMarkah.markah_jawi) || 0;
      const purataAkademik = ((ujianBertulis + markahJawi) / 200) * 100; 
      
      // --- 2. PENGIRAAN SAHSIAH HOLISTIK (SKALA 1-10) ---
      const akhlak = parseFloat(dataMarkah.akhlak) || 0; 
      const kerajinan = parseFloat(dataMarkah.kerajinan_usaha) || 0; 
      const kerjasama = parseFloat(dataMarkah.kerjasama_kumpulan) || 0;
      
      // [+] NAMA LAJUR DIBETULKAN (hari_hadir & jumlah_hari_sekolah)
      const hariHadir = parseFloat(dataMarkah.hari_hadir) || 0;
      const jumlahHari = parseFloat(dataMarkah.jumlah_hari_sekolah) || 140; 
      
      const kehadiranSkala = ((hariHadir / Math.max(jumlahHari, 1)) * 100) / 10;
      const jumlahSahsiah = akhlak + kerajinan + kerjasama + kehadiranSkala; 
      const peratusSahsiah = (jumlahSahsiah / 40) * 100;
      
      // --- 3. FORMULA GRED PURATA KUMULATIF (60/40) ---
      const skorKeseluruhan = (purataAkademik * 0.6) + (peratusSahsiah * 0.4);
      
      // --- 4. PENYELARASAN DATA UNTUK PAPARAN UI ---
      setMuridDitemui({
        ...dataMarkah,
        nama: dataMarkah.nama_murid, 
        kelas: dataMarkah.kelas_id,  
        
        // [+] STATE BAHARU UNTUK PAPARAN AKADEMIK
        nilai_akademik: `${purataAkademik.toFixed(1)}`,
        
        // Menggunakan 1 titik perpuluhan untuk ketepatan (Contoh: 77.5%)
        sahsiah: `${peratusSahsiah.toFixed(1)}%`,
        nilai_sahsiah: peratusSahsiah.toFixed(1), 
        skala_sahsiah_10: (jumlahSahsiah / 4).toFixed(1),
        
        bulan_tahun: 'Ogos 2026',
        tahap_rulaf: dataMarkah.tahap_rulaf || 'Belum Ditetapkan',
        
        skor_akhir: skorKeseluruhan.toFixed(2)
      });
    }
};

  const prosesDataPaparan = (dataMarkah: any) => {
    // 1. Ambil markah Jawi
    const akademik = parseFloat(dataMarkah.markah_jawi) || 0;
    
    // 2. TUKAR KEMBALI KEPADA 'kehadiran' (sebab data disimpan dalam lajur kehadiran)
    const hariHadir = parseFloat(dataMarkah.kehadiran) || 0; 
    
    // Tetapkan jumlah hari sekolah secara manual (Contoh: 140 hari). 
    // Sila ubah nilai 140 ini mengikut jumlah hari persekolahan sebenar.
    const jumlahHari = 140; 
    
    // 3. Kira Peratus Sahsiah
    const peratusSahsiah = (hariHadir / jumlahHari) * 100;
    
    // 4. Formula 60/40 (Gred Purata Kumulatif)
    const skorKeseluruhan = (akademik * 0.6) + (peratusSahsiah * 0.4);
    
    setMuridDitemui({
      ...dataMarkah,
      // Hantar peratusan sahsiah yang dikira ke UI
      nilai_sahsiah: `${peratusSahsiah.toFixed(0)}%`, 
      skor_akhir: `${skorKeseluruhan.toFixed(2)}`
    });
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

        {/* Sembunyikan borang carian jika murid telah log masuk */}
        {!isLoggedIn && (
          <div className="p-8 bg-gray-100 dark:bg-[#11141b] border-b border-gray-200 dark:border-gray-800 flex gap-4 transition-colors duration-300">
            <input 
              type="text" 
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Masukkan No. MyKid (Cth: 000000000000)"
              className="flex-1 bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded focus:outline-none focus:border-[#1793D1] transition-colors"
            />
            <button 
              onClick={klikSemak}
              className="w-full bg-[#1793D1] sm:w-auto hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-md transition-colors"
            >
              [ SEMAK ]
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
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.nama_murid || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">KELAS:</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.kelas_id || 'Tiada Rekod'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">BULAN / TAHUN KEMAS KINI:</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg">{muridDitemui.bulan_tahun || 'Belum Ditetapkan'}</p>
              </div>
              <div>
  <p className="text-xs text-gray-500 font-bold mb-1">KUMPULAN RULAF:</p>
  {/* Gunakan warna berbeza mengikut tahap jika mahu, tetapi ini kod asasnya */}
  <p className="text-lg font-bold text-red-500">
    {muridDitemui?.tahap_rulaf || 'Belum Ditetapkan'}
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
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui?.nilai_akademik || '0'}%</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">SAHSIAH</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui?.nilai_sahsiah || '0'}%</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">BACAAN QURAN</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.bacaan_quran || '-'}</p>
              </div>
              <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-2">UJIAN HAFAZAN</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{muridDitemui.hafazan || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}