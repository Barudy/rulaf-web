'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Sesuaikan path mengikut lokasi folder 'lib' anda
import Link from 'next/link';

export default function RepositoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [carianRepo, setCarianRepo] = useState('');

  // State borang tambah BBM
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');

  useEffect(() => {
    semakUser();
    tarikDataRepo();
  }, []);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      setUserEmail(session.user.email || 'Pendidik RuLaF');
    }
  };

  const tarikDataRepo = async () => {
    const { data } = await supabase
      .from('rulaf_repo')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBahanRepo(data);
  };

  const pushRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tajukRepo || !pautanRepo) return alert('[!] Sila isi Tajuk dan Pautan Google Drive!');
    
    const { error } = await supabase.from('rulaf_repo').insert([
      {
        tajuk: tajukRepo,
        pautan: pautanRepo,
        penyumbang: userEmail,
        subjek: subjekRepo,
        darjah: darjahRepo,
        topik: topikRepo
      }
    ]);

    if (error) {
      alert('Ralat: ' + error.message);
    } else {
      alert('🎉 BBM Berjaya disumbangkan ke repositori komuniti!');
      setTajukRepo('');
      setPautanRepo('');
      setTopikRepo('');
      tarikDataRepo();
    }
  };

  const repoDitapis = bahanRepo.filter(repo =>
    repo.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
    repo.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
    repo.topik?.toLowerCase().includes(carianRepo.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)] overflow-hidden">
        
        {/* Banner Atas */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-3 flex justify-between items-center font-bold text-sm">
          <span>📂 RULAF-HUB :: REPOSITORI BBM DIGITAL</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Selamat datang ke pusat perkongsian Bahan Bantu Mengajar (BBM) RuLaF. Di sini para pendidik boleh memuat turun risalah latihan, kuiz phygital, dan kod permainan Jawi secara percuma. Sila kongsikan pautan terus kepada ibu bapa untuk kemudahan akses!
          </p>

          {/* BORANG SUMBANG BBM (Hanya muncul jika sudah log masuk) */}
          {isLoggedIn ? (
            <form onSubmit={pushRepo} className="bg-[#11141b] border border-gray-800 p-6 rounded mb-8">
              <h3 className="text-white font-bold text-lg mb-4">🚀 Sumbang BBM Baharu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tajuk Bahan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Latihan Jawi Imbuhan Awalan"
                    value={tajukRepo}
                    onChange={(e) => setTajukRepo(e.target.value)}
                    className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pautan BBM (Google Drive / Canva / Quizizz)</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={pautanRepo}
                    onChange={(e) => setPautanRepo(e.target.value)}
                    className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Subjek</label>
                  <select
                    value={subjekRepo}
                    onChange={(e) => setSubjekRepo(e.target.value)}
                    className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  >
                    <option value="Jawi">Jawi</option>
                    <option value="Ibadat">Ibadat</option>
                    <option value="Bahasa Arab">Bahasa Arab</option>
                    <option value="Tauhid">Tauhid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Peringkat Kelas</label>
                  <select
                    value={darjahRepo}
                    onChange={(e) => setDarjahRepo(e.target.value)}
                    className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  >
                    <option value="Darjah 1">Darjah 1</option>
                    <option value="Darjah 2">Darjah 2</option>
                    <option value="Darjah 3">Darjah 3</option>
                    <option value="Darjah 4">Darjah 4</option>
                    <option value="Darjah 5">Darjah 5</option>
                    <option value="Darjah 6">Darjah 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nama Topik / Bab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hadas Besar / Gerhana"
                    value={topikRepo}
                    onChange={(e) => setTopikRepo(e.target.value)}
                    className="w-full bg-[#171A21] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#1793D1] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#1793D1] text-[#0F1419] font-bold px-5 py-2 rounded text-sm hover:bg-[#1272ab] transition-colors"
              >
                [ + Terbitkan BBM ]
              </button>
            </form>
          ) : (
            <div className="bg-[#11141b] border border-gray-800 p-4 rounded mb-8 text-center text-sm">
              🔑 Sila <a href="/login" className="text-[#1793D1] hover:underline">Log Masuk</a> untuk menyumbangkan bahan bantu mengajar (BBM) anda kepada komuniti.
            </div>
          )}

          {/* BAR CARIAN */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Cari BBM berdasarkan tajuk, subjek atau topik (cth: Jawi, Hadas)..."
              value={carianRepo}
              onChange={(e) => setCarianRepo(e.target.value)}
              className="w-full bg-[#11141b] border border-gray-800 rounded px-4 py-3 text-white focus:border-[#1793D1] focus:outline-none placeholder-gray-600 text-sm"
            />
          </div>

          {/* SENARAI BBM */}
          <div className="space-y-4">
            {repoDitapis.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Tiada bahan bantuan mengajar ditemui.</p>
            ) : (
              repoDitapis.map((repo) => (
                <div key={repo.id} className="bg-[#11141b] p-5 border border-gray-800 rounded hover:border-[#1793D1]/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] text-xs px-2.5 py-1 rounded font-bold mb-2">
                        {repo.subjek} - {repo.darjah}
                      </span>
                      <h2 className="text-lg font-bold text-white mb-1 hover:text-[#1793D1] transition-colors">
                        {repo.tajuk}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Topik: {repo.topik || 'Umum'} | Penyumbang: {repo.penyumbang}
                      </p>
                    </div>
                    <div>
                      {/* BUTANG DETAIL SPESIFIK */}
                      <Link
                        href={`/repo/bbm/${repo.id}`}
                        className="block text-center bg-gray-800 text-gray-200 hover:bg-[#1793D1] hover:text-[#0F1419] px-4 py-2 text-xs rounded font-bold transition-all"
                      >
                        [ Lihat Pautan Spesifik ]
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