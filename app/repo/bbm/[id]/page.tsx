'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './../../../lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaparanBBMSpesifik() {
  const params = useParams();
  const router = useRouter();
  const idBBM = params.id; 

  const [bahan, setBahan] = useState<any>(null);
  const [bahanBerkaitan, setBahanBerkaitan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function tarikBBM() {
      setIsLoading(true);
      const { data } = await supabase
        .from('rulaf_repo')
        .select('*')
        .eq('id', idBBM)
        .single();
      
      if (data) {
        setBahan(data);
        // Tarik 3 bahan berkaitan dalam subjek & darjah yang sama
        const { data: related } = await supabase
          .from('rulaf_repo')
          .select('id, tajuk, subjek, darjah')
          .eq('darjah', data.darjah)
          .eq('subjek', data.subjek)
          .neq('id', idBBM)
          .limit(3);
        if (related) setBahanBerkaitan(related);
      }
      setIsLoading(false);
    }
    if (idBBM) tarikBBM();
  }, [idBBM]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center">
        <p className="text-gray-500 dark:text-white font-mono animate-pulse text-xs">
          [ MEMUAT TURUN MAKLUMAT BBM... ]
        </p>
      </div>
    );
  }

  if (!bahan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-md text-center bg-white dark:bg-[#171A21] border border-red-500/40 p-8 rounded-xl shadow-lg">
          <p className="text-red-500 font-bold mb-4">⚠️ Ralat: Fail BBM Tidak Ditemui!</p>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Fail ini mungkin telah dipadamkan atau pautan perkongsian telah tamat tempoh.
          </p>
          <button 
            onClick={() => router.push('/repo')} 
            className="bg-gray-800 text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#1793D1]"
          >
            [ Kembali ke Repositori Utama ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl p-6 sm:p-8 shadow-xl">
        
        {/* 🧭 Breadcrumbs Navigasi Hirarki Terperinci */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto whitespace-nowrap">
          <Link href="/repo" className="hover:text-[#1793D1]">
            📁 Repositori
          </Link>
          <span>/</span>
          <Link href={`/repo?darjah=${encodeURIComponent(bahan.darjah || 'Semua')}`} className="hover:text-[#1793D1] font-bold text-gray-700 dark:text-gray-300">
            {bahan.darjah || 'Umum'}
          </Link>
          <span>/</span>
          <Link href={`/repo?darjah=${encodeURIComponent(bahan.darjah || 'Semua')}&subjek=${encodeURIComponent(bahan.subjek || 'Umum')}`} className="hover:text-[#1793D1] font-bold text-[#1793D1]">
            {bahan.subjek || 'Umum'}
          </Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">#{bahan.id}</span>
        </div>

        {/* Informasi Utama & Lencana */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#1793D1]/10 text-[#1793D1] text-xs px-3 py-1 rounded font-bold border border-[#1793D1]/30">
              {bahan.darjah} • {bahan.subjek}
            </span>
            
            {(!bahan.status || bahan.status === 'approved') && (
              <span className="bg-emerald-500/10 text-emerald-500 text-xs px-3 py-1 rounded font-bold border border-emerald-500/30">
                ✓ Disahkan (Approved)
              </span>
            )}
            {bahan.status === 'danger' && (
              <span className="bg-rose-500/10 text-rose-500 text-xs px-3 py-1 rounded font-bold border border-rose-500/30">
                🚫 Disekat (Danger)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {bahan.tajuk}
          </h1>
          <p className="text-xs text-gray-400">
            Topik / Unit: <strong className="text-gray-700 dark:text-gray-200">{bahan.topik || 'Umum'}</strong>
          </p>
        </div>

        {/* Kotak Penerangan & Metadata */}
        <div className="bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 text-xs space-y-2.5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">📌 Butiran Bahan:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500 dark:text-gray-400">
            <p>Penyumbang: <span className="text-[#1793D1] font-semibold">{bahan.penyumbang}</span></p>
            <p>Tarikh Terbit: <span>{new Date(bahan.created_at || Date.now()).toLocaleDateString('ms-MY')}</span></p>
          </div>
          {bahan.readme_text && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 whitespace-pre-line font-sans">
              {bahan.readme_text}
            </div>
          )}
        </div>

        {/* Butang Muat Turun */}
        <div className="mb-8">
          {bahan.status === 'danger' ? (
            <button disabled className="w-full py-4 bg-gray-800 text-gray-500 rounded-lg font-bold text-xs cursor-not-allowed">
              ⛔ PAUTAN INI TELAH DISEKAT ATAS SEBAB KESELAMATAN
            </button>
          ) : (
            <a
              href={bahan.pautan}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 bg-[#1793D1] hover:bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg transition-all"
            >
              📥 [ BUKA / MUAT TURUN BAHAN BBM ]
            </a>
          )}
        </div>

        {/* Cadangan Bahan Berkaitan */}
        {bahanBerkaitan.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Bahan Lain Berkaitan ({bahan.darjah} - {bahan.subjek})
            </h4>
            <div className="space-y-2">
              {bahanBerkaitan.map(item => (
                <Link
                  key={item.id}
                  href={`/repo/bbm/${item.id}`}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 text-xs hover:border-[#1793D1] transition-all"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">📄 {item.tajuk}</span>
                  <span className="text-[#1793D1] font-bold">Lihat ➔</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}