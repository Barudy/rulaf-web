'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './../../../lib/supabaseClient'; // Sesuaikan path mengikut struktur folder anda
import { useParams, useRouter } from 'next/navigation';

export default function PaparanBBMSpesifik() {
  const params = useParams();
  const router = useRouter();
  const idBBM = params.id; 

  const [bahan, setBahan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function tarikBBM() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rulaf_repo')
        .select('*')
        .eq('id', idBBM)
        .single();
      
      if (data) {
        setBahan(data);
      }
      setIsLoading(false);
    }
    if (idBBM) tarikBBM();
  }, [idBBM]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <p className="text-white font-mono animate-pulse">Menarik fail BBM spesifik dari pangkalan data...</p>
      </div>
    );
  }

  if (!bahan) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center p-6">
        <div className="max-w-md text-center bg-[#171A21] border border-red-500/40 p-8 rounded shadow-lg">
          <p className="text-red-500 font-mono font-bold mb-4">⚠️ Ralat: Fail BBM Tidak Ditemui!</p>
          <p className="text-gray-400 text-sm mb-6">Kemungkinan bahan ini telah dipadamkan atau pautan telah tamat tempoh.</p>
          <button onClick={() => router.push('/repo')} className="bg-gray-800 text-white px-4 py-2 rounded text-xs">
            [ Kembali ke Repositori ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm p-6 shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Navigasi Balik */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <button 
            onClick={() => router.push('/repo')}
            className="text-xs text-[#1793D1] hover:underline"
          >
            [ &lt;-- Kembali ke Repositori Utama ]
          </button>
          <span className="text-xs text-gray-500">ID BBM: #{bahan.id}</span>
        </div>

        {/* Informasi Utama */}
        <div className="mb-6">
          <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-xs px-3 py-1 rounded font-bold mb-3">
            {bahan.subjek} - {bahan.darjah}
          </span>
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{bahan.tajuk}</h1>
          <p className="text-xs text-gray-400">
            Topik Pembelajaran: {bahan.topik || 'Umum'}
          </p>
        </div>

        {/* Kotak Penerangan */}
        <div className="bg-[#11141b] border border-gray-800 rounded p-5 mb-8">
          <h3 className="text-sm font-bold text-white mb-2">📌 Maklumat Fail & Arahan:</h3>
          <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
            <li>Penyumbang BBM: <span className="text-[#1793D1]">{bahan.penyumbang}</span></li>
            <li>Diterbitkan pada: {new Date(bahan.created_at).toLocaleDateString('ms-MY')}</li>
            <li>Status fail: Selamat diguna & bebas daripada iklan/scam</li>
            <li>Format pautan: Google Drive, Canva, atau Kod Latihan Kuizizz</li>
          </ul>
        </div>

        {/* Butang Muat Turun Gergasi */}
        <div className="text-center sm:text-left">
          <a
            href={bahan.pautan}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-center bg-[#1793D1] text-[#0F1419] px-8 py-4 rounded font-bold text-sm shadow-[0_0_15px_rgba(23,147,209,0.4)] hover:bg-[#1272ab] hover:scale-[1.02] transition-all"
          >
            📥 [ KLIK DI SINI UNTUK MUAT TURUN / MAIN ]
          </a>
        </div>

      </div>
    </div>
  );
}