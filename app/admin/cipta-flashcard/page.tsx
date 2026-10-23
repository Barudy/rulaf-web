'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ialahAdmin } from '../../lib/akses';

type Kad = { jawi: string; rumi: string; nota: string; img: string };

const kadKosong = (): Kad => ({ jawi: '', rumi: '', nota: '', img: '' });

export default function CiptaFlashcardPage() {
  const [email, setEmail] = useState('');
  const [bolehAkses, setBolehAkses] = useState<boolean | null>(null);
  const [senaraiKuiz, setSenaraiKuiz] = useState<any[]>([]);

  const [tajuk, setTajuk] = useState('');
  const [subjek, setSubjek] = useState('Sirah');
  const [darjah, setDarjah] = useState('UPKK');
  const [deskripsi, setDeskripsi] = useState('');
  const [kuizId, setKuizId] = useState('');
  const [kad, setKad] = useState<Kad[]>([kadKosong()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    semakAkses();
  }, []);

  const semakAkses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const emel = session?.user?.email || '';
    setEmail(emel);

    if (!emel) { setBolehAkses(false); return; }

    const { data: profil } = await supabase
      .from('profil_pengguna')
      .select('peranan')
      .eq('email', emel)
      .maybeSingle();

    const lulus = ialahAdmin(emel) || profil?.peranan === 'Guru' || profil?.peranan === 'Admin';
    setBolehAkses(lulus);

    if (lulus) {
      const { data } = await supabase
        .from('rulaf_kuiz')
        .select('id, tajuk')
        .order('created_at', { ascending: false });
      setSenaraiKuiz(data || []);
    }
  };

  const ubahKad = (idx: number, medan: keyof Kad, nilai: string) => {
    setKad((prev) => prev.map((k, i) => (i === idx ? { ...k, [medan]: nilai } : k)));
  };

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tajuk.trim()) return alert('Sila masukkan tajuk koleksi flashcard.');
    const kadBersih = kad.filter((k) => k.jawi.trim() || k.rumi.trim());
    if (kadBersih.length === 0) return alert('Sekurang-kurangnya satu kad perlu ada tulisan Jawi atau Rumi.');

    setIsSaving(true);
    const { error } = await supabase.from('rulaf_flashcard').insert([{
      tajuk: tajuk.trim(),
      subjek: subjek.trim() || 'Umum',
      darjah: darjah.trim() || 'Umum',
      deskripsi: deskripsi.trim() || null,
      kuiz_id: kuizId ? String(kuizId) : null,
      pencipta: email,
      kad: kadBersih.map((k) => ({
        jawi: k.jawi.trim(),
        rumi: k.rumi.trim(),
        nota: k.nota.trim(),
        img: k.img.trim(),
      })),
    }]);
    setIsSaving(false);

    if (error) {
      alert('Ralat menyimpan flashcard: ' + error.message);
      return;
    }

    alert('🎉 Flashcard berjaya diterbitkan!');
    setTajuk('');
    setDeskripsi('');
    setKuizId('');
    setKad([kadKosong()]);
  };

  if (bolehAkses === null) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center">
        <p className="text-sm text-gray-500 animate-pulse">Menyemak akses…</p>
      </main>
    );
  }

  if (!bolehAkses) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-4xl">🔒</p>
        <p className="font-bold text-gray-800 dark:text-gray-200">Hanya Guru atau Admin boleh mencipta flashcard.</p>
        <Link href={email ? '/flashcard' : '/login'} className="text-xs font-black text-purple-600 hover:underline">
          {email ? '← Kembali ke Flashcard' : 'Log masuk dahulu →'}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] pb-16">
      <section className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Pencipta Kandungan</p>
              <h1 className="text-2xl font-black mt-1">🃏 Cipta Flashcard</h1>
            </div>
            <Link href="/flashcard" className="text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-2 rounded-lg">
              ← Senarai
            </Link>
          </div>
          <p className="text-xs text-white/80 mt-2">
            Bina koleksi kad ulangkaji. Murid dapat 3 mata/kad (Jawi), 2 mata (Dwi), 1 mata (Rumi).
          </p>
        </div>
      </section>

      <form onSubmit={simpan} className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 space-y-5">
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">Maklumat Koleksi</h2>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Tajuk Flashcard *</label>
            <input
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="Cth: Perjanjian Hudaibiah"
              className="w-full bg-gray-50 dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Subjek</label>
              <input
                value={subjek}
                onChange={(e) => setSubjek(e.target.value)}
                placeholder="Sirah / Jawi / Arab"
                className="w-full bg-gray-50 dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Darjah / Peringkat</label>
              <input
                value={darjah}
                onChange={(e) => setDarjah(e.target.value)}
                placeholder="UPKK / 4 / 5"
                className="w-full bg-gray-50 dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Deskripsi Ringkas</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
              placeholder="Apa yang murid akan belajar?"
              className="w-full bg-gray-50 dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Pautkan Kuiz (pilihan)</label>
            <select
              value={kuizId}
              onChange={(e) => setKuizId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0F1419] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none"
            >
              <option value="">— Tiada kuiz —</option>
              {senaraiKuiz.map((k) => (
                <option key={k.id} value={k.id}>{k.tajuk}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Selepas murid habis baca semua kad, butang kuiz ini akan muncul.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">Kad Ulangkaji ({kad.length})</h2>
            <button
              type="button"
              onClick={() => setKad((v) => [...v, kadKosong()])}
              className="text-[11px] font-black text-violet-600 hover:underline"
            >
              + Tambah Kad
            </button>
          </div>

          {kad.map((k, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3 bg-gray-50/60 dark:bg-[#0F1419]/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-600 dark:text-gray-300">🃏 Kad {idx + 1}</span>
                {kad.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setKad((v) => v.filter((_, i) => i !== idx))}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Buang
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-600 mb-1">🕌 Tulisan Jawi</label>
                  <input
                    dir="rtl"
                    lang="ar"
                    value={k.jawi}
                    onChange={(e) => ubahKad(idx, 'jawi', e.target.value)}
                    placeholder="صلح حديبية"
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-right text-gray-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-sky-600 mb-1">🔤 Tulisan Rumi</label>
                  <input
                    value={k.rumi}
                    onChange={(e) => ubahKad(idx, 'rumi', e.target.value)}
                    placeholder="Perjanjian Hudaibiah"
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">📝 Maksud / Nota</label>
                <textarea
                  value={k.nota}
                  onChange={(e) => ubahKad(idx, 'nota', e.target.value)}
                  rows={2}
                  placeholder="Penerangan ringkas untuk murid…"
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">🖼️ Pautan Gambar (pilihan)</label>
                <input
                  type="url"
                  value={k.img}
                  onChange={(e) => ubahKad(idx, 'img', e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-violet-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-black py-3.5 rounded-2xl transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {isSaving ? 'Menyimpan…' : '🚀 Terbitkan Flashcard'}
        </button>
      </form>
    </main>
  );
}
