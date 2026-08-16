'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Sesuaikan path mengikut lokasi folder 'lib' anda
import Link from 'next/link';

export default function ForumPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [forumTopik, setForumTopik] = useState<any[]>([]);
  const [carianForum, setCarianForum] = useState('');
  const [peranan, setPeranan] = useState<string>(''); // 'Guru' atau 'Murid'

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

      // 🔍 Tarik peranan pengguna dari jadual profil_pengguna di Supabase
      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailUser)
        .maybeSingle();

      if (profil && profil.peranan) {
        setPeranan(profil.peranan);
      } else {
        // Fallback automatik jika tiada rekod dalam profil_pengguna
        if (emailUser.startsWith('admin') || emailUser.includes('ismail') || emailUser.includes('ust_ismail')) {
          setPeranan('Guru');
        } else {
          setPeranan('Murid');
        }
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
    forum.tajuk.toLowerCase().includes(carianForum.toLowerCase()) ||
    forum.kategori?.toLowerCase().includes(carianForum.toLowerCase()) ||
    forum.subjek?.toLowerCase().includes(carianForum.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-sm shadow-md dark:shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden transition-all duration-300">
        
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-white dark:text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>💬 RULAF-HUB :: PORTAL FORUM KOMUNITI Q&A v2.0</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Selamat datang ke pusat perbincangan komuniti guru-guru dan ibu bapa. Di sini anda boleh mengajukan sebarang kekusutan mengenai ejaan Jawi, masalah pendaftaran murid, persediaan praktikum, serta ulasan BBM. Sila mulakan topik baharu di bawah!
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
              placeholder="🔍 Cari isu forum berdasarkan tajuk atau kategori (cth: QNA, Jawi)..."
              value={carianForum}
              onChange={(e) => setCarianForum(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-200 dark:border-gray-800 rounded px-4 py-3 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-500 text-sm transition-colors duration-300"
            />
          </div>

          {/* SENARAI TOPIK FORUM */}
          <div className="space-y-4">
            {forumDitapis.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-10">Tiada isu perbincangan ditemui.</p>
            ) : (
              forumDitapis.map((forum) => (
                <div key={forum.id} className="bg-gray-100 dark:bg-[#11141b]/60 p-5 border border-gray-200 dark:border-gray-800 rounded border-l-4 border-l-[#1793D1] hover:border-[#1793D1]/40 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-[#1793D1]/10 text-[#1793D1] text-[10px] px-2 py-0.5 rounded font-bold">
                          {forum.kategori || 'QNA'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {forum.subjek} - {forum.darjah}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {forum.tajuk}
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {forum.soalan}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-3 font-sans">
                        Oleh: {forum.penulis} | Tarikh: {new Date(forum.created_at).toLocaleDateString('ms-MY')}
                      </p>
                    </div>
                    <div className="self-end sm:self-start">
                      {/* LINK KE HALAMAN SPESIFIK FORUM */}
                      <Link
                        href={`/forum/${forum.id}`}
                        className="block text-center bg-[#1793D1]/10 text-[#1793D1] border border-[#1793D1]/30 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all duration-300"
                      >
                        [ Buka & Balas Komen ]
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
