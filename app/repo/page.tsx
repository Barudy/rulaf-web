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
  const [tajukForum, setTajukForum] = useState('');
  const [soalanForum, setSoalanForum] = useState('');
  
  // State BARU untuk paparan Komen
  const [topikPilihan, setTopikPilihan] = useState<any>(null);
  const [senaraiKomen, setSenaraiKomen] = useState<any[]>([]);
  const [teksKomen, setTeksKomen] = useState('');

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
    const { error } = await supabase.from('rulaf_repo').insert([{ tajuk: tajukRepo, pautan: pautanRepo, penyumbang: userEmail }]);
    if (error) alert('Ralat: ' + error.message);
    else { setTajukRepo(''); setPautanRepo(''); tarikDataRepo(); }
  };

  const postForum = async () => {
    if (!tajukForum || !soalanForum) return alert('Sila isi semua maklumat!');
    const { error } = await supabase.from('rulaf_forum').insert([{ tajuk: tajukForum, soalan: soalanForum, penulis: userEmail }]);
    if (error) alert('Ralat: ' + error.message);
    else { setTajukForum(''); setSoalanForum(''); tarikDataForum(); }
  };

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

          {/* BAHAGIAN REPOSITORI */}
          {activeTab === 'repository' && (
            <div>
              {isLoggedIn && (
                <div className="mb-8 p-4 bg-black border border-gray-700 border-l-4 border-l-[#1793D1]">
                  <h3 className="text-white font-bold mb-3">++ PUSH BAHAN BAHARU</h3>
                  <input type="text" value={tajukRepo} onChange={(e)=>setTajukRepo(e.target.value)} placeholder="Tajuk Modul..." className="w-full mb-3 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                  <input type="text" value={pautanRepo} onChange={(e)=>setPautanRepo(e.target.value)} placeholder="Link Muat Turun..." className="w-full mb-3 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                  <button onClick={pushRepo} className="bg-[#1793D1] text-black px-4 py-2 font-bold hover:bg-blue-400">Push to Branch</button>
                </div>
              )}

              <div className="space-y-4">
                {bahanRepo.map((repo) => (
                  <div key={repo.id} className="p-4 border border-gray-800 hover:bg-gray-900 transition-colors">
                    <h4 className="text-lg font-bold text-white flex justify-between">
                      <span>{repo.tajuk}</span>
                      <span className="text-xs text-gray-500">{new Date(repo.created_at).toLocaleDateString('ms-MY')}</span>
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">Sumbangan: {repo.penyumbang}</p>
                    <a href={repo.pautan} target="_blank" rel="noopener noreferrer" className="text-[#1793D1] text-sm mt-3 inline-block font-bold hover:underline">[ wget / muat turun ]</a>
                  </div>
                ))}
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
                        <p className="text-xs text-green-400 mb-2 font-bold">> {k.penulis}</p>
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