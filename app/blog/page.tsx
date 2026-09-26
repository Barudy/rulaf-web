'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

/** 📦 Blog / Log Pembangunan RuLaFHub — gaya GitHub changelog. */
export default function HalamanBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [bolehTulis, setBolehTulis] = useState(false);

  useEffect(() => {
    (async () => {
      // Ambil tanpa order() di SQL — susun di klien supaya kekal
      // berfungsi sama ada jadual guna `created_at` atau `tarikh`.
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
    // Blog CMS khusus Admin — sorok pautan tulis untuk orang lain
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

  return (
    <main className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3]">

      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black">📚 Log Pembangunan / Changelog</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Perkembangan pembangunan RuLaFHub — versi, ciri baharu, pembetulan & pencapaian.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-8">
        {memuat ? (
          <p className="text-xs text-gray-500 animate-pulse">Memuatkan blog…</p>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm font-bold">Tiada catatan buat masa ini.</p>
            {bolehTulis && (
            <Link href="/admin" className="inline-block mt-3 text-xs font-black text-[#1793D1] hover:underline">
              Tulis catatan pertama →
            </Link>
            )}
          </div>
        ) : (
          <ol className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-6">
            {posts.map((p) => (
              <li key={p.id} className="ml-6">
                <span className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-[#1793D1] ring-4 ring-white dark:ring-[#0d1117]" />
                <article className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-[#1793D1]">{p.tajuk}</span>
                    <span className="ml-auto font-mono text-[10px] text-gray-400">
                      {fmtD(tarikhPaparan(p))}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                    {p.kandungan}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1c2128] text-[10px] text-gray-500">
                    ✍️ {p.email_penulis || 'Pasukan RuLaFHub'}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
