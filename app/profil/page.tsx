'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [profil, setProfil] = useState({ nama: '', umur: '', jantina: '', peranan: 'Murid' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    semakSesi();
  }, []);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login'); // Tendang keluar jika belum log masuk
    } else {
      setUserEmail(session.user.email || '');
      // Tarik data profil dari database jika ada
      const { data } = await supabase.from('profil_pengguna').select('*').eq('email', session.user.email).single();
      if (data) setProfil(data);
    }
  };

  const simpanProfil = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('profil_pengguna').upsert({ 
      email: userEmail, ...profil 
    }, { onConflict: 'email' });
    
    if (error) alert('Ralat kemas kini: ' + error.message);
    else alert('[+] Profil berjaya dikemas kini!');
    setIsUpdating(false);
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Kembali ke laman utama selepas log keluar
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10">
      <div className="max-w-3xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm p-8 shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-black text-white">rulaf-config(1) - PROFIL & TETAPAN</h1>
          <button onClick={logKeluar} className="bg-red-600 text-white px-4 py-1 text-sm font-bold hover:bg-red-500 rounded-sm">
            [ sudo logout ]
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-green-400 font-bold"> USER_ID: {userEmail}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">NAMA PENUH:</label>
              <input type="text" value={profil.nama} onChange={(e)=>setProfil({...profil, nama: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white" />
            </div>
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">UMUR:</label>
              <input type="number" value={profil.umur} onChange={(e)=>setProfil({...profil, umur: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white" />
            </div>
            <div>
              <label className="text-[#1793D1] font-bold block mb-1">JANTINA:</label>
              <select value={profil.jantina} onChange={(e)=>setProfil({...profil, jantina: e.target.value})} className="w-full p-2 bg-black border border-gray-700 text-white">
                <option value="">Pilih...</option>
                <option value="Lelaki">Lelaki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-purple-400 font-bold block mb-1">PERANAN (ROLE):</label>
              <select value={profil.peranan} onChange={(e)=>setProfil({...profil, peranan: e.target.value})} className="w-full p-2 bg-black border border-purple-500 text-white">
                <option value="Murid">Murid</option>
                <option value="Ibu Bapa">Ibu Bapa</option>
                <option value="Guru">Guru</option>
              </select>
            </div>
          </div>
          
          <button onClick={simpanProfil} disabled={isUpdating} className="mt-4 bg-[#1793D1] text-black px-6 py-2 font-bold hover:bg-blue-400 w-full">
            {isUpdating ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </div>

        {/* --- SISTEM PERMARKAHAN BERDASARKAN PERANAN --- */}
        <div className="mt-10 border-t border-gray-700 pt-6">
          <h2 className="text-xl font-bold text-white mb-4">Pangkalan Data Permarkahan Jawi</h2>
          {profil.peranan === 'Guru' ? (
            <div className="bg-gray-900 p-4 border-l-4 border-l-purple-500 text-sm">
              <p className="text-purple-400 font-bold mb-2">[ AKSES GURU DIBENARKAN ]</p>
              <p>Anda mempunyai akses untuk memuat naik dan mengubah suai markah Jawi/Al-Quran pelajar di dalam pangkalan data pusat.</p>
              <button className="mt-3 bg-purple-600 text-white px-4 py-2 font-bold hover:bg-purple-500">Buka Panel Penggredan</button>
            </div>
          ) : (
            <div className="bg-gray-900 p-4 border-l-4 border-l-green-500 text-sm">
              <p className="text-green-400 font-bold mb-2">[ AKSES MURID/WARIS ]</p>
              <p>Lihat prestasi formatif, pencapaian gamifikasi, dan sejarah semakan markah Jawi terkini anda di sini.</p>
              <button className="mt-3 bg-green-600 text-white px-4 py-2 font-bold hover:bg-green-500" onClick={()=> router.push('/semakan')}>Akses Semakan Markah</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}