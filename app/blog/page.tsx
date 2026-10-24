'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import PaparMarkdown from '../../components/PaparMarkdown';

/** 📦 Blog / Log Pembangunan RuLaFHub — gaya GitHub changelog dengan Side Arkib Wikipedia. */
export default function HalamanBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [bolehTulis, setBolehTulis] = useState(false);
  const [bukaPenuhMap, setBukaPenuhMap] = useState<Record<number, boolean>>({});
  const PAPAR_TERKINI = 5;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('blog_rulaf').select('*');
      if (data) {
        const susun = [...data].sort((a: any, b: any) => {
          const da = new Date(a.created_at || a.tarikh || 0).getTime();
          const db = new Date(b.created_at || b.tarikh || 0).getTime();
          return db - da;
        });
        setPosts(susun);
      }
      setMemuat(false);
    })();
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const emel = session?.user?.email || '';
      if (!emel) return;
      if (emel.toLowerCase() === 'admin@rulafhub.com') { setBolehTulis(true); return; }
      const { data: p } = await supabase.from('profil_pengguna').select('peranan').eq('email', emel).maybeSingle();
      if ((p?.peranan || '').toLowerCase() === 'admin') setBolehTulis(true);
    })();
  }, []);

  const tarikhPaparan = (p: any) => p.created_at || p.tarikh || '';
  const fmtD = (d: string) =>
    d
      ? new Date(d).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Tiada Tarikh';

  const togolBukaPenuh = (id: number) => {
    setBukaPenuhMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] font-sans">

      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">📚 Log Pembangunan & Jurnal RuLaFHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Changelog rasmi, kemas kini sistem, serta dokumentasi ujian video & YouTube.
            </p>
          </div>
          {bolehTulis && (
            <Link href="/admin" className="inline-flex items-center gap-2 bg-[#1793D1] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1272ab] transition-all shadow">
              <span>✍️</span> Tulis Blog Baru (Admin)
            </Link>
          )}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {memuat ? (
          <p className="text-xs text-gray-500 animate-pulse text-center py-12">Memuatkan log pembangunan…</p>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center max-w-2xl mx-auto">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm font-bold">Tiada catatan blog buat masa ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* KIRI (8 KOLUM): SENARAI BLOG UTAMA GAYA GITHUB & MARKDOWN */}
            <div className="lg:col-span-8 space-y-6">
              <ol className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-6">
                {posts.map((p) => {
                  const sudahBuka = !!bukaPenuhMap[p.id];
                  const teksKandungan = p.kandungan || '';
                  const perluRingkas = teksKandungan.length > 300;
                  const kandunganPapar = !sudahBuka && perluRingkas ? teksKandungan.slice(0, 300) + '...' : teksKandungan;

                  return (
                    <li key={p.id} className="ml-6">
                      <span className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-[#1793D1] ring-4 ring-white dark:ring-[#0d1117]" />
                      <article className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        {p.gambar && (
                          <img src={p.gambar} alt={p.tajuk || 'Gambar artikel'} className="w-full max-h-72 object-cover border-b border-gray-200 dark:border-gray-800" loading="lazy" />
                        )}
                        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2 bg-gray-50/50 dark:bg-[#1c2128]/50">
                          <span className="text-base font-black text-[#1793D1]">{p.tajuk}</span>
                          <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {fmtD(tarikhPaparan(p))}
                          </span>
                        </div>

                        {/* Kandungan Markdown gaya GitHub */}
                        <div className="px-5 py-4 text-xs sm:text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                          <PaparMarkdown teks={kandunganPapar} />
                        </div>

                        {perluRingkas && (
                          <div className="px-5 pb-3">
                            <button
                              onClick={() => togolBukaPenuh(p.id)}
                              className="text-xs font-bold text-[#1793D1] hover:underline inline-flex items-center gap-1"
                            >
                              {sudahBuka ? '▲ Tutup / Ringkaskan' : 'Baca secara penuh (Read More) ▼'}
                            </button>
                          </div>
                        )}

                        <div className="px-5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1c2128] flex items-center justify-between text-[11px] text-gray-500">
                          <span>✍️ {p.email_penulis || 'Pasukan RuLaFHub'}</span>
                          <span className="font-mono">#changelog</span>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* KANAN (4 KOLUM): ARKIB KECIL ALA WIKIPEDIA */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                  <span className="text-base">📦</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Sejarah & Arkib Blog</h3>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Indeks pantas rekod pembangunan sistem RuLaFHub sejak versi alfa hingga kemas kini terkini.
                </p>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto pr-1">
                  {posts.map((art) => (
                    <div key={art.id} className="py-2.5 first:pt-0 last:pb-0">
                      <span className="text-[10px] font-mono text-[#1793D1] block mb-0.5">{fmtD(tarikhPaparan(art))}</span>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                        {art.tajuk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/30 rounded-xl p-5 text-xs space-y-2">
                <p className="font-bold text-sky-600 dark:text-sky-400">💡 Panduan Penulisan & Markdown</p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  Gunakan format tajuk <code className="bg-black/10 dark:bg-white/10 px-1 rounded"># Tajuk Besar</code>, <code className="bg-black/10 dark:bg-white/10 px-1 rounded">**Tebal**</code>, <code className="bg-black/10 dark:bg-white/10 px-1 rounded">*Italik*</code>, serta masukkan pautan video YouTube secara langsung pada baris baharu.
                </p>
              </div>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
