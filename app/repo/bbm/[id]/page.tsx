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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center transition-colors duration-300">
        <p className="text-gray-500 dark:text-white font-mono animate-pulse">Menarik fail BBM spesifik dari pangkalan data...</p>
      </div>
    );
  }

  if (!bahan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md text-center bg-white dark:bg-[#171A21] border border-red-500/40 p-8 rounded shadow-lg">
          <p className="text-red-500 font-mono font-bold mb-4">⚠️ Ralat: Fail BBM Tidak Ditemui!</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Kemungkinan bahan ini telah dipadamkan oleh moderator atau pautan telah tamat tempoh.</p>
          <button onClick={() => router.push('/repo')} className="bg-gray-800 text-white px-4 py-2 rounded text-xs">
            [ Kembali ke Repositori ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded-sm p-6 shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] transition-all duration-300">
        
        {/* Navigasi Balik */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
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
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-xs px-3 py-1 rounded font-bold">
              {bahan.subjek} - {bahan.darjah}
            </span>
            
            {/* 🔹 STATUS PERAKUAN BADGE */}
            {(!bahan.status || bahan.status === 'approved') && (
              <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded font-extrabold border border-blue-200 dark:border-blue-900/50">
                🔹 Diluluskan (Approved)
              </span>
            )}
            {bahan.status === 'danger' && (
              <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs px-3 py-1 rounded font-extrabold border border-red-200 dark:border-red-900/50">
                🚫 Disekat (Danger)
              </span>
            )}
            {bahan.status === 'abandoned' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs px-3 py-1 rounded font-extrabold border border-amber-200 dark:border-amber-900/50">
                ⚠️ Ditinggalkan (Abandoned)
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{bahan.tajuk}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Topik Pembelajaran: {bahan.topik || 'Umum'}
          </p>
        </div>

        {/* Amaran khas sekiranya dikesan bahaya atau ditinggalkan */}
        {bahan.status === 'danger' && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded text-sm leading-relaxed">
            <h4 className="font-bold mb-1">⚠️ AMARAN KESELATAMAN:</h4>
            Pautan muat turun bagi bahan bantuan mengajar ini telah disekat secara rasmi oleh pentadbir demi menjaga keselamatan data komuniti daripada sebarang unsur perisian berniat jahat (malware) atau phishing.
          </div>
        )}

        {bahan.status === 'abandoned' && (
          <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded text-sm leading-relaxed">
            <h4 className="font-bold mb-1">⚠️ NOTA PEMAKLUMAN:</h4>
            Bahan ini telah ditandakan sebagai <strong>"Ditinggalkan (Abandoned)"</strong>. Ini bermakna bahan ini berkemungkinan mengandungi pautan yang tidak lagi aktif atau sukatan pelajaran lama yang tidak lagi diselenggara secara aktif.
          </div>
        )}

        {/* Kotak Penerangan */}
        <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded p-5 mb-8 transition-colors duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">📌 Maklumat Fail & Arahan:</h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
            <li>Penyumbang BBM: <span className="text-[#1793D1] font-bold">{bahan.penyumbang}</span></li>
            <li>Diterbitkan pada: {new Date(bahan.created_at || Date.now()).toLocaleDateString('ms-MY')}</li>
            <li>Status fail: {bahan.status === 'danger' ? 'Disekat (Tidak Selamat)' : 'Selamat diguna & bebas daripada iklan/scam'}</li>
            <li>Format pautan: Google Drive, Canva, atau Kod Latihan Kuizizz</li>
          </ul>
        </div>

        {/* Butang Muat Turun Gergasi */}
        <div className="text-center sm:text-left">
          {bahan.status === 'danger' ? (
            <button
              disabled
              className="inline-block text-center bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 px-8 py-4 rounded font-bold text-sm cursor-not-allowed select-none border border-gray-400 dark:border-gray-700"
            >
              📥 MUAT TURUN DISEKAT KEKAL
            </button>
          ) : (
            <a
              href={bahan.pautan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center bg-[#1793D1] text-[#0F1419] px-8 py-4 rounded font-bold text-sm shadow-[0_0_15px_rgba(23,147,209,0.4)] hover:bg-[#1272ab] hover:scale-[1.02] transition-all"
            >
              📥 [ KLIK DI SINI UNTUK MUAT TURUN / MAIN ]
            </a>
          )}
        </div>

      </div>
    </div>
  );
}