'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  // Secara lalai (default), peranan ditetapkan sebagai 'Murid'
  const [profil, setProfil] = useState({ nama: '', umur: '', jantina: '', peranan: 'Murid' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    semakSesi();
  }, []);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login'); 
    } else {
      setUserEmail(session.user.email || '');
      const { data } = await supabase.from('profil_pengguna').select('*').eq('email', session.user.email).single();
      if (data) setProfil(data);
    }
  };

  const simpanProfil = async () => {
    setIsUpdating(true);
    // Kita simpan profil, tetapi peranan akan kekal mengikut apa yang ditarik dari database
    const { error } = await supabase.from('profil_pengguna').upsert({ 
      email: userEmail, 
      nama: profil.nama,
      umur: profil.umur,
      jantina: profil.jantina,
      peranan: profil.peranan // Peranan diambil dari state, user tak boleh ubah
    }, { onConflict: 'email' });
    
    if (error) alert('Ralat kemas kini: ' + error.message);
    else alert('[+] Profil berjaya dikemas kini!');
    setIsUpdating(false);
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm p-8 shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-black text-white">rulaf-config(1) - PROFIL & TETAPAN</h1>
          <button onClick={logKeluar} className="bg-red-600 text-white px-4 py-1 text-sm font-bold hover:bg-red-500 rounded-sm transition-colors">
            [ sudo logout ]
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-green-400 font-bold"> USER_ID: {userEmail}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">NAMA PENUH:</label>
              <input type="text" value={profil.nama} onChange={(e)=>setProfil({...profil, nama: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Nama anda..." />
            </div>
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">UMUR:</label>
              <input type="number" value={profil.umur} onChange={(e)=>setProfil({...profil, umur: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Umur..." />
            </div>
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">JANTINA:</label>
              <select value={profil.jantina} onChange={(e)=>setProfil({...profil, jantina: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]">
                <option value="">Pilih...</option>
                <option value="Lelaki">Lelaki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* BAHAGIAN YANG DIGODAM (KUNCI KESELAMATAN) */}
            <div>
              <label className="text-purple-400 font-bold block mb-1">PERANAN (ROLE):</label>
              <select 
                value={profil.peranan} 
                disabled={true} 
                className="w-full p-2 bg-gray-900 border border-red-900/50 text-gray-500 cursor-not-allowed outline-none"
              >
                <option value="Murid">Murid</option>
                <option value="Ibu Bapa">Ibu Bapa</option>
                <option value="Guru">Guru</option>
              </select>
              <p className="text-xs text-red-400 mt-2">*Hanya penggodam (Admin) boleh menukar akses peranan.</p>
            </div>
          </div>
          
          <button onClick={simpanProfil} disabled={isUpdating} className="mt-6 bg-[#1793D1] text-black px-6 py-2 font-bold hover:bg-blue-400 w-full transition-colors disabled:bg-gray-600 disabled:text-gray-300">
            {isUpdating ? 'Menyimpan konfigurasi...' : 'Simpan Konfigurasi'}
          </button>
        </div>

        {/* --- SISTEM PERMARKAHAN BERDASARKAN PERANAN --- */}
        <div className="mt-10 border-t border-gray-700 pt-6">
          <h2 className="text-xl font-bold text-white mb-4">Akses Pangkalan Data Jawi</h2>
          {profil.peranan === 'Guru' ? (
            <div className="bg-black p-4 border border-gray-700 border-l-4 border-l-purple-500 text-sm">
              <p className="text-purple-400 font-bold mb-2">[ AKSES GURU DIBENARKAN ]</p>
              <p className="text-gray-300">Anda mempunyai akses untuk memuat naik modul dan mengubah suai markah Jawi/Al-Quran pelajar di dalam pangkalan data pusat.</p>
              <button className="mt-4 bg-purple-600 text-white px-4 py-2 font-bold hover:bg-purple-500 transition-colors" onClick={()=> router.push('/admin')}>
                Buka Panel Penggredan (Admin)
              </button>
            </div>
          ) : profil.peranan === 'Ibu Bapa' ? (
            <div className="bg-black p-4 border border-gray-700 border-l-4 border-l-yellow-500 text-sm">
              <p className="text-yellow-400 font-bold mb-2">[ AKSES IBU BAPA ]</p>
              <p className="text-gray-300">Pantau prestasi anak-anak anda, dan sertai perbincangan komuniti PAK21 untuk mengetahui perkembangan terkini inovasi RuLaF.</p>
              <button className="mt-4 bg-yellow-600 text-black px-4 py-2 font-bold hover:bg-yellow-500 transition-colors" onClick={()=> router.push('/semakan')}>
                Akses Semakan Waris
              </button>
            </div>
          ) : (
            <div className="bg-black p-4 border border-gray-700 border-l-4 border-l-green-500 text-sm">
              <p className="text-green-400 font-bold mb-2">[ AKSES MURID ]</p>
              <p className="text-gray-300">Lihat prestasi formatif, pencapaian gamifikasi, dan sejarah semakan markah Jawi terkini anda di sini.</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 font-bold hover:bg-green-500 transition-colors" onClick={()=> router.push('/semakan')}>
                Semak Markah Saya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}