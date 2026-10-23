'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { ialahAdmin } from '../lib/akses';

const emojiSubjek = (subjek?: string) => {
  const s = (subjek || '').toLowerCase();
  if (s.includes('sirah')) return '🕌';
  if (s.includes('jawi')) return '✍️';
  if (s.includes('arab')) return '📖';
  if (s.includes('ibadat') || s.includes('feqah')) return '🕋';
  if (s.includes('tauhid')) return '☝️';
  if (s.includes('adab')) return '🌸';
  return '🃏';
};

export default function FlashcardPage() {
  const [senarai, setSenarai] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<number, { mata: number; kad: number }>>({});
  const [email, setEmail] = useState('');
  const [bolehCipta, setBolehCipta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    muatData();
  }, []);

  const muatData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const emel = session?.user?.email || '';
    setEmail(emel);

    if (emel) {
      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emel)
        .maybeSingle();
      setBolehCipta(profil?.peranan === 'Guru' || profil?.peranan === 'Admin' || ialahAdmin(emel));
    }

    const { data } = await supabase
      .from('rulaf_flashcard')
      .select('*')
      .eq('is_aktif', true)
      .order('created_at', { ascending: false });

    setSenarai(data || []);

    if (emel) {
      const { data: prog } = await supabase
        .from('rulaf_flashcard_progress')
        .select('flashcard_id, mata, kad_index')
        .eq('email', emel);

      const ringkas: Record<number, { mata: number; kad: Set<number> }> = {};
      (prog || []).forEach((p: any) => {
        if (!ringkas[p.flashcard_id]) ringkas[p.flashcard_id] = { mata: 0, kad: new Set() };
        ringkas[p.flashcard_id].mata += p.mata || 0;
        ringkas[p.flashcard_id].kad.add(p.kad_index);
      });
      const hasil: Record<number, { mata: number; kad: number }> = {};
      Object.entries(ringkas).forEach(([id, v]) => { hasil[Number(id)] = { mata: v.mata, kad: v.kad.size }; });
      setProgress(hasil);
    }

    setIsLoading(false);
  };

  const jumlahMata = Object.values(progress).reduce((a, b) => a + b.mata, 0);
  const jumlahKadDibaca = Object.values(progress).reduce((a, b) => a + b.kad, 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] pb-16">
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-widest text-white/70 uppercase">Ulang Kaji Interaktif</p>
              <h1 className="text-3xl sm:text-4xl font-black mt-1">🃏 Flashcard RuLaF</h1>
              <p className="text-sm text-white/85 mt-2 max-w-xl">
                Baca kad, faham maksudnya, kemudian uji diri dengan kuiz yang berkaitan. Lagi banyak tulisan Jawi yang kamu baca, lagi tinggi mata!
              </p>
            </div>
            {bolehCipta && (
              <Link
                href="/admin/cipta-flashcard"
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-purple-50 transition-all shrink-0"
              >
                ➕ Cipta Flashcard
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7">
            <div className="bg-white/15 border border-white/25 rounded-2xl px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold text-white/70 uppercase">Koleksi</p>
              <p className="text-2xl font-black">{senarai.length}</p>
            </div>
            <div className="bg-white/15 border border-white/25 rounded-2xl px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold text-white/70 uppercase">Kad Dibaca</p>
              <p className="text-2xl font-black">{jumlahKadDibaca}</p>
            </div>
            <div className="bg-white/15 border border-white/25 rounded-2xl px-4 py-3 col-span-2 sm:col-span-1 backdrop-blur">
              <p className="text-[10px] font-bold text-white/70 uppercase">Mata Saya</p>
              <p className="text-2xl font-black">⭐ {jumlahMata}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {!email && (
          <div className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/50 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 font-semibold">
            💡 <Link href="/login" className="underline font-black">Log masuk</Link> untuk menyimpan mata ulangkaji kamu.
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-sm text-gray-500 animate-pulse">Memuatkan flashcard…</div>
        ) : senarai.length === 0 ? (
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🃏</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">Belum ada flashcard lagi.</p>
            <p className="text-xs text-gray-500 mt-1">Guru boleh cipta koleksi pertama untuk murid-murid.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {senarai.map((f) => {
              const kad = Array.isArray(f.kad) ? f.kad : [];
              const maxMata = Math.max(kad.length * 3, 1);
              const p = progress[f.id] || { mata: 0, kad: 0 };
              const peratus = Math.min(100, Math.round((p.mata / maxMata) * 100));
              return (
                <div
                  key={f.id}
                  className="group bg-white dark:bg-[#171A21] border-2 border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-700 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">{emojiSubjek(f.subjek)}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-black text-base text-gray-900 dark:text-white truncate">{f.tajuk}</h2>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {f.subjek || 'Umum'} · {f.darjah || 'Umum'} · {kad.length} kad
                      </p>
                    </div>
                    <span className="text-[11px] font-black text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/40 px-2 py-1 rounded-lg shrink-0">
                      ⭐ {p.mata}/{maxMata}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                        style={{ width: `${peratus}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      {p.kad}/{kad.length} kad dibaca · {peratus}% selesai
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/flashcard/${f.id}`}
                      className="flex-1 text-center bg-purple-600 hover:bg-purple-500 text-white text-xs font-black py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      Mula Ulangkaji 🚀
                    </Link>
                    {f.kuiz_id && (
                      <Link
                        href={`/permainan/${f.kuiz_id}`}
                        className="text-center bg-white dark:bg-[#0F1419] border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-black py-2.5 px-3 rounded-xl hover:border-purple-500 transition-all"
                      >
                        🎮 Kuiz
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
