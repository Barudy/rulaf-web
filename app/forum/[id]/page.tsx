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
  const [bolehSah, setBolehSah] = useState(false); // Guru/Admin sahaja boleh sahkan jawapan
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
      const { data: p } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', session.user.email)
        .maybeSingle();
      const per = (p?.peranan || '').toLowerCase();
      setBolehSah(per === 'guru' || per === 'admin');
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
    if (topik && topik.status === 'tutup') return alert('[!] Perbincangan ini telah ditutup — jawapan telah disahkan.');
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

  // ✅ SAHKAN JAWAPAN (guru): tanda komen + tutup perbincangan
  const sahkanJawapan = async (komenId: number) => {
    if (komenId == null) return alert('[!] Rekod komen ini tiada ID (data lama tanpa auto-increment) — jalankan migrasi terkini dahulu.');
    if (!window.confirm('Sahkan komen ini sebagai jawapan? Perbincangan akan DITUTUP.')) return;
    const r1 = await supabase.from('rulaf_komen').update({ diterima: true }).eq('id', komenId);
    if (r1.error) {
      if (/column|42703|PGRST204|relation|42P01/i.test(`${r1.error.message} ${r1.error.code || ''}`))
        return alert('[!] Jadual forum belum dikemas kini. Jalankan supabase/migrasi-forum-tutup.sql di SQL Editor.');
      return alert('Ralat: ' + r1.error.message);
    }
    const r2 = await supabase.from('rulaf_forum').update({ status: 'tutup', jawapan_id: komenId }).eq('id', idForum);
    if (r2.error) return alert('Ralat: ' + r2.error.message);
    tarikTopikDanKomen();
  };

  // 🔓 BUKA SEMULA (guru): tarik pengesahan + buka komen
  const bukaSemula = async () => {
    if (!window.confirm('Buka semula perbincangan ini untuk komen?')) return;
    if (topik?.jawapan_id) await supabase.from('rulaf_komen').update({ diterima: false }).eq('id', topik.jawapan_id);
    const { error } = await supabase.from('rulaf_forum').update({ status: 'buka', jawapan_id: null }).eq('id', idForum);
    if (error) alert('Ralat: ' + error.message);
    else tarikTopikDanKomen();
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
  <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded-sm p-6 shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] transition-all duration-300">
      
      {/* Navigasi Kembali */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <button 
          onClick={() => router.push('/forum')}
          className="text-xs text-[#1793D1] hover:underline"
        >
          [ &lt;-- Kembali ke Forum Q&A ]
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500">Isu Perbincangan: #{topik.id}</span>
      </div>

      {/* Hantaran Topik Utama */}
      <div className="mb-8 bg-gray-100 dark:bg-[#11141b] p-6 border border-gray-200 dark:border-gray-800 rounded">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#1793D1]/15 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
            {topik.kategori}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {topik.subjek} - {topik.darjah}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-relaxed">{topik.tajuk}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(topik.status || 'buka') === 'tutup' ? (
            <span className="bg-gray-500/15 text-gray-500 text-[10px] px-2 py-0.5 rounded font-black">🔒 Tutup — Jawapan Disahkan</span>
          ) : (
            <span className="bg-green-500/15 text-green-600 text-[10px] px-2 py-0.5 rounded font-black">🟢 Buka</span>
          )}
          {bolehSah && (topik.status || 'buka') === 'tutup' && (
            <button onClick={bukaSemula} className="text-[10px] font-black text-[#1793D1] hover:underline">🔓 Buka Semula</button>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{topik.soalan}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-6 font-sans">
          Penulis: {topik.penulis} | Tarikh: {new Date(topik.created_at).toLocaleString('ms-MY')}
        </p>
      </div>

      {/* SENARAI KOMEN BERULANG (THREAD) */}
      <div className="mb-8">
        <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-sm">
          <span>💬 Ruang Ulasan & Komen</span>
          <span className="bg-gray-200 dark:bg-gray-800 text-[#1793D1] text-xs px-2.5 py-0.5 rounded-full">
            {senaraiKomen.length}
          </span>
        </h3>

        <div className="space-y-4">
          {senaraiKomen.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic p-4 bg-gray-100 dark:bg-[#11141b]/50 rounded text-center">
              Belum ada jawapan atau komen untuk topik ini. Jadilah yang pertama memberikan pandangan!
            </p>
          ) : (
            senaraiKomen.map((komen, index) => (
              <div key={komen.id} className={`bg-gray-100 dark:bg-[#11141b]/60 p-4 border rounded pl-6 border-l-2 ${komen.diterima ? 'border-gray-200 dark:border-green-700 border-l-green-500 dark:border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-gray-200 dark:border-gray-800/80 border-l-gray-400 dark:border-l-gray-600'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-sans font-bold flex items-center gap-2 flex-wrap">
                  <span>#{index + 1} | {komen.penulis} :: <span className="font-normal text-[10px]">{new Date(komen.created_at).toLocaleString('ms-MY')}</span></span>
                  {komen.diterima && (
                    <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">✅ Jawapan Disahkan</span>
                  )}
                  {bolehSah && !komen.diterima && (topik.status || 'buka') === 'buka' && (
                    <button onClick={() => sahkanJawapan(komen.id)} className="ml-auto text-[10px] font-black text-green-600 hover:underline">✓ Sahkan & Tutup</button>
                  )}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{komen.komen}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BORANG MENULIS JAWAPAN (DILUMPUHKAN APABILA TUTUP) */}
      {(topik.status || 'buka') === 'tutup' ? (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 p-4 rounded text-center text-xs text-gray-500">
            🔒 Perbincangan ini telah <b>ditutup</b> — jawapan telah disahkan oleh guru. Komen baharu dilumpuhkan.
          </div>
        </div>
      ) : isLoggedIn ? (
        <form onSubmit={hantarKomen} className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <h4 className="text-gray-900 dark:text-white font-bold text-sm mb-3">Tulis Balasan / Komen Anda:</h4>
          <div className="mb-4">
            <textarea
              rows={4}
              required
              placeholder="Berikan maklum balas atau cadangan penyelesaian bagi isu ini..."
              value={teksKomen}
              onChange={(e) => setTeksKomen(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono"
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
        <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded text-center text-xs">
          🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline font-bold">Log Masuk</a> untuk menulis balasan atau memberi maklum balas di dalam forum ini.
        </div>
      )}

    </div>
  </div>
);
}