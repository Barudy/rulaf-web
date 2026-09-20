'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import CountDownUpkk from '@/components/CountDownUpkk';
import { ialahAdmin } from '../lib/akses';

export default function ForumPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [forumTopik, setForumTopik] = useState<any[]>([]);
  const [carianForum, setCarianForum] = useState('');
  const [peranan, setPeranan] = useState<string>('');
  const [subjekAktif, setSubjekAktif] = useState<string | null>(null);

  // State borang tambah topik
  const [tajukForum, setTajukForum] = useState('');
  const [soalanForum, setSoalanForum] = useState('');
  const [subjekForum, setSubjekForum] = useState('Jawi');
  const [darjahForum, setDarjahForum] = useState('Darjah 3');
  const [kategoriForum, setKategoriForum] = useState('QNA');

  useEffect(() => {
    semakUser();
    tarikDataForum();
  }, []);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      const emailUser = session.user.email || 'Pendidik RuLaF';
      setUserEmail(emailUser);

      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailUser)
        .maybeSingle();

      if (profil && profil.peranan) {
        setPeranan(profil.peranan);
      } else {
        setPeranan(ialahAdmin(emailUser) ? 'Guru' : 'Murid');
      }
    }
  };

  const tarikDataForum = async () => {
    const { data } = await supabase
      .from('rulaf_forum')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setForumTopik(data);
  };

  const postForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (peranan !== 'Guru') return alert('[!] Hak akses disekat: Hanya Guru sahaja dibenarkan membuka forum perbincangan baharu!');
    if (!tajukForum || !soalanForum) return alert('[!] Sila isi Tajuk dan Soalan Perbincangan!');

    const { error } = await supabase.from('rulaf_forum').insert([
      {
        tajuk: tajukForum,
        soalan: soalanForum,
        penulis: userEmail,
        subjek: subjekForum,
        darjah: darjahForum,
        kategori: kategoriForum
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('🎉 Topik perbincangan berjaya dibuka pada portal!');
      setTajukForum('');
      setSoalanForum('');
      tarikDataForum();
    }
  };

  const forumDitapis = forumTopik.filter(forum =>
    (subjekAktif === null || forum.subjek === subjekAktif) &&
    (
      forum.tajuk.toLowerCase().includes(carianForum.toLowerCase()) ||
      forum.kategori?.toLowerCase().includes(carianForum.toLowerCase()) ||
      forum.subjek?.toLowerCase().includes(carianForum.toLowerCase()) ||
      forum.darjah?.toLowerCase().includes(carianForum.toLowerCase())
    )
  );

  // 🗂️ Kumpulan Mengikut Subjek (Format Forum Tersusun / Stacked)
  const senaraiSubjek = Array.from(new Set(forumTopik.map(f => f.subjek || 'Umum'))).sort();
  const kumpulanSubjek = senaraiSubjek.map(subjek => ({
    subjek,
    topik: forumDitapis.filter(f => (f.subjek || 'Umum') === subjek)
  })).filter(g => g.topik.length > 0);

  const totalTopik = forumDitapis.length;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        <CountDownUpkk />
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>💬 RULAF-HUB :: FORUM KOMUNITI BERSUSUN (STACKED)</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Pusat perbincangan komuniti yang dianjurkan mengikut <strong className="text-[#1793D1]">subjek & topik</strong> yang tersusun. Sila pilih subjek untuk menapis perbincangan, atau mulakan topik baharu di bawah.
          </p>

          {/* BORANG BUKA TOPIK FORUM (Hanya muncul jika sudah log masuk & adalah GURU) */}
          {isLoggedIn && peranan === 'Guru' ? (
            <form onSubmit={postForum} className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-6 rounded mb-8 transition-colors duration-300">
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">💬 Buka Perbincangan Baharu</h3>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tajuk Isu / Soalan</label>
                <input
                  type="text"
                  placeholder="Contoh: Bagaimana cara mengeja perkataan 'Masyarakat'?"
                  value={tajukForum}
                  onChange={(e) => setTajukForum(e.target.value)}
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Butiran Penjelasan</label>
                <textarea
                  rows={4}
                  placeholder="Terangkan secara terperinci ralat atau soalan yang ingin dibincangkan..."
                  value={soalanForum}
                  onChange={(e) => setSoalanForum(e.target.value)}
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kategori Perbincangan</label>
                  <select
                    value={kategoriForum}
                    onChange={(e) => setKategoriForum(e.target.value)}
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  >
                    <option value="QNA">Soal Jawab (Q&A)</option>
                    <option value="Perbincangan">Perbincangan Umum</option>
                    <option value="Pengumuman">Hebahan / Hebahan Sekolah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Subjek Berkaitan</label>
                  <select
                    value={subjekForum}
                    onChange={(e) => setSubjekForum(e.target.value)}
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  >
                    <option value="Jawi">Jawi</option>
                    <option value="Ibadat">Ibadat</option>
                    <option value="Bahasa Arab">Bahasa Arab</option>
                    <option value="Tauhid">Tauhid</option>
                    <option value="Umum">Umum / Tiada Kaitan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Peringkat Kelas</label>
                  <select
                    value={darjahForum}
                    onChange={(e) => setDarjahForum(e.target.value)}
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  >
                    <option value="Darjah 1">Darjah 1</option>
                    <option value="Darjah 2">Darjah 2</option>
                    <option value="Darjah 3">Darjah 3</option>
                    <option value="Darjah 4">Darjah 4</option>
                    <option value="Darjah 5">Darjah 5</option>
                    <option value="Darjah 6">Darjah 6</option>
                    <option value="Semua">Semua Tahap</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
              >
                [ + Terbitkan Topik ]
              </button>
            </form>
          ) : isLoggedIn && peranan === 'Murid' ? (
            <div className="bg-blue-100/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded mb-8 text-center text-sm text-blue-800 dark:text-blue-300 font-sans transition-colors duration-300">
              🎓 Anda telah log masuk sebagai <strong>Murid ({userEmail})</strong> :: Hak Akses Terhad (Anda dibenarkan membaca topik dan membalas ulasan komen sahaja).
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 p-4 rounded mb-8 text-center text-sm transition-colors duration-300">
              🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline font-bold">Log Masuk</a> sebagai Guru untuk membuka topik perbincangan baharu.
            </div>
          )}

          {/* BAR CARIAN FORUM */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari isu forum berdasarkan tajuk, kategori, subjek atau darjah..."
              value={carianForum}
              onChange={(e) => setCarianForum(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-500 text-sm transition-colors duration-300"
            />
          </div>

          {/* FILTER SUBJEK (CHIPS) */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Tapis Subjek:</span>
            <button
              onClick={() => setSubjekAktif(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                subjekAktif === null
                  ? 'bg-[#1793D1] text-white border-[#1793D1]'
                  : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-[#1793D1]'
              }`}
            >
              Semua ({totalTopik})
            </button>
            {senaraiSubjek.map((subjek) => {
              const bilangan = forumTopik.filter(f => (f.subjek || 'Umum') === subjek).length;
              return (
                <button
                  key={subjek}
                  onClick={() => setSubjekAktif(subjekAktif === subjek ? null : subjek)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    subjekAktif === subjek
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-[#1793D1]'
                  }`}
                >
                  {subjek} ({bilangan})
                </button>
              );
            })}
          </div>

          {/* FORUM BERSUSUN MENGIKUT SUBJEK */}
          {kumpulanSubjek.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-10">Tiada isu perbincangan ditemui.</p>
          ) : (
            <div className="space-y-8">
              {kumpulanSubjek.map((kumpulan) => (
                <section key={kumpulan.subjek} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-[#11141b]/40">
                  {/* Pengepala Stack (Subjek) */}
                  <header className="bg-gradient-to-r from-[#1793D1]/15 to-transparent border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {kumpulan.subjek.toLowerCase().includes('jawi') ? '📝'
                          : kumpulan.subjek.toLowerCase().includes('ibadat') || kumpulan.subjek.toLowerCase().includes('ibadah') ? '🕌'
                          : kumpulan.subjek.toLowerCase().includes('arab') ? '📖'
                          : '💬'}
                      </span>
                      <div>
                        <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-wide">{kumpulan.subjek}</h2>
                        <p className="text-[10px] text-gray-400 font-bold">{kumpulan.topik.length} topik perbincangan</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1793D1] bg-[#1793D1]/10 px-2 py-1 rounded">STACK</span>
                  </header>

                  {/* Timpukan Topik (Stacked Topics) */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {kumpulan.topik.map((forum) => (
                      <div key={forum.id} className="p-4 sm:p-5 bg-white dark:bg-[#171A21]/60 hover:bg-gray-50 dark:hover:bg-[#171A21] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
                                {forum.kategori || 'QNA'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                {forum.darjah}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                              {forum.tajuk}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {forum.soalan}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 font-sans">
                              Oleh: {forum.penulis} | {new Date(forum.created_at).toLocaleDateString('ms-MY')}
                            </p>
                          </div>
                          <div className="self-end sm:self-center">
                            <Link
                              href={`/forum/${forum.id}`}
                              className="block text-center bg-[#1793D1]/10 text-[#1793D1] border border-[#1793D1]/30 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all duration-300"
                            >
                              [ Buka & Balas ]
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}