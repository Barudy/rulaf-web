'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient'; 

export default function HomePage() { 
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Menarik data artikel sebenar dari Supabase
  useEffect(() => {
    async function fetchBlogs() {
      const { data, error } = await supabase
        .from('blog_rulaf')
        .select('*')
        .order('tarikh', { ascending: false }); // Susun berita terkini di atas
      
      if (data) setBlogs(data);
      setIsLoading(false);
    }
    fetchBlogs();
  }, []);

  return ( 
    <div className="min-h-screen bg-[#171A21] text-[#A5B2D9] font-sans selection:bg-[#1793D1] selection:text-white"> 
      {/* Navbar Ala Arch Linux (Biru Laut & Kelabu Gelap) */} 
      <nav className="p-4 bg-[#282C34] border-b border-[#1793D1] shadow-md flex justify-between items-center max-w-5xl mx-auto mt-4 rounded-t-lg"> 
        <div className="flex items-center gap-3"> 
          <span className="text-xl font-bold text-white tracking-wide">
            RuLaF<span className="text-[#1793D1]">Hub</span>
          </span> 
        </div> 
        <div className="flex gap-6 text-sm font-semibold"> 
          <a href="/semakan" className="text-[#1793D1] hover:underline">Semakan Markah</a> 
        </div> 
      </nav>

      {/* Bahagian Utama (Latest News / Jurnal Inovasi) */}
      <main className="max-w-5xl mx-auto bg-[#282C34] p-8 mt-2 rounded-b-lg shadow-lg border border-gray-800">
        <div className="border-b border-gray-700 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-white">Jurnal Inovasi & Berita Terkini</h1>
            <p className="text-sm mt-2 font-mono text-gray-400">Arch-style documentation for Pendidikan Jawi</p>
        </div>

        {isLoading ? (
          <p className="font-mono text-[#1793D1]">Loading database...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div key={blog.id} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-b border-gray-700 pb-4 hover:bg-gray-800 p-2 transition-colors">
                  {/* Tarikh berformat Monospace */}
                  <div className="font-mono text-xs text-gray-500 min-w-[100px]">
                    {new Date(blog.tarikh).toLocaleDateString('ms-MY')}
                  </div>
                  
                  {/* Tajuk dan Kandungan */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#1793D1] hover:underline cursor-pointer">
                      {blog.tajuk}
                    </h2>
                    <p className="text-sm mt-1 line-clamp-2">{blog.kandungan}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Tiada artikel diterbitkan setakat ini.</p>
            )}
          </div>
        )}
      </main>
    </div> 
  ); 
}