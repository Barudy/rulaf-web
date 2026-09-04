'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export interface HariKerajinan {
  tarikh: string;
  tugasanDiberi: number;
  tugasanSiap: number;
  hadir: boolean;
}

export default function ProfilPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  
  // 1. TAMBAH MYKID DENGAN NILAI DEFAULT KERAHSIAAN (0000000000000)
  const [profil, setProfil] = useState({ 
    nama: '', 
    umur: '', 
    jantina: '', 
    peranan: 'Murid',
    mykid: '0000000000000' 
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Data Matriks Kerajinan Harian (Heatmap GitHub Style)
  const [dataKerajinan, setDataKerajinan] = useState<HariKerajinan[]>([
    { tarikh: '2026-09-01', tugasanDiberi: 3, tugasanSiap: 3, hadir: true },
    { tarikh: '2026-09-02', tugasanDiberi: 2, tugasanSiap: 2, hadir: true },
    { tarikh: '2026-09-03', tugasanDiberi: 3, tugasanSiap: 1, hadir: true },
    { tarikh: '2026-09-04', tugasanDiberi: 2, tugasanSiap: 0, hadir: true },
    { tarikh: '2026-09-05', tugasanDiberi: 0, tugasanSiap: 0, hadir: false },
    { tarikh: '2026-09-06', tugasanDiberi: 3, tugasanSiap: 2, hadir: true },
    { tarikh: '2026-09-07', tugasanDiberi: 2, tugasanSiap: 2, hadir: true },
  ]);

  useEffect(() => {
    semakSesi();
  }, []);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login'); 
    } else {
      setUserEmail(session.user.email || '');
      const { data } = await supabase
        .from('profil_pengguna')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (data) {
        setProfil({
          nama: data.nama || '',
          umur: data.umur || '',
          jantina: data.jantina || '',
          peranan: data.peranan || 'Murid',
          mykid: data.mykid || '0000000000000'
        });
      }
    }
  };

  const simpanProfil = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('profil_pengguna').upsert({ 
      email: userEmail, 
      nama: profil.nama,
      umur: profil.umur,
      jantina: profil.jantina,
      peranan: profil.peranan,
      mykid: profil.mykid || '0000000000000'
    }, { onConflict: 'email' });
    
    if (error) alert('Ralat kemas kini: ' + error.message);
    else alert('[+] Profil berjaya dikemas kini!');
    setIsUpdating(false);
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    router.push('/'); 
  };

  // Formula Nisbah Pewarnaan Heatmap Dinamik (Menyokong 2/2 dan 3/3)
  const getWarnaKotak = (hari: HariKerajinan) => {
    if (!hari.hadir) return 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400';
    if (hari.tugasanDiberi === 0 || hari.tugasanSiap === 0) {
      return 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500';
    }

    const peratus = (hari.tugasanSiap / hari.tugasanDiberi) * 100;
    if (peratus >= 100) return 'bg-emerald-500 border-emerald-400 text-white'; // Hijau (100%)
    if (peratus >= 50) return 'bg-amber-400 border-amber-300 text-black';       // Kuning (>=50%)
    return 'bg-rose-500 border-rose-400 text-white';                           // Merah (<50%)
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded-sm p-8 shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] transition-all duration-300">
        
        {/* Header Asal */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">rulaf-config(1) - PROFIL & TETAPAN</h1>
          <button onClick={logKeluar} className="bg-red-600 text-white px-4 py-1 text-sm font-bold hover:bg-red-500 rounded-sm transition-colors">
            [ sudo logout ]
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-green-600 dark:text-green-400 font-bold"> USER_ID: {userEmail}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">NAMA PENUH:</label>
              <input 
                type="text" 
                value={profil.nama} 
                onChange={(e) => setProfil({...profil, nama: e.target.value})} 
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none" 
                placeholder="Nama anda..." 
              />
            </div>

            <div>
              <label className="text-[#1793D1] font-bold block mb-1">UMUR:</label>
              <input 
                type="number" 
                value={profil.umur} 
                onChange={(e) => setProfil({...profil, umur: e.target.value})} 
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none" 
                placeholder="Umur..." 
              />
            </div>

            <div>
              <label className="text-[#1793D1] font-bold block mb-1">JANTINA:</label>
              <select 
                value={profil.jantina} 
                onChange={(e) => setProfil({...profil, jantina: e.target.value})} 
                className="w-full p-2 bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#1793D1]"
              >
                <option value="">Pilih...</option>
                <option value="Lelaki">Lelaki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Kunci Keselamatan Peranan */}
            <div>
              <label className="text-purple-400 font-bold block mb-1">PERANAN (ROLE):</label>
              <select 
                value={profil.peranan} 
                disabled={true} 
                className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] border-red-900/50 text-gray-500 cursor-not-allowed outline-none"
              >
                <option value="Murid">Murid</option>
                <option value="Ibu Bapa">Ibu Bapa</option>
                <option value="Guru">Guru</option>
              </select>
              <p className="text-xs text-red-400 mt-2">*Hanya penggodam (Admin) boleh menukar akses peranan.</p>
            </div>

            {/* Input MyKid Terlindung (Khusus untuk Murid) */}
            {profil.peranan === 'Murid' && (
              <div className="col-span-1 sm:col-span-2">
                <label className="text-[#1793D1] font-bold block mb-1">NO. MYKID (KERAHSIAAN):</label>
                <input 
                  type="text" 
                  value={profil.mykid} 
                  onChange={(e) => setProfil({...profil, mykid: e.target.value})} 
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono" 
                  placeholder="0000000000000" 
                />
                <p className="text-[11px] text-gray-400 mt-1">*Nilai dilindungi secara generik (0000000000000) bagi mematuhi privasi.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={simpanProfil} 
            disabled={isUpdating} 
            className="mt-6 bg-[#1793D1] text-black px-6 py-2 font-bold hover:bg-blue-400 w-full transition-colors disabled:bg-gray-600 disabled:text-gray-300 rounded-sm"
          >
            {isUpdating ? 'Menyimpan konfigurasi...' : 'Simpan Konfigurasi'}
          </button>
        </div>

        {/* --- SISTEM PERMARKAHAN BERDASARKAN PERANAN --- */}
        <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Akses Pangkalan Data Jawi</h2>
          
          {profil.peranan === 'Guru' ? (
            <div className="bg-gray-100 dark:bg-black p-4 border border-gray-300 dark:border-gray-700 border-l-4 border-l-purple-500 text-sm rounded-sm">
              <p className="text-purple-600 dark:text-purple-400 font-bold mb-2">[ AKSES GURU DIBENARKAN ]</p>
              <p className="text-gray-700 dark:text-gray-300">Anda mempunyai akses untuk memuat naik modul dan mengubah suai markah Jawi/Al-Quran pelajar di dalam pangkalan data pusat.</p>
              <button className="mt-4 bg-purple-600 text-white px-4 py-2 font-bold hover:bg-purple-500 transition-colors rounded-sm" onClick={() => router.push('/admin')}>
                Buka Panel Penggredan (Admin)
              </button>
            </div>
          ) : profil.peranan === 'Ibu Bapa' ? (
            <div className="bg-gray-100 dark:bg-black p-4 border border-gray-300 dark:border-gray-700 border-l-4 border-l-yellow-500 text-sm rounded-sm">
              <p className="text-yellow-600 dark:text-yellow-400 font-bold mb-2">[ AKSES IBU BAPA ]</p>
              <p className="text-gray-700 dark:text-gray-300">Pantau prestasi anak-anak anda, dan sertai perbincangan komuniti PAK21 untuk mengetahui perkembangan terkini inovasi RuLaF.</p>
              <button className="mt-4 bg-yellow-600 text-white px-4 py-2 font-bold hover:bg-yellow-500 transition-colors rounded-sm" onClick={() => router.push('/semakan')}>
                Akses Semakan Waris
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-black p-4 border border-gray-300 dark:border-gray-700 border-l-4 border-l-green-500 text-sm rounded-sm space-y-4">
              <div>
                <p className="text-green-600 dark:text-green-400 font-bold mb-1">[ AKSES MURID ]</p>
                <p className="text-gray-700 dark:text-gray-300">Lihat prestasi formatif, pencapaian gamifikasi, dan sejarah semakan markah Jawi terkini anda di sini.</p>
              </div>

              {/* Matriks Kerajinan Harian (GitHub Heatmap) */}
              <div className="p-3 bg-white dark:bg-[#0F1419] border border-gray-300 dark:border-gray-800 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#1793D1]">STREAK KERAJINAN HARIAN (NFC)</span>
                  <span className="text-[10px] text-gray-500">Bulan Semasa</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {dataKerajinan.map((hari, idx) => {
                    const warna = getWarnaKotak(hari);
                    return (
                      <div
                        key={idx}
                        title={`${hari.tarikh} | Selesai: ${hari.tugasanSiap}/${hari.tugasanDiberi}`}
                        className={`w-6 h-6 rounded-sm border flex items-center justify-center text-[9px] font-bold cursor-pointer transition-transform hover:scale-125 ${warna}`}
                      >
                        {hari.tugasanSiap > 0 ? hari.tugasanSiap : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Petunjuk Warna Ringkas */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-500">
                  <span>Petunjuk:</span>
                  <span className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 rounded-sm inline-block"></span> 0
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block"></span> &lt;50%
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span> 50%
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block"></span> 100%
                </div>
              </div>

              <button className="bg-green-600 text-white px-4 py-2 font-bold hover:bg-green-500 transition-colors rounded-sm" onClick={() => router.push('/semakan')}>
                Semak Markah Saya
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}