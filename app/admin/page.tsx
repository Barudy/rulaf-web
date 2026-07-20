'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { useRouter } from 'next/navigation'; // <-- Digunakan untuk fungsi jembatan

export default function AdminPage() {
  const router = useRouter();

  // --- BAHAGIAN KUNCI KESELAMATAN (SUPABASE AUTH) ---
  const [isLocked, setIsLocked] = useState(true);
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- BAHAGIAN CMS BLOG / JURNAL ---
  const [tajukBlog, setTajukBlog] = useState('');
  const [kandunganBlog, setKandunganBlog] = useState('');
  const [statusBlog, setStatusBlog] = useState('');

  useEffect(() => {
    semakSesi();
  }, []);

  // Semak jika admin sudah log masuk sebelum ini
  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLocked(false);
      setEmail(session.user.email || '');
    }
  };

  // Fungsi Log Masuk Rasmi Supabase
  const klikLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg('[!] Akses Ditolak: E-mel atau kata laluan tidak tepat.');
    } else {
      setIsLocked(false);
    }
    setIsLoggingIn(false);
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    setIsLocked(true);
    setEmail('');
    setPassword('');
  };

  // Fungsi muat naik blog 
  const muatNaikBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tajukBlog || !kandunganBlog) return alert("Sila isi semua maklumat artikel!");
    setStatusBlog('Sedang memuat naik...');

    const { error } = await supabase
      .from('blog_rulaf')
      .insert([{ tajuk: tajukBlog, kandungan: kandunganBlog }]);

    if (error) {
      setStatusBlog('Ralat: ' + error.message);
    } else {
      setStatusBlog('[+] Artikel berjaya diterbitkan!');
      setTajukBlog('');
      setKandunganBlog('');
      setTimeout(() => setStatusBlog(''), 4000);
    }
  };

  // 1. PAPARAN PINTU PAGAR (Log Masuk)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0F1419] font-mono flex flex-col items-center justify-center p-10 text-[#A5B2D9] selection:bg-[#1793D1] selection:text-white">
        <div className="bg-[#171A21] p-8 rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)] max-w-sm w-full border border-[#1793D1]">
          <h1 className="text-2xl font-black text-white mb-2 text-center">rulaf-admin(1)</h1>
          <p className="text-gray-400 text-xs mb-8 text-center">Log masuk pentadbir rasmi (Sudo).</p>

          <form onSubmit={klikLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-[#1793D1] font-bold text-xs block mb-1">USER_EMAIL:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1] text-sm" placeholder="admin@rulaf.com" required />
            </div>
            <div>
              <label className="text-[#1793D1] font-bold text-xs block mb-1">PASSWORD:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1] text-sm" placeholder="***" required />
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-bold animate-pulse">{errorMsg}</p>}
            <button type="submit" disabled={isLoggingIn} className="mt-4 bg-[#1793D1] text-[#0F1419] font-bold py-2 hover:bg-blue-400 transition-colors disabled:bg-gray-600 disabled:text-gray-300">
              {isLoggingIn ? 'Authenticating...' : '[ sudo login ]'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PAPARAN DASHBOARD ADMIN
  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-4xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        {/* Header Admin */}
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - PUSAT KAWALAN UTAMA</span>
          <button onClick={logKeluar} className="hover:text-white transition-colors">[ sudo logout ]</button>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-700 pb-4">Papan Pemuka RuLaFHub</h1>

          {/* JEMBATAN KE PENGURUSAN SEKOLAH (Fungsi Baharu) */}
          <div className="mb-10 bg-black p-6 border border-purple-500 border-l-4 shadow-md">
            <h2 className="text-xl font-bold text-purple-400 mb-2">++ MODUL PENGURUSAN & PENGGREDAN</h2>
            <p className="text-gray-400 text-sm mb-4">Akses pangkalan data sekolah, pendaftaran murid, dan kemas kini markah formatif Jawi secara masa nyata (Real-time).</p>
            <button
              onClick={() => router.push('/admin/pengurusan')}
              className="bg-purple-600 text-white px-6 py-3 font-bold hover:bg-purple-500 transition-colors shadow-[0_0_10px_rgba(147,51,234,0.4)]"
            >
              [ cd /admin/pengurusan ] Buka Panel
            </button>
          </div>

          {/* MODUL CMS BLOG */}
          <div className="bg-gray-900 p-6 border border-gray-700 shadow-md">
            <h2 className="text-[#1793D1] font-bold mb-4"> TERBIT JURNAL INOVASI & BERITA</h2>
            <form onSubmit={muatNaikBlog} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">TAJUK ARTIKEL:</label>
                <input type="text" value={tajukBlog} onChange={(e) => setTajukBlog(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]" placeholder="Contoh: Kemas Kini Sistem..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">KANDUNGAN (Teks / Pautan):</label>
                <textarea value={kandunganBlog} onChange={(e) => setKandunganBlog(e.target.value)} className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1] h-32" placeholder="Tulis artikel atau letakkan pautan di sini..."></textarea>
              </div>
              <button type="submit" className="bg-[#1793D1] text-black px-6 py-2 font-bold hover:bg-blue-400 transition-colors w-fit">
                [ PUSH ARTIKEL ]
              </button>
              {statusBlog && <p className="text-sm font-bold text-green-400 mt-2">{statusBlog}</p>}
            </form>
          </div>

          {/* Kembali ke laman utama */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <a href="/" className="text-gray-500 hover:text-[#1793D1] text-sm font-bold transition-colors">
              [ cd ~ / Kembali ke Laman Utama ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}