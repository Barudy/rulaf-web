'use client';
import { useState } from 'react'; 
import { supabase } from '../lib/supabaseClient'; // 1. Buka komen ini
import RuLaFCard from '../../components/RuLaFCard'; 
import senaraiMurid from '../../data/murid.json';

export default function AdminPage() { 
  // --- BAHAGIAN KUNCI KESELAMATAN (SUPABASE AUTH) --- 
  const [isLocked, setIsLocked] = useState(true); 
  const [email, setEmail] = useState(''); // Tambahan state untuk emel
  const [password, setPassword] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ... (Kekalkan state lain seperti carian, tapisan dan borang blog) ...
  const [tajukBlog, setTajukBlog] = useState('');
  const [kandunganBlog, setKandunganBlog] = useState('');
  const [statusBlog, setStatusBlog] = useState('');

  // Fungsi Log Masuk Rasmi Supabase
  const klikLogin = async (e: React.FormEvent) => { 
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) { 
      setErrorMsg('Akses Ditolak: E-mel atau kata laluan tidak tepat.'); 
    } else { 
      setIsLocked(false); // Berjaya log masuk, buka kunci panel!
    } 
    setIsLoggingIn(false);
  };

  // Fungsi muat naik blog (Kekal sama, kerana Supabase sudah kenal sesi log masuk ini)
  const muatNaikBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusBlog('Sedang memuat naik...');

    const { data, error } = await supabase
      .from('blog_rulaf')
      .insert([
        { 
          tajuk: tajukBlog, 
          kandungan: kandunganBlog, 
          tarikh: new Date().toISOString() 
        }
      ]);

    if (error) {
      setStatusBlog('Ralat: ' + error.message);
    } else {
      setStatusBlog('Artikel Jurnal berjaya dimuat naik!');
      setTajukBlog('');
      setKandunganBlog('');
    }
  };

  // 1. PAPARAN PINTU PAGAR (Kemas kini tambah medan E-mel)
  if (isLocked) { 
    return ( 
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-10"> 
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700"> 
          <h1 className="text-3xl font-black text-white mb-2 text-center">Admin RuLaF</h1> 
          <p className="text-gray-400 text-sm mb-8 text-center">Log masuk akaun pentadbir rasmi.</p>
          
          <form onSubmit={klikLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-blue-500" 
              placeholder="E-mel admin..." 
              required
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-blue-500" 
              placeholder="Kata laluan..." 
              required
            />
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {isLoggingIn ? 'Mengesahkan...' : 'Log Masuk'}
            </button>
          </form>
          {errorMsg && <p className="text-red-400 text-sm mt-4 text-center">{errorMsg}</p>}
        </div>
      </div>
    );
  }

  // 2. PAPARAN DASHBOARD ADMIN (Jika password betul)
  return ( 
    <div className="min-h-screen bg-gray-900 p-10 flex flex-col items-center"> 
      <h1 className="text-4xl font-black text-white mb-8">Pusat Data RuLaF (Mod Admin)</h1>
      
      {/* --- BORANG TAMBAH BLOG --- */}
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-xl border border-gray-700 mb-10 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Muat Naik Jurnal Inovasi & Blog</h2>
        <form onSubmit={muatNaikBlog} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Tajuk Artikel</label>
            <input
              type="text"
              value={tajukBlog}
              onChange={(e) => setTajukBlog(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="Contoh: Analisis Prestasi Hafazan Kelas 3 Murshid..."
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Kandungan</label>
            <textarea
              value={kandunganBlog}
              onChange={(e) => setKandunganBlog(e.target.value)}
              className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none h-40"
              placeholder="Tuliskan butiran inovasi, refleksi pengajaran, atau trend pendidikan di sini..."
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors self-end w-48"
          >
            Terbitkan Artikel
          </button>
          {statusBlog && <p className="text-sm text-green-400 mt-2 font-medium">{statusBlog}</p>}
        </form>
      </div>

      {/* --- BAHAGIAN SENARAI MURID SEDIA ADA --- */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-4">Senarai Murid & Kemaskini Markah</h2>
        {/* ... (Kod carian, tapisan dan senarai kad murid diletakkan di sini seperti sedia ada) ... */}
      </div>

    </div> 
  ); 
}
