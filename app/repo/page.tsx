'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient'; 

export default function RepositoryPage() {
  const [activeTab, setActiveTab] = useState('repository');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      setUserEmail(session.user.email || 'Admin RuLaF');
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
          <a href="/" className="text-white transition-colors">
              [ cd ~ / Kembali ke Laman Utama ]
            </a>
        </div>

        <div className="p-8">
          <div className="mb-8 border-b border-gray-700 pb-4">
            <h1 className="text-2xl font-black text-white mb-2">RuLaF<span className="text-[#1793D1]">Hub</span> Open Source</h1>
          </div>

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
              {isLoggedIn && (
                <div className="bg-gray-800 p-5 border border-gray-700 rounded shadow-lg">
                  <h2 className="text-[#1793D1] font-bold mb-4">~/ Muat Naik BBM Baharu</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Pilihan Subjek */}
                    <select 
                      value={subjekRepo} 
                      onChange={(e) => setSubjekRepo(e.target.value)} 
                      className="p-2 bg-gray-900 border border-gray-600 text-white rounded focus:border-[#1793D1] outline-none"
                    >
                      <option value="Jawi">Jawi</option>
                      <option value="Tauhid">Tauhid</option>
                      <option value="Sirah">Sirah</option>
                      <option value="Al-Quran">Al-Quran</option>
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
          {activeTab === 'forum' && (
            <div>
              {/* JIKA TOPIK DIPILIH (PILIHAN DALAM) */}
              {topikPilihan ? (
                <div>
                  <button onClick={() => setTopikPilihan(null)} className="text-gray-400 hover:text-white mb-4 text-sm font-bold flex items-center gap-2">
                    [ cd .. / kembali ke senarai topik ]
                  </button>
                  
                  {/* Topik Utama */}
                  <div className="p-6 bg-black border border-purple-500 mb-6 rounded-sm">
                    <h2 className="text-xl font-bold text-purple-400 mb-2">{topikPilihan.tajuk}</h2>
                    <p className="text-xs text-gray-500 font-mono mb-4">Oleh: {topikPilihan.penulis} | {new Date(topikPilihan.created_at).toLocaleDateString('ms-MY')}</p>
                    <p className="text-gray-200 whitespace-pre-wrap">{topikPilihan.soalan}</p>
                  </div>

                  {/* Senarai Komen */}
                  <h3 className="text-[#1793D1] font-bold mb-4 border-b border-gray-800 pb-2">THREAD BALASAN:</h3>
                  <div className="space-y-4 mb-8">
                    {senaraiKomen.length > 0 ? senaraiKomen.map((k) => (
                      <div key={k.id} className="p-4 border border-gray-800 bg-[#14181F]">
                        <p className="text-xs text-green-400 mb-2 font-bold"> {k.penulis}</p>
                        <p className="text-sm text-gray-300">{k.komen}</p>
                      </div>
                    )) : <p className="text-gray-500 text-sm">Tiada balasan lagi. Jadilah yang pertama!</p>}
                  </div>

                  {/* Ruang Balas (Hanya jika login) */}
                  {isLoggedIn ? (
                    <div className="p-4 bg-gray-900 border border-gray-700">
                      <textarea value={teksKomen} onChange={(e)=>setTeksKomen(e.target.value)} placeholder="Tulis balasan anda..." className="w-full mb-3 p-3 bg-black border border-gray-700 text-white outline-none h-20 text-sm"></textarea>
                      <button onClick={hantarKomen} className="bg-purple-600 text-white px-4 py-2 font-bold text-sm hover:bg-purple-500">Submit Reply</button>
                    </div>
                  ) : (
                    <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-sm text-center">
                      [ Akses Ditolak: Sila log masuk untuk membalas topik ini ]
                    </div>
                  )}
                </div>

              ) : (
                /* JIKA SENARAI TOPIK (PILIHAN LUAR) */
                <div>
                  {isLoggedIn && (
                    <div className="mb-8 p-4 bg-black border border-gray-700 border-l-4 border-l-purple-500">
                      <h3 className="text-white font-bold mb-3">++ BUKA TOPIK PERBINCANGAN</h3>
                      <input type="text" value={tajukForum} onChange={(e)=>setTajukForum(e.target.value)} placeholder="Tajuk Perbincangan..." className="w-full mb-3 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                      <textarea value={soalanForum} onChange={(e)=>setSoalanForum(e.target.value)} placeholder="Huraian / Soalan..." className="w-full mb-3 p-2 bg-gray-900 border border-gray-700 text-white outline-none h-24"></textarea>
                      <button onClick={postForum} className="bg-purple-600 text-white px-4 py-2 font-bold hover:bg-purple-500">Post Thread</button>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {forumTopik.map((forum) => (
                      <div key={forum.id} className="p-4 border border-gray-800 hover:bg-gray-900 transition-colors">
                        <h4 className="text-lg font-bold text-purple-400 flex justify-between">
                          <span>{forum.tajuk}</span>
                          <span className="text-xs text-gray-500">{new Date(forum.created_at).toLocaleDateString('ms-MY')}</span>
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">Oleh: {forum.penulis}</p>
                        <button onClick={() => bukaTopik(forum)} className="text-purple-400 text-sm mt-3 font-bold hover:underline">
                          [ sudo reply / baca topik ]
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}