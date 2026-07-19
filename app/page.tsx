'use client'; // Arahan wajib ditambah untuk membaiki ralat deployment
import Image from "next/image";
import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient'; // Buka komen ini setelah Supabase diintegrasikan

export default function HomePage() { 
  // State untuk menyimpan data blog dari Supabase
  const [blogs, setBlogs] = useState([]);

  // Contoh fungsi untuk menarik data blog dari Supabase (Boleh digunakan nanti)
  /*
  useEffect(() => {
    async function fetchBlogs() {
      const { data, error } = await supabase.from('blog_rulaf').select('*');
      if (data) setBlogs(data);
    }
    fetchBlogs();
  }, []);
  */

  return ( 
    <div className="min-h-screen bg-black text-white font-sans"> 
      {/* Navbar / Header */} 
      <nav className="p-6 border-b border-gray-800 flex justify-between items-center max-w-6xl mx-auto"> 
        <div className="flex items-center gap-3"> 
          <img src="/rulafhub.png" alt="Logo" className="w-10 h-10 object-contain" /> 
          <span className="text-2xl font-black tracking-tighter">RuLaF<span className="text-blue-500">Hub</span></span> 
        </div> 
        <div className="flex gap-6 text-sm font-medium text-gray-400"> 
          <a href="/blog" className="hover:text-white">Blog & Jurnal</a>
          {/* Pautan Admin telah dipadam dari paparan awam untuk tujuan keselamatan */}
          <a href="/semakan" className="hover:text-white">Semakan</a> 
        </div> 
      </nav>

      {/* Bahagian Utama / Senarai Blog */}
      <main className="max-w-6xl mx-auto p-6 mt-10">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-4xl font-bold mb-2">Jurnal Inovasi & Blog RuLaF</h1>
                <p className="text-gray-400">Perkongsian bahan pengajaran, analisis prestasi, dan trend teknologi Pendidikan Jawi.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-white">Trend AI Dalam Pendidikan Jawi</h2>
                <p className="text-xs text-blue-400 mb-4">Diterbitkan pada: 19 Julai 2026</p>
                <p className="text-sm text-gray-400 line-clamp-3">
                    Meneroka potensi kecerdasan buatan (AI) dalam memperkasakan tulisan Jawi melalui pendekatan digital dan inovasi terkini.
                </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors cursor-pointer">
                <h2 className="text-xl font-bold mb-2 text-white">Latihan Amali Hadas & Tauhid</h2>
                <p className="text-xs text-blue-400 mb-4">Diterbitkan pada: 15 Julai 2026</p>
                <p className="text-sm text-gray-400 line-clamp-3">
                    Muat turun lembaran kerja terbaru untuk kelas 3 Murshid yang merangkumi topik asas penyucian dan kefahaman Rasul Ulul Azmi.
                </p>
            </div>
        </div>
      </main>
    </div> 
  ); 
}