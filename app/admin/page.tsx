'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  // --- KUNCI KESELAMATAN (SUPABASE AUTH) ---
  const [isLocked, setIsLocked] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- CMS BLOG / JURNAL ---
  const [tajukBlog, setTajukBlog] = useState('');
  const [kandunganBlog, setKandunganBlog] = useState('');
  const [statusBlog, setStatusBlog] = useState('');

  // --- EJEN AI RULAF (NL2SQL) ---
  const [soalanAI, setSoalanAI] = useState('');
  const [hasilAI, setHasilAI] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    semakSesi();
  }, []);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsLocked(true); // Kunci akses pentadbir sehingga disahkan
          const emailPengguna = session.user.email;
          setEmail(emailPengguna || 'Pengguna Rulaf');
    
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

  // Fungsi Bertanya Kepada "Otak" AI
  const tanyaAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!soalanAI) return;
    setIsThinking(true);
    setHasilAI(null);

    try {
      const res = await fetch('/api/ejen-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soalan_guru: soalanAI })
      });
      const data = await res.json();
      
      if(data.error) {
        setHasilAI({ ralat: data.error });
      } else {
        setHasilAI(data); // Menerima JSON dari AI
      }
    } catch (err: any) {
      setHasilAI({ ralat: err.message });
    }
    setIsThinking(false);
  };

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

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-4xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - PUSAT KAWALAN UTAMA</span>
          <button onClick={logKeluar} className="hover:text-white transition-colors">[ sudo logout ]</button>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-700 pb-4">Papan Pemuka RuLaFHub</h1>

          {/* EJEN AI (FUNGSI BARU!) */}
          <div className="mb-10 bg-black p-6 border border-green-500 border-l-4 shadow-md">
            <h2 className="text-xl font-bold text-green-400 mb-2">++ EJEN AI ANALISIS PRESTASI (NL2SQL)</h2>
            <p className="text-gray-400 text-sm mb-4">Tanya soalan dalam bahasa biasa. AI akan menjana kod SQL dan menarik analisis markah Jawi terus dari pangkalan data.</p>
            <form onSubmit={tanyaAI} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={soalanAI}
                onChange={(e) => setSoalanAI(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-green-500/50 text-white outline-none focus:border-green-400 font-mono text-sm"
                placeholder="Cth: Senaraikan nama murid kelas 5 Murshid yang gagal Jawi..."
              />
              <button type="submit" disabled={isThinking} className="bg-green-600 text-black px-6 py-2 font-bold hover:bg-green-500 transition-colors disabled:bg-gray-600 whitespace-nowrap">
                {isThinking ? 'PROCESSING...' : '[ TANYA AI ]'}
              </button>
            </form>

            {/* PAPARAN HASIL AI */}
            {hasilAI && (
              <div className="bg-gray-900 border border-gray-700 p-4 mt-4 font-mono text-sm overflow-x-auto">
                {hasilAI.sql && (
                  <div className="text-[#1793D1] mb-4 border-b border-gray-800 pb-2">
                    <span className="font-bold">~% SQL_GENERATED:</span> <br/>
                    <span className="text-gray-500 text-xs">{hasilAI.sql}</span>
                  </div>
                )}
                
                {hasilAI.ralat ? (
                  <div className="text-red-500 font-bold animate-pulse">[!] RALAT: {hasilAI.ralat}</div>
                ) : (
                  <div className="text-green-300">
                    <div className="mb-2 font-bold">[+] REKOD DITEMUI ({hasilAI.hasil?.length || 0}):</div>
                    <ul className="list-decimal ml-4 space-y-2 text-gray-300">
                      {hasilAI.hasil?.map((item: any, i: number) => (
                        <li key={i} className="bg-black p-2 border border-gray-800 rounded-sm">
                          {Object.entries(item).map(([key, val]) => (
                            <span key={key} className="mr-4">
                              <span className="text-purple-400">{key}:</span> <span className="text-white font-bold">{String(val)}</span>
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* JEMBATAN KE PENGURUSAN SEKOLAH */}
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