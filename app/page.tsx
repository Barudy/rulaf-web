'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Sila pastikan laluan ke lib/supabaseClient adalah betul
import Image from 'next/image';

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [artikelBuka, setArtikelBuka] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 1. Semak status log masuk pentadbir/guru
    async function semakSesi() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      }
    }

    // 2. Tarik data artikel blog dari pangkalan data Supabase secara automatik
    async function tarikDataBlog() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_rulaf')
        .select('*')
        .order('tarikh', { ascending: false }); // ✅ BETUL: Guna 'tarikh', bukan 'created_at'
      
      if (data) {
        setBlogs(data);
      } else if (error) {
        console.error("Ralat menarik data blog:", error.message);
      }
      setIsLoading(false);
    }

    semakSesi();
    tarikDataBlog();
  }, []);

  const klikArtikel = (id: number) => {
    if (artikelBuka === id) setArtikelBuka(null);
    else setArtikelBuka(id);
  };

  // Menukarkan pautan pendaftaran/latihan dalam teks secara automatik menjadi link berwarna biru
  const jadikanLinkBolehDitekan = (teks: string) => {
    if (!teks) return teks;
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Mengekalkan pembetulan tanda escaping slashes regex
    const bahagianTeks = teks.split(urlRegex);
    return bahagianTeks.map((bahagian, index) => {
      if (bahagian.match(urlRegex)) {
        return (
          <a
            key={index}
            href={bahagian}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1793D1] hover:underline break-all"
          >
            {bahagian}
          </a>
        );
      }
      return bahagian;
    });
  };

  return (
    <div className="min-h-screen text-[#0F1419] font-sans p-4 sm:p-10 pt-6 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-5xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm p-6 shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        <div className="border-b border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Jurnal Inovasi &amp; Berita Terkini
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-mono">
            [ Dokumentasi perjalanan RuLaF dan REDF ]
          </p>
        </div>

        {isLoading ? (
          <p className="text-gray-500 font-mono animate-pulse">Menghubungi pangkalan data Supabase...</p>
        ) : blogs.length === 0 ? (
          <p className="text-gray-500 font-mono">Tiada artikel atau hebahan ditemui setakat ini.</p>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                <button
                  onClick={() => klikArtikel(blog.id)}
                  className="text-left w-full focus:outline-none group"
                >
                  <h2 className="text-xl font-bold text-white group-hover:text-[#1793D1] transition-colors duration-300">
                    {blog.tajuk}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Tarikh: {blog.tarikh ? new Date(blog.tarikh).toLocaleDateString('ms-MY') : 'Tiada Tarikh'} {/* ✅ BETUL: Guna blog.tarikh */}
                  </p>
                </button>
                
                {artikelBuka === blog.id && (
                  <div className="mt-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono bg-[#11141b] p-4 border border-gray-800 rounded">
                    {jadikanLinkBolehDitekan(blog.kandungan)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}