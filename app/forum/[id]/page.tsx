'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './../../lib/supabaseClient'; // Gantikan '../lib/supabaseClient' jika tidak sepadan
import { useParams, useRouter } from 'next/navigation';

export default function PaparanForumSpesifik() {
  const params = useParams();
  const router = useRouter();
  const idForum = params.id;

  const [topik, setTopik] = useState<any>(null);
  const [senaraiKomen, setSenaraiKomen] = useState<any[]>([]);
  const [teksKomen, setTeksKomen] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    semakUser();
    if (idForum) {
      tarikTopikDanKomen();
    }
  }, [idForum]);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      setUserEmail(session.user.email || 'Pendidik RuLaF');
    }
  };

  const tarikTopikDanKomen = async () => {
    setIsLoading(true);
    // 1. Tarik maklumat topik forum
    const { data: dataTopik } = await supabase
      .from('rulaf_forum')
      .select('*')
      .eq('id', idForum)
      .single();

    if (dataTopik) {
      setTopik(dataTopik);
      // 2. Tarik senarai komen bersarang secara kronologi
      const { data: dataKomen } = await supabase
        .from('rulaf_komen')
        .select('*')
        .eq('forum_id', idForum)
        .order('created_at', { ascending: true });
      
      if (dataKomen) setSenaraiKomen(dataKomen);
    }
    setIsLoading(false);
  };

  const hantarKomen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teksKomen) return alert('[!] Komen kosong tidak dibenarkan!');

    const { error } = await supabase.from('rulaf_komen').insert([
      {
        forum_id: idForum,
        komen: teksKomen,
        penulis: userEmail
      }
    ]);

    if (error) {
      alert('Ralat Komen: ' + error.message);
    } else {
      setTeksKomen('');
      // Refresh ulasan komen
      tarikTopikDanKomen();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <p className="text-white font-mono animate-pulse">Memuat turun perbincangan forum...</p>
      </div>
    );
  }

  if (!topik) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center p-6">
        <div className="max-w-md text-center bg-[#171A21] border border-red-500/40 p-8 rounded shadow-lg">
          <p className="text-red-500 font-mono font-bold mb-4">⚠️ Ralat: Topik Forum Tidak Dijumpai!</p>
          <p className="text-gray-400 text-sm mb-6">Topik ini mungkin telah dipadamkan oleh pentadbir atau dialihkan.</p>
          <button onClick={() => router.push('/forum')} className="bg-gray-800 text-white px-4 py-2 rounded text-xs">
            [ Kembali ke Forum ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-4xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm p-6 shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Navigasi Kembali */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <button 
            onClick={() => router.push('/forum')}
            className="text-xs text-[#1793D1] hover:underline"
          >
            [ &lt;-- Kembali ke Forum Q&A ]
          </button>
          <span className="text-xs text-gray-500">Isu Perbincangan: #{topik.id}</span>
        </div>

        {/* Hantaran Topik Utama */}
        <div className="mb-8 bg-[#11141b] p-6 border border-gray-800 rounded">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#1793D1]/15 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
              {topik.kategori}
            </span>
            <span className="text-xs text-gray-500">
              {topik.subjek} - {topik.darjah}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 leading-relaxed">{topik.tajuk}</h1>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{topik.soalan}</p>
          <p className="text-[10px] text-gray-500 mt-6 font-sans">
            Penulis: {topik.penulis} | Tarikh: {new Date(topik.created_at).toLocaleString('ms-MY')}
          </p>
        </div>

        {/* SENARAI KOMEN BERULANG (THREAD) */}
        <div className="mb-8">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
            <span>💬 Ruang Ulasan & Komen</span>
            <span className="bg-gray-800 text-[#1793D1] text-xs px-2.5 py-0.5 rounded-full">
              {senaraiKomen.length}
            </span>
          </h3>

          <div className="space-y-4">
            {senaraiKomen.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-[#11141b]/50 rounded text-center">
                Belum ada jawapan atau komen untuk topik ini. Jadilah yang pertama memberikan pandangan!
              </p>
            ) : (
              senaraiKomen.map((komen, index) => (
                <div key={komen.id} className="bg-[#11141b]/60 p-4 border border-gray-800/80 rounded pl-6 border-l-2 border-l-gray-700">
                  <p className="text-xs text-gray-500 mb-2 font-sans font-bold">
                    #{index + 1} | {komen.penulis} :: <span className="font-normal text-[10px]">{new Date(komen.created_at).toLocaleString('ms-MY')}</span>
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{komen.komen}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BORANG MENULIS JAWAPAN / KOMEN */}
        {isLoggedIn ? (
          <form onSubmit={hantarKomen} className="border-t border-gray-800 pt-6">
            <h4 className="text-white font-bold text-sm mb-3">Tulis Balasan / Komen Anda:</h4>
            <div className="mb-4">
              <textarea
                rows={4}
                required
                placeholder="Berikan maklum balas atau cadangan penyelesaian bagi isu ini..."
                value={teksKomen}
                onChange={(e) => setTeksKomen(e.target.value)}
                className="w-full bg-[#11141b] border border-gray-800 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1793D1] text-[#0F1419] font-bold px-6 py-2.5 rounded text-xs hover:bg-[#1272ab] transition-colors"
            >
              [ Hantar Balasan ]
            </button>
          </form>
        ) : (
          <div className="bg-[#11141b] border border-gray-800 p-4 rounded text-center text-xs">
            🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline">Log Masuk</a> untuk menulis balasan atau memberi maklum balas di dalam forum ini.
          </div>
        )}

      </div>
    </div>
  );
}