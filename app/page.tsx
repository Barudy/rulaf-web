'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient'; 

export default function HomePage() { 
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [artikelBuka, setArtikelBuka] = useState<number | null>(null);

  // TAMBAHAN BARU: State untuk mengesan status log masuk
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fungsi 1: Semak jika ada pengguna yang sedang log masuk
    async function semakSesi() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      }
    }

    // Fungsi 2: Tarik artikel blog dari database
    async function fetchBlogs() {
      const { data, error } = await supabase
        .from('blog_rulaf')
        .select('*')
        .order('tarikh', { ascending: false }); 
      
      if (data) setBlogs(data);
      setIsLoading(false);
    }

    semakSesi();
    fetchBlogs();
  }, []);

  const klikArtikel = (id: number) => {
    if (artikelBuka === id) setArtikelBuka(null); 
    else setArtikelBuka(id); 
  };

  const jadikanLinkBolehDitekan = (teks: string) => {
    if (!teks) return teks;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const bahagianTeks = teks.split(urlRegex);

    return bahagianTeks.map((bahagian, indeks) => {
      if (bahagian.match(urlRegex)) {
        return (
          <a 
            key={indeks} 
            href={bahagian} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#1793D1] font-bold hover:text-white hover:underline transition-colors"
          >
            {bahagian}
          </a>
        );
      }
      return bahagian;
    });
  };

  return ( 
    <div className="min-h-screen bg-[#171A21] text-[#A5B2D9] font-sans selection:bg-[#1793D1] selection:text-white"> 
      
      {/* Navbar Ala Arch Linux */} 
      <nav className="p-4 bg-[#282C34] border-b border-[#1793D1] shadow-md flex justify-between items-center max-w-5xl mx-auto mt-4 rounded-t-lg"> 
        <div className="flex items-center gap-3"> 
          <span className="text-xl font-bold text-white tracking-wide">
            RuLaF<span className="text-[#1793D1]">Hub</span>
          </span> 
        </div> 
        <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-semibold items-center"> 
          <a href="/semakan" className="text-gray-300 hover:text-[#1793D1] transition-colors">Semakan</a> 
          <a href="/repo" className="text-gray-300 hover:text-[#1793D1] transition-colors">Repositori</a> 
          <a href="/docs" className="text-gray-300 hover:text-[#1793D1] transition-colors">Docs</a> 

          {/* PERUBAHAN DINAMIK: Butang Log Masuk vs Profil */}
          {isLoggedIn ? (
            <a href="/profil" className="text-[#0F1419] bg-[#1793D1] border border-[#1793D1] px-3 py-1 rounded hover:bg-transparent hover:text-[#1793D1] transition-colors shadow-[0_0_8px_rgba(23,147,209,0.5)]">
              [ Profil ]
            </a>
          ) : (
            <a href="/login" className="text-[#1793D1] border border-[#1793D1] px-3 py-1 rounded hover:bg-[#1793D1] hover:text-[#0F1419] transition-colors">
              Log Masuk
            </a>
          )}
        </div> 
      </nav>

      <main className="max-w-5xl mx-auto bg-[#282C34] p-8 mt-2 rounded-b-lg shadow-lg border border-gray-800">
        <div className="border-b border-gray-700 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-white">Jurnal Inovasi & Berita Terkini</h1>
            <p className="text-sm mt-2 font-mono text-gray-400">Arch-style documentation for Pendidikan Jawi</p>
        </div>

        {isLoading ? (
          <p className="font-mono text-[#1793D1] animate-pulse">Loading database...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div key={blog.id} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-gray-700 pb-4 hover:bg-gray-800 p-2 transition-colors">
                  
                  <div className="font-mono text-xs text-gray-500 min-w-[100px]">
                    {new Date(blog.tarikh).toLocaleDateString('ms-MY')}
                  </div>
                  
                  <div className="flex-1">
                    <h2 
                      className="text-lg font-bold text-[#1793D1] hover:underline cursor-pointer flex items-center gap-2"
                      onClick={() => klikArtikel(blog.id)}
                    >
                      <span className="font-mono text-sm">{artikelBuka === blog.id ? "[-]" : "[+]"}</span>
                      {blog.tajuk}
                    </h2>
                    
                    {artikelBuka === blog.id ? (
                      <div className="mt-4 text-sm text-gray-300 whitespace-pre-wrap bg-black p-5 rounded border border-gray-700 font-mono leading-relaxed">
                        {jadikanLinkBolehDitekan(blog.kandungan)}
                      </div>
                    ) : (
                      <p 
                        className="text-sm mt-1 line-clamp-2 text-gray-400 cursor-pointer"
                        onClick={() => klikArtikel(blog.id)}
                      >
                        {blog.kandungan}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 font-mono">Tiada artikel diterbitkan setakat ini.</p>
            )}
          </div>
        )}
      </main>
    </div> 
  ); 
}