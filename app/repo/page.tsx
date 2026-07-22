'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient'; 

export default function RepositoryPage() {
  const [activeTab, setActiveTab] = useState('repository');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [forumTopik, setForumTopik] = useState<any[]>([]);
  
  // State untuk Forum & Komen
  const [tajukRepo, setTajukRepo] = useState('');
  const [pautanRepo, setPautanRepo] = useState('');
  const [subjekRepo, setSubjekRepo] = useState('Jawi');
  const [darjahRepo, setDarjahRepo] = useState('Darjah 3');
  const [topikRepo, setTopikRepo] = useState('');

  const [tajukForum, setTajukForum] = useState('');
  const [soalanForum, setSoalanForum] = useState('');
  const [subjekForum, setSubjekForum] = useState('Jawi');
  const [darjahForum, setDarjahForum] = useState('Darjah 3');
  const [kategoriForum, setKategoriForum] = useState('QNA');
  
  // State BARU untuk paparan Komen
  const [topikPilihan, setTopikPilihan] = useState<any>(null);
const [senaraiKomen, setSenaraiKomen] = useState<any[]>([]);
const [teksKomen, setTeksKomen] = useState('');
const [carianRepo, setCarianRepo] = useState('');
const [carianForum, setCarianForum] = useState('');

  useEffect(() => {
    semakUser();
    tarikDataRepo();
    tarikDataForum();
  }, []);

  const semakUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setIsLoggedIn(true);
      const emailPengguna = session.user.email;
      setUserEmail(emailPengguna || 'Pengguna RuLaF');

      // [+] LOGIK RBAC DINAMIK (TARIK DARI SUPABASE)
      // Sistem akan menyemak peranan pengguna dari jadual profil_pengguna
      const { data, error } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', emailPengguna) // Memastikan ia memadankan e-mel yang sedang log masuk
        .single(); // Ambil satu rekod sahaja

      if (error) {
        console.error("Gagal menyemak peranan:", error.message);
      } else if (data && data.peranan === 'Guru') {
        setIsAdmin(true); // Automatik dapat kuasa muat naik jika peranannya 'Guru'
      } else {
        setIsAdmin(false); // Murid atau pengguna biasa tidak dapat kuasa
      }
    }
  };


  const tarikDataRepo = async () => {
    const { data } = await supabase.from('rulaf_repo').select('*').order('created_at', { ascending: false });
    if (data) setBahanRepo(data);
  };

  const tarikDataForum = async () => {
    const { data } = await supabase.from('rulaf_forum').select('*').order('created_at', { ascending: false });
    if (data) setForumTopik(data);
  };

  const pushRepo = async () => {
    if (!tajukRepo || !pautanRepo) return alert('Sila isi semua maklumat!');
    const { error } = await supabase.from('rulaf_repo').insert([{ tajuk: tajukRepo, pautan: pautanRepo, penyumbang: userEmail, subjek: subjekRepo, darjah: darjahRepo, topik: topikRepo }]);
    if (error) alert('Ralat: ' + error.message);
    else { setTajukRepo(''); setPautanRepo(''); tarikDataRepo(); }
  };

  const postForum = async () => {
    if (!tajukForum || !soalanForum) return alert('Sila isi semua maklumat!');
    const { error } = await supabase.from('rulaf_forum').insert([{ tajuk: tajukForum, soalan: soalanForum, penulis: userEmail, subjek: subjekForum, darjah: darjahForum, kategori: kategoriForum }]);
    if (error) alert('Ralat: ' + error.message);
    else { setTajukForum(''); setSoalanForum(''); tarikDataForum(); }
  };

  // [+] FUNGSI TAPISAN (FILTER) UNTUK BAR CARIAN
  const repoDitapis = bahanRepo.filter(repo => 
    repo.tajuk.toLowerCase().includes(carianRepo.toLowerCase()) ||
    repo.subjek?.toLowerCase().includes(carianRepo.toLowerCase()) ||
    repo.topik?.toLowerCase().includes(carianRepo.toLowerCase())
  );

  const forumDitapis = forumTopik.filter(forum => 
    forum.tajuk.toLowerCase().includes(carianForum.toLowerCase()) ||
    forum.kategori?.toLowerCase().includes(carianForum.toLowerCase())
  );


  // Fungsi BARU: Buka Topik dan Tarik Komen
  const bukaTopik = async (forum: any) => {
    setTopikPilihan(forum);
    const { data } = await supabase.from('rulaf_komen').select('*').eq('forum_id', forum.id).order('created_at', { ascending: true });
    if (data) setSenaraiKomen(data);
  };

  // Fungsi BARU: Hantar Komen
  const hantarKomen = async () => {
    if (!teksKomen) return alert('Komen kosong tidak dibenarkan!');
    const { error } = await supabase.from('rulaf_komen').insert([{ forum_id: topikPilihan.id, komen: teksKomen, penulis: userEmail }]);
    if (error) alert('Ralat Komen: ' + error.message);
    else { 
      setTeksKomen(''); 
      bukaTopik(topikPilihan); // Refresh komen
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-hub(1) - Open Repository & Forum</span>
          <span>{isLoggedIn ? `[ LOGGED IN : ${userEmail} ]` : '[ GUEST MODE ]'}</span>
          {/* PERUBAHAN DINAMIK: Butang Log Masuk vs Profil */}
          {isLoggedIn ? (
            <a href="/profil" className="text-white hover:text-black transition-colors">
              [ Profil ]
            </a>
          ) : (
            <a href="/login" className="text-white hover:text-black transition-colors">
              Log Masuk
            </a>
          )}
          
        </div>

        <div className="p-8">
          <div className="mb-8 border-b border-gray-700 pb-4">
            <h1 className="text-2xl font-black text-white mb-2">RuLaF<span className="text-[#1793D1]">Hub</span> Open Source</h1>
          </div>
          <a href="/" className="text-white transition-colors">
              [ cd ~ / Kembali ke Laman Utama ]
            </a>

          <div className="flex gap-4 mb-6">
            <button onClick={() => {setActiveTab('repository'); setTopikPilihan(null);}} className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'repository' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}>
              [ BROWSE REPOSITORY ]
            </button>
            <button onClick={() => {setActiveTab('forum'); setTopikPilihan(null);}} className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'forum' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}>
              [ COMMUNITY FORUM ]
            </button>
          </div>

          {/* ========================================== */}
          {/* TAB 1: PAPARAN REPOSITORY (BBM)              */}
          {/* ========================================== */}
          {activeTab === 'repository' && (
            <div className="mt-6 flex flex-col gap-6">

              {/* --- BAHAGIAN 1: BORANG MUAT NAIK BBM --- */}
              {isAdmin && (
                <div className="bg-gray-800 p-5 border border-gray-700 rounded shadow-lg">
                  <h2 className="text-[#1793D1] font-bold mb-4">~/ Muat Naik BBM Baharu</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Pilihan Subjek */}
                    <select 
                      value={subjekRepo} 
                      onChange={(e) => setSubjekRepo(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none"
                    >
                      <option value="Al-Quran">Al-Quran</option>
                      <option value="Hafazan">Hafazan</option>
                      <option value="Tajwid">Tajwid</option>
                      <option value="Tauhid">Tauhid</option>
                      <option value="Ibadat">Ibadat</option>
                      <option value="Tafsir Al-Quran & Hadis">Tafsir Al-Quran & Hadis</option>
                      <option value="Muamalat">Muamalat</option>
                      <option value="Munakahat">Munakahat</option>
                      <option value="Jenayat">Jenayat</option>
                      <option value="Faraid">Faraid</option>
                      <option value="Amalan Lazim">Amalan Lazim</option>
                      <option value="Bahasa Arab">Bahasa Arab</option>
                      <option value="Akhlak">Akhlak</option>
                      <option value="Sirah">Sirah</option>
                      <option value="Jawi">Jawi</option>
                      <option value="KIJ">KIJ</option>
                    </select>

                    {/* Pilihan Darjah */}
                    <select 
                      value={darjahRepo} 
                      onChange={(e) => setDarjahRepo(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none"
                    >
                      <option value="Darjah 1">Darjah 1</option>
                      <option value="Darjah 2">Darjah 2</option>
                      <option value="Darjah 3">Darjah 3</option>
                      <option value="Darjah 4">Darjah 4</option>
                      <option value="Darjah 5">Darjah 5</option>
                      <option value="Darjah 6">Darjah 6</option>
                    </select>

                    {/* Input Topik */}
                    <input 
                      type="text" 
                      placeholder="Topik (Cth: Hadas)" 
                      value={topikRepo} 
                      onChange={(e) => setTopikRepo(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none" 
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Tajuk Bahan / Modul" 
                      value={tajukRepo} 
                      onChange={(e) => setTajukRepo(e.target.value)} 
                      className="w-full md:w-1/2 p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none" 
                    />
                    <input 
                      type="text" 
                      placeholder="Pautan (Link Google Drive/BBM)" 
                      value={pautanRepo} 
                      onChange={(e) => setPautanRepo(e.target.value)} 
                      className="w-full md:w-1/2 p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none" 
                    />
                  </div>

                  <button 
                    onClick={pushRepo} 
                    className="bg-[#1793D1] text-[#0F1419] px-6 py-2 font-bold rounded hover:bg-blue-400 transition-colors"
                  >
                    [ HANTAR BBM ]
                  </button>
                </div>
              )}

              {/* --- BAHAGIAN 2: BAR CARIAN (SEARCH) --- */}
              <div className="relative z-10 mt-2">
                <input 
                  type="text" 
                  placeholder="Cari BBM... (Cth: Jawi, Hadas, Darjah 3)" 
                  value={carianRepo}
                  onChange={(e) => setCarianRepo(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white border border-[#1793D1] rounded focus:outline-none focus:ring-2 focus:ring-[#1793D1]"
                />
              </div>

              {/* --- BAHAGIAN 3: SENARAI REPO YANG DITAPIS --- */}
              <div className="flex flex-col gap-3">
                {repoDitapis.length > 0 ? (
                  repoDitapis.map((repo, index) => (
                    <div key={index} className="p-4 bg-gray-800 border-l-4 border-[#1793D1] rounded shadow">
                      <h3 className="font-bold text-[#A5B2D9]">
                        <span className="text-[#1793D1]">[{repo.subjek} - {repo.darjah}]</span> {repo.tajuk}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Topik: {repo.topik}</p>
                      <p className="text-xs text-gray-500 mt-2">Penyumbang: {repo.penyumbang}</p>
                      
                      <a 
                        href={repo.pautan} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block mt-3 text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded border border-gray-600 text-white"
                      >
                        Muat Turun
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic mt-4 text-center">Tiada BBM dijumpai untuk carian ini.</p>
                )}
              </div>

            </div>
          )}

          {/* BAHAGIAN FORUM */}
           {/* ========================================== */}
          {/* TAB 2: PAPARAN COMMUNITY FORUM (SENARAI)     */}
          {/* ========================================== */}
          {activeTab === 'forum' && !topikPilihan && (
            <div className="mt-6 flex flex-col gap-6">

              {/* --- BAHAGIAN 1: BORANG BUKA TOPIK FORUM --- */}
              {isAdmin && (
                <div className="bg-gray-800 p-5 border border-gray-700 rounded shadow-lg">
                  <h2 className="text-green-400 font-bold mb-4">~/ Buka Topik / Soalan Baharu</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Pilihan Subjek */}
                    <select 
                      value={subjekForum} 
                      onChange={(e) => setSubjekForum(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-green-500 outline-none"
                    >
                      <option value="Al-Quran">Al-Quran</option>
                      <option value="Hafazan">Hafazan</option>
                      <option value="Tajwid">Tajwid</option>
                      <option value="Tauhid">Tauhid</option>
                      <option value="Ibadat">Ibadat</option>
                      <option value="Tafsir Al-Quran & Hadis">Tafsir Al-Quran & Hadis</option>
                      <option value="Muamalat">Muamalat</option>
                      <option value="Munakahat">Munakahat</option>
                      <option value="Jenayat">Jenayat</option>
                      <option value="Faraid">Faraid</option>
                      <option value="Amalan Lazim">Amalan Lazim</option>
                      <option value="Bahasa Arab">Bahasa Arab</option>
                      <option value="Akhlak">Akhlak</option>
                      <option value="Sirah">Sirah</option>
                      <option value="Jawi">Jawi</option>
                      <option value="KIJ">KIJ</option>
                    </select>

                    {/* Pilihan Darjah */}
                    <select 
                      value={darjahForum} 
                      onChange={(e) => setDarjahForum(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-green-500 outline-none"
                    >
                      <option value="Darjah 1">Darjah 1</option>
                      <option value="Darjah 2">Darjah 2</option>
                      <option value="Darjah 3">Darjah 3</option>
                      <option value="Darjah 4">Darjah 4</option>
                      <option value="Darjah 5">Darjah 5</option>
                      <option value="Darjah 6">Darjah 6</option>
                    </select>

                    {/* Pilihan Kategori */}
                    <select 
                      value={kategoriForum} 
                      onChange={(e) => setKategoriForum(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-green-500 outline-none"
                    >
                      <option value="QNA">QNA (Soal Jawab)</option>
                      <option value="Perbincangan Umum">Perbincangan Umum</option>
                      <option value="Isu Teknikal">Isu Teknikal Modul</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Tajuk Topik..." 
                      value={tajukForum} 
                      onChange={(e) => setTajukForum(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-green-500 outline-none" 
                    />
                    <textarea 
                      placeholder="Penerangan / Soalan anda..." 
                      value={soalanForum} 
                      onChange={(e) => setSoalanForum(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-green-500 outline-none"
                      rows={3}
                    />
                  </div>

                  <button 
                    onClick={postForum} 
                    className="bg-green-500 text-[#0F1419] px-6 py-2 font-bold rounded hover:bg-green-400 transition-colors"
                  >
                    [ HANTAR TOPIK ]
                  </button>
                </div>
              )}

              {/* --- BAHAGIAN 2: BAR CARIAN FORUM --- */}
              <div className="relative z-10 mt-2">
                <input 
                  type="text" 
                  placeholder="Cari Topik... (Cth: QNA, Hadas, Isu Teknikal)" 
                  value={carianForum}
                  onChange={(e) => setCarianForum(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* --- BAHAGIAN 3: SENARAI TOPIK FORUM --- */}
              <div className="flex flex-col gap-3">
                {forumDitapis.length > 0 ? (
                  forumDitapis.map((forum, index) => (
                    <div key={index} className="p-4 bg-gray-800 border-l-4 border-green-500 rounded shadow">
                      <h3 className="font-bold text-[#A5B2D9]">
                        <span className="text-green-400">[{forum.kategori}]</span> {forum.tajuk}
                      </h3>
                      <div className="text-sm text-gray-400 mt-2 flex gap-4">
                        <span>🏷️ {forum.subjek}</span>
                        <span>📚 {forum.darjah}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                        <span>Oleh: {forum.penulis}</span>
                        <button 
                          onClick={() => bukaTopik(forum)} 
                          className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded border border-gray-600 text-white font-bold transition-colors"
                        >
                          [ Buka & Komen ]
                        </button>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic mt-4 text-center">Tiada topik dijumpai untuk carian ini.</p>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2.1: PAPARAN RUANGAN KOMEN (SUB-TAB)     */}
          {/* ========================================== */}
          {activeTab === 'forum' && topikPilihan && (
            <div className="mt-6 flex flex-col gap-4">
              
              {/* Butang Kembali */}
              <button 
                onClick={() => setTopikPilihan(null)} 
                className="self-start text-sm text-gray-400 hover:text-white transition-colors mb-2"
              >
                &lt;-- Kembali ke Senarai Topik
              </button>

              {/* Topik Utama */}
              <div className="p-5 bg-gray-800 border border-green-500 rounded shadow-lg">
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-green-400 mb-1">[{topikPilihan.kategori}] {topikPilihan.tajuk}</h2>
                  <p className="text-xs text-gray-500">Oleh: {topikPilihan.penulis} | {topikPilihan.subjek} - {topikPilihan.darjah}</p>
                </div>
                <p className="text-white whitespace-pre-wrap">{topikPilihan.soalan}</p>
              </div>

              {/* Senarai Komen */}
              <div className="mt-4">
                <h3 className="font-bold text-[#A5B2D9] mb-3">~/ Ruangan Komen ({senaraiKomen.length})</h3>
                <div className="flex flex-col gap-3">
                  {senaraiKomen.length > 0 ? (
                    senaraiKomen.map((komen, index) => (
                      <div key={index} className="p-3 bg-gray-900 border border-gray-700 rounded">
                        <p className="text-xs text-green-400 font-bold mb-1">{komen.penulis}</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{komen.komen}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Belum ada jawapan. Jadilah yang pertama membalas!</p>
                  )}
                </div>
              </div>

              {/* Borang Hantar Komen */}
              {isLoggedIn ? (
                <div className="mt-4 flex flex-col gap-2">
                  <textarea 
                    placeholder="Taip jawapan / komen anda di sini..." 
                    value={teksKomen} 
                    onChange={(e) => setTeksKomen(e.target.value)} 
                    className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded focus:border-green-500 outline-none"
                    rows={3}
                  />
                  <button 
                    onClick={hantarKomen} 
                    className="self-end bg-green-500 text-[#0F1419] px-6 py-2 font-bold rounded hover:bg-green-400 transition-colors"
                  >
                    [ BALAS TOPIK ]
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded text-center">
                  <p className="text-sm text-gray-400">Sila <span className="text-green-400">Log Masuk</span> untuk membalas topik ini.</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}