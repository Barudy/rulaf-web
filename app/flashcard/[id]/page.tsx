'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

type ModBaca = 'jawi' | 'dwi' | 'rumi';

const MATA_MOD: Record<ModBaca, number> = { jawi: 3, dwi: 2, rumi: 1 };

const LABEL_MOD: Record<ModBaca, { ikon: string; tajuk: string; nota: string; warna: string }> = {
  jawi: { ikon: '🕌', tajuk: 'Jawi Sahaja', nota: 'Baca tulisan Jawi — mata tertinggi', warna: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' },
  dwi: { ikon: '🌗', tajuk: 'Dwi-Tulisan', nota: 'Baca Jawi & Rumi serentak', warna: 'border-sky-400 bg-sky-50 dark:bg-sky-950/20' },
  rumi: { ikon: '🔤', tajuk: 'Rumi Sahaja', nota: 'Baca tulisan Rumi — mata asas', warna: 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' },
};

export default function FlashcardDetailPage() {
  const params = useParams();
  const flashId = params.id as string;

  const [flash, setFlash] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [kuizTajuk, setKuizTajuk] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [fasa, setFasa] = useState<'pilih' | 'baca' | 'tamat'>('pilih');
  const [mod, setMod] = useState<ModBaca>('dwi');
  const [indeks, setIndeks] = useState(0);
  const [flip, setFlip] = useState(false);
  const [sesiMata, setSesiMata] = useState(0);
  const [mataTerbaik, setMataTerbaik] = useState<Record<number, number>>({});
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const kad: any[] = Array.isArray(flash?.kad) ? flash.kad : [];
  const kadSemasa = kad[indeks] || {};
  const jumlahKad = kad.length;

  useEffect(() => {
    muatData();
  }, [flashId]);

  const muatData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const emel = session?.user?.email || '';
    setEmail(emel);

    const { data } = await supabase
      .from('rulaf_flashcard')
      .select('*')
      .eq('id', flashId)
      .maybeSingle();

    setFlash(data);

    if (data?.kuiz_id) {
      const { data: kuiz } = await supabase
        .from('rulaf_kuiz')
        .select('tajuk')
        .eq('id', data.kuiz_id)
        .maybeSingle();
      setKuizTajuk(kuiz?.tajuk || '');
    }

    if (emel && data) {
      const { data: prog } = await supabase
        .from('rulaf_flashcard_progress')
        .select('kad_index, mata')
        .eq('email', emel)
        .eq('flashcard_id', data.id);

      const peta: Record<number, number> = {};
      (prog || []).forEach((p: any) => {
        peta[p.kad_index] = Math.max(peta[p.kad_index] || 0, p.mata || 0);
      });
      setMataTerbaik(peta);
    }

    setIsLoading(false);
  };

  const mula = (m: ModBaca) => {
    if (jumlahKad === 0) return;
    setMod(m);
    setIndeks(0);
    setFlip(false);
    setSesiMata(0);
    setFasa('baca');
  };

  const tandaDahBaca = async () => {
    if (sedangSimpan) return;
    const mataBaru = MATA_MOD[mod];
    const mataLama = mataTerbaik[indeks] || 0;

    setSesiMata((v) => v + mataBaru);
    if (mataBaru > mataLama) setMataTerbaik((v) => ({ ...v, [indeks]: mataBaru }));

    if (email && flash?.id && mataBaru > mataLama) {
      setSedangSimpan(true);
      await supabase.from('rulaf_flashcard_progress').upsert(
        {
          email,
          flashcard_id: flash.id,
          kad_index: indeks,
          mod,
          mata: mataBaru,
          dikemas_kini: new Date().toISOString(),
        },
        { onConflict: 'email,flashcard_id,kad_index' }
      );
      setSedangSimpan(false);
    }

    if (indeks + 1 < jumlahKad) {
      setIndeks((v) => v + 1);
      setFlip(false);
    } else {
      setFasa('tamat');
    }
  };

  const jumlahTerbaik = Object.values(mataTerbaik).reduce((a, b) => a + b, 0);
  const maxMata = jumlahKad * 3;
  const peratus = maxMata > 0 ? Math.min(100, Math.round((jumlahTerbaik / maxMata) * 100)) : 0;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center">
        <p className="text-sm text-gray-500 animate-pulse">Memuatkan kad…</p>
      </main>
    );
  }

  if (!flash) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-4xl">🃏</p>
        <p className="font-bold text-gray-800 dark:text-gray-200">Flashcard tidak dijumpai.</p>
        <Link href="/flashcard" className="text-xs font-black text-purple-600 hover:underline">← Kembali ke senarai</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-gray-50 dark:from-[#151024] dark:to-[#0F1419] pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/flashcard" className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline">
            ← Semua Flashcard
          </Link>
          <span className="text-[11px] font-black bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300">
            ⭐ {jumlahTerbaik}/{maxMata} mata
          </span>
        </div>

        <div className="text-center mt-5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{flash.tajuk}</h1>
          <p className="text-xs text-gray-500 mt-1">{flash.subjek || 'Umum'} · {flash.darjah || 'Umum'} · {jumlahKad} kad</p>
          {flash.deskripsi && <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">{flash.deskripsi}</p>}
        </div>

        {fasa === 'pilih' && (
          <div className="mt-8 space-y-4">
            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">Pilih cara bacaan kamu</p>
              <p className="text-[11px] text-gray-500 mt-1">Mata lebih tinggi bila kamu berani baca tulisan Jawi. Pilih dengan jujur ya!</p>

              <div className="mt-4 space-y-3">
                {(['jawi', 'dwi', 'rumi'] as ModBaca[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => mula(m)}
                    className={`w-full text-left border-2 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] border-gray-200 dark:border-gray-800 ${LABEL_MOD[m].warna}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{LABEL_MOD[m].ikon}</span>
                        <div>
                          <p className="font-black text-sm text-gray-900 dark:text-white">{LABEL_MOD[m].tajuk}</p>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300">{LABEL_MOD[m].nota}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-black bg-white/80 dark:bg-black/30 px-2.5 py-1 rounded-full text-gray-800 dark:text-gray-100">
                        +{MATA_MOD[m]} mata/kad
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
              <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${peratus}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5">Kemajuan terbaik kamu: {peratus}% ({jumlahTerbaik}/{maxMata} mata)</p>
            </div>

            {flash.kuiz_id && (
              <div className="text-center">
                <Link href={`/permainan/${flash.kuiz_id}`} className="text-xs font-black text-purple-600 dark:text-purple-300 hover:underline">
                  🎮 Atau terus ke kuiz{kuizTajuk ? `: ${kuizTajuk}` : ''} →
                </Link>
              </div>
            )}
          </div>
        )}

        {fasa === 'baca' && jumlahKad > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
              <span>Kad {indeks + 1} / {jumlahKad}</span>
              <span>{LABEL_MOD[mod].ikon} {LABEL_MOD[mod].tajuk} · +{MATA_MOD[mod]} mata</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                style={{ width: `${Math.round(((indeks + (flip ? 1 : 0)) / jumlahKad) * 100)}%` }}
              />
            </div>

            <div
              className="relative w-full cursor-pointer select-none"
              style={{ perspective: '1400px', minHeight: '340px' }}
              onClick={() => setFlip((v) => !v)}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '340px',
                }}
              >
                {/* Depan — teks mengikut mod bacaan */}
                <div
                  className="absolute inset-0 bg-white dark:bg-[#171A21] border-2 border-violet-300 dark:border-violet-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {(mod === 'jawi' || mod === 'dwi') && kadSemasa.jawi && (
                    <p dir="rtl" lang="ar" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed">
                      {kadSemasa.jawi}
                    </p>
                  )}
                  {(mod === 'rumi' || mod === 'dwi') && kadSemasa.rumi && (
                    <p className={`text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 ${mod === 'dwi' ? 'mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700' : ''}`}>
                      {kadSemasa.rumi}
                    </p>
                  )}
                  {kadSemasa.img && (
                    <img src={kadSemasa.img} alt="Ilustrasi kad" className="max-h-40 mt-4 rounded-xl border border-gray-200 dark:border-gray-700 object-contain" />
                  )}
                  <p className="absolute bottom-4 text-[10px] text-gray-400">👆 Tekan kad untuk lihat maksud</p>
                </div>

                {/* Belakang — nota / maksud */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white shadow-xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Maksud / Nota</p>
                  <p className="text-base sm:text-lg font-semibold leading-relaxed mt-3">
                    {kadSemasa.nota || 'Tiada nota tambahan untuk kad ini.'}
                  </p>
                  <p className="absolute bottom-4 text-[10px] text-white/70">👆 Tekan lagi untuk kembali</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setFlip(true)}
                disabled={flip}
                className="flex-1 bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black py-3 rounded-xl disabled:opacity-40 hover:border-violet-400 transition-all"
              >
                👀 Lihat Maksud
              </button>
              <button
                onClick={tandaDahBaca}
                disabled={!flip || sedangSimpan}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95"
              >
                {sedangSimpan ? 'Menyimpan…' : `✅ Dah Baca — +${MATA_MOD[mod]} mata`}
              </button>
            </div>
            {!flip && <p className="text-center text-[10px] text-gray-400 mt-2">Buka maksud kad dahulu sebelum tandakan selesai.</p>}
          </div>
        )}

        {fasa === 'tamat' && (
          <div className="mt-8 bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-3xl p-7 text-center">
            <p className="text-5xl">🎉</p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mt-3">Hebat! Semua kad selesai!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Kamu dapat <span className="font-black text-purple-600 dark:text-purple-300">⭐ {sesiMata} mata</span> dalam sesi ini.
            </p>

            <div className="mt-5 bg-gray-50 dark:bg-[#0F1419] rounded-2xl p-4">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${peratus}%` }} />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Rekod terbaik: {jumlahTerbaik}/{maxMata} mata ({peratus}%)</p>
            </div>

            {flash.kuiz_id ? (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Sedia untuk uji diri? 🎮</p>
                <Link
                  href={`/permainan/${flash.kuiz_id}`}
                  className="block w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-black py-3.5 rounded-2xl transition-all active:scale-95"
                >
                  🎮 Main Kuiz{kuizTajuk ? `: ${kuizTajuk}` : ''}
                </Link>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 mt-6">Guru belum pautkan kuiz untuk koleksi ini.</p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setFasa('pilih'); setIndeks(0); setFlip(false); setSesiMata(0); }}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black py-2.5 rounded-xl hover:border-violet-400 transition-all"
              >
                🔁 Ulang Ulangkaji
              </button>
              <Link
                href="/flashcard"
                className="flex-1 text-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black py-2.5 rounded-xl hover:border-violet-400 transition-all"
              >
                ← Senarai Flashcard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
