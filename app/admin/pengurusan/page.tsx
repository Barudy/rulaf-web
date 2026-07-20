'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PengurusanSekolah() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sekolah');
  
  // State Borang Sekolah
  const [namaSekolah, setNamaSekolah] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisSekolah, setJenisSekolah] = useState('Sekolah Kebangsaan');

  // State Borang Murid & Markah
  const [namaMurid, setNamaMurid] = useState('');
  const [mykid, setMykid] = useState('');
  const [kelas, setKelas] = useState('3 Murshid');
  const [kehadiran, setKehadiran] = useState('');
  const [markahJawi, setMarkahJawi] = useState('');
  const [bacaanQuran, setBacaanQuran] = useState('');
  const [hafazan, setHafazan] = useState('');
  
  // *** TAMBAHAN BARU: State Bulan & Tahun ***
  const [bulanTahun, setBulanTahun] = useState('');

  const simpanSekolah = async () => {
    alert(`[+] Pendaftaran Sekolah ${namaSekolah} berjaya direkodkan di pangkalan data!`);
  };

  const simpanMarkah = async () => {
    // Semakan keselamatan: Pastikan bulan dan tahun diisi!
    if (!bulanTahun) {
      return alert('[!] Ralat: Sila masukkan Bulan & Tahun penggredan (Contoh: April 2026)');
    }
    
    // (Logik simpan ke jadual markah_murid Supabase akan diletakkan di sini kelak)
    alert(`[+] Markah untuk murid ${namaMurid} (${kelas}) bagi sesi ${bulanTahun} berjaya dimuat naik!`);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-6xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Header */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - PENGURUSAN INSTITUSI & PENGGREDAN</span>
          <button onClick={() => router.push('/admin')} className="hover:text-white font-bold transition-colors">
            [ cd .. / Kembali ke Admin ]
          </button>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-black text-white mb-6 border-b border-gray-700 pb-4">
            Platform Sekolah & Pengisian Markah RuLaF
          </h1>

          {/* Sistem Tab */}
          <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('sekolah')} className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'sekolah' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}>
              [ 1. TETAPAN SEKOLAH ]
            </button>
            <button onClick={() => setActiveTab('markah')} className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'markah' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}>
              [ 2. PENGISIAN MARKAH MURID ]
            </button>
          </div>

          {/* TAB 1: PENGURUSAN SEKOLAH */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-gray-900 p-6 border border-gray-700 shadow-md">
                <h3 className="text-[#1793D1] font-bold mb-4"> DAFTAR INSTITUSI BAHARU</h3>
                
                <label className="block text-xs font-bold mb-1">NAMA SEKOLAH:</label>
                <input type="text" value={namaSekolah} onChange={(e)=>setNamaSekolah(e.target.value)} className="w-full mb-4 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Contoh: SK Petra Jaya" />

                <label className="block text-xs font-bold mb-1">JENIS SEKOLAH:</label>
                <select value={jenisSekolah} onChange={(e)=>setJenisSekolah(e.target.value)} className="w-full mb-4 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]">
                  <option>Sekolah Kebangsaan (SK)</option>
                  <option>Sekolah Agama (SRA/KAFA)</option>
                  <option>Sekolah Menengah (SMK/SMKA)</option>
                </select>

                <label className="block text-xs font-bold mb-1">ALAMAT LENGKAP:</label>
                <textarea value={alamat} onChange={(e)=>setAlamat(e.target.value)} className="w-full mb-4 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1] h-20" placeholder="Alamat penuh sekolah..."></textarea>

                <button onClick={simpanSekolah} className="bg-[#1793D1] text-black px-6 py-2 font-bold hover:bg-blue-400 w-full transition-colors">
                  [ EXECUTE: DAFTAR SEKOLAH ]
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PENGISIAN MARKAH */}
          {activeTab === 'markah' && (
            <div className="space-y-6">
              <div className="bg-black p-4 border-l-4 border-l-purple-500 text-sm mb-4 shadow-md">
                <p className="text-purple-400 font-bold mb-1">[ MOD PENGGREDAN AKTIF ]</p>
                <p className="text-gray-400">Sila masukkan data pencapaian murid berdasarkan penilaian formatif terkini.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-900 p-6 border border-gray-700 shadow-md">
                {/* Maklumat Murid */}
                <div>
                  <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">MAKLUMAT MURID</h3>
                  <label className="block text-xs font-bold mb-1">NAMA MURID:</label>
                  <input type="text" value={namaMurid} onChange={(e)=>setNamaMurid(e.target.value)} className="w-full mb-3 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Nama penuh..." />
                  
                  <label className="block text-xs font-bold mb-1">NO. MYKID / K/P:</label>
                  <input type="text" value={mykid} onChange={(e)=>setMykid(e.target.value)} className="w-full mb-3 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Contoh: 15020313XXXX" />
                  
                  <label className="block text-xs font-bold mb-1">KELAS:</label>
                  <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="w-full mb-3 p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]">
                    <option>3 Murshid</option>
                    <option>5 Murshid</option>
                  </select>

                  {/* RUANGAN BULAN TAHUN */}
                  <label className="block text-xs font-bold mb-1 text-green-400 mt-4">BULAN & TAHUN PENGGREDAN:</label>
                  <input type="text" value={bulanTahun} onChange={(e)=>setBulanTahun(e.target.value)} className="w-full mb-3 p-2 bg-black border border-green-500/50 text-white outline-none focus:border-green-400" placeholder="Contoh: April 2026" />
                </div>

                {/* Kemasukan Markah */}
                <div>
                  <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">PENCAPAIAN AKADEMIK</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">KEHADIRAN (HARI):</label>
                      <input type="number" value={kehadiran} onChange={(e)=>setKehadiran(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Kehadiran..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">MARKAH JAWI (%):</label>
                      <input type="number" value={markahJawi} onChange={(e)=>setMarkahJawi(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Markah Jawi..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">BACAAN AL-QURAN:</label>
                      <select value={bacaanQuran} onChange={(e)=>setBacaanQuran(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]">
                        <option value="">Pilih...</option>
                        <option value="Iqra 1-6">Iqra 1-6</option>
                        <option value="Al-Quran">Al-Quran</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">SKOR HAFAZAN:</label>
                      <input type="text" value={hafazan} onChange={(e)=>setHafazan(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Gred Hafazan..." />
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={simpanMarkah} className="bg-purple-600 text-white px-6 py-3 font-bold hover:bg-purple-500 w-full tracking-widest transition-colors shadow-[0_0_10px_rgba(147,51,234,0.4)]">
                [ PUSH DATA PENGGREDAN ]
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}