'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Pastikan path ini betul

export default function RepositoryPage() {
  const [activeTab, setActiveTab] = useState('repository');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State untuk Data
  const [bahanRepo, setBahanRepo] = useState<any[]>([]);
  const [forumTopik, setForumTopik] = useState<any[]>([]);

  // Semak status log masuk pengguna (Auth)
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsLoggedIn(true);
    }
    checkUser();
    
    // (Di sini bosskur boleh masukkan fungsi fetch data dari Supabase untuk jadual 'rulaf_repo' dan 'rulaf_forum')
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      {/* Header Terminal */}
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-hub(1) - Open Repository & Forum</span>
          <span>PAK21 COLLABORATION SPACE</span>
        </div>

        <div className="p-8">
          {/* Penerangan Direktori */}
          <div className="mb-8 border-b border-gray-700 pb-4">
            <h1 className="text-2xl font-black text-white mb-2">RuLaF<span className="text-[#1793D1]">Hub</span> Open Source</h1>
            <p className="text-gray-400 text-sm">
              Sistem repositori awam dan forum perbincangan untuk perkongsian modul digital, inovasi Jawi, dan pedagogi PAK21. 
              {isLoggedIn ? (
                <span className="text-green-400 ml-2">[ Akses Muat Naik Dibenarkan ]</span>
              ) : (
                <span className="text-red-400 ml-2">[ Sila log masuk untuk berkongsi bahan ]</span>
              )}
            </p>
          </div>

          {/* Sistem Tab Ala Terminal */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setActiveTab('repository')}
              className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'repository' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}
            >
              [ BROWSE REPOSITORY ]
            </button>
            <button 
              onClick={() => setActiveTab('forum')}
              className={`px-4 py-2 font-bold transition-colors border ${activeTab === 'forum' ? 'bg-[#1793D1] text-[#0F1419] border-[#1793D1]' : 'bg-transparent text-[#1793D1] border-gray-700 hover:border-[#1793D1]'}`}
            >
              [ COMMUNITY FORUM ]
            </button>
          </div>

          {/* KANDUNGAN REPOSITORI */}
          {activeTab === 'repository' && (
            <div>
              {isLoggedIn && (
                <div className="mb-6 p-4 bg-black border border-gray-700 border-l-4 border-l-[#1793D1]">
                  <h3 className="text-white font-bold mb-2">++ PUSH BAHAN BAHARU</h3>
                  <input type="text" placeholder="Tajuk Modul / Inovasi..." className="w-full mb-2 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                  <input type="text" placeholder="Pautan (Link) Muat Turun (Google Drive / Supabase)..." className="w-full mb-2 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                  <button className="bg-[#1793D1] text-black px-4 py-2 font-bold hover:bg-blue-400">Push to Branch</button>
                </div>
              )}
              
              {/* Senarai Bahan Dummy */}
              <div className="space-y-4">
                <div className="p-4 border border-gray-800 hover:bg-gray-900 transition-colors">
                  <h4 className="text-lg font-bold text-white flex justify-between">
                    <span>Modul Jawi Tahap 3 (PAK21)</span>
                    <span className="text-xs text-green-400 font-normal">v1.0.0</span>
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">Sumbangan: Cikgu Mail | Kategori: Lembaran Kerja</p>
                  <a href="#" className="text-[#1793D1] text-sm mt-3 inline-block hover:underline">[ wget / muat turun ]</a>
                </div>
              </div>
            </div>
          )}

          {/* KANDUNGAN FORUM */}
          {activeTab === 'forum' && (
            <div>
              {isLoggedIn && (
                <div className="mb-6 p-4 bg-black border border-gray-700 border-l-4 border-l-purple-500">
                  <h3 className="text-white font-bold mb-2">++ BUKA TOPIK PERBINCANGAN</h3>
                  <input type="text" placeholder="Tajuk Perbincangan..." className="w-full mb-2 p-2 bg-gray-900 border border-gray-700 text-white outline-none" />
                  <textarea placeholder="Huraian / Soalan..." className="w-full mb-2 p-2 bg-gray-900 border border-gray-700 text-white outline-none h-24"></textarea>
                  <button className="bg-purple-600 text-white px-4 py-2 font-bold hover:bg-purple-500">Post Thread</button>
                </div>
              )}
              
              {/* Senarai Topik Dummy */}
              <div className="space-y-4">
                <div className="p-4 border border-gray-800 hover:bg-gray-900 transition-colors">
                  <h4 className="text-lg font-bold text-purple-400">Cara berkesan ajar huruf bersambung?</h4>
                  <p className="text-sm text-gray-400 mt-1">Topik oleh: Ustazah Salmah | Balasan: 5</p>
                  <p className="text-sm text-gray-300 mt-3 border-t border-gray-800 pt-2">Ada sesiapa boleh kongsikan teknik gamifikasi untuk tajuk ini?</p>
                  <a href="#" className="text-purple-400 text-sm mt-3 inline-block hover:underline">[ sudo reply ]</a>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-10 pt-4 border-t border-gray-700">
            <a href="/" className="text-gray-500 hover:text-[#1793D1] text-sm font-bold">
              [ RETURN TO MAIN DIRECTORY ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}