import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar / Header */}
      <nav className="p-6 border-b border-gray-800 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/rulafhub.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-black tracking-tighter">RuLaF<span className="text-blue-500">Hub</span></span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-400">
          <a href="/admin" className="hover:text-white">Admin</a>
          <a href="/semakan" className="hover:text-white">Semakan</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-6xl font-black mb-6 leading-none">Dokumentasi <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Tesis Digital</span></h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg italic">"Mentransformasikan kaedah perkilangan kepada pendidikan hibrid yang manusiawi."</p>
      </section>

      {/* Blog List Section */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8 border-l-4 border-blue-500 pl-4">Jurnal Terkini</h2>
        
        {/* Contoh Item Blog (Bosskur boleh letak fail Markdown nanti) */}
        <div className="grid gap-8">
          <article className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500 transition cursor-pointer">
            <p className="text-blue-400 text-xs font-bold mb-2 uppercase">11 Mei 2026</p>
            <h3 className="text-xl font-bold mb-2">Kenapa RuLaF Menjadi Tesis Master Saya?</h3>
            <p className="text-gray-400 text-sm">Membongkar kelemahan sistem PdP sedia ada dan bagaimana pendekatan digital membantu murid Khas menguasai Jawi...</p>
          </article>

          {/* Sini bosskur tambah artikel seterusnya */}
        </div>
      </section>

      {/* --- BAHAGIAN SUMBANGAN (DNQR & LINK) --- */}
      <div className="mt-16 pt-10 border-t border-gray-800 flex flex-col items-center w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Sokong Inovasi RuLaFHub</h2>
        <p className="text-sm text-gray-400 mb-8">
          Sumbangan ikhlas anda amat bermakna untuk menampung kos pelayan (server) dan pembangunan aplikasi percuma pada masa hadapan.
        </p>

        {/* Kotak DuitNow QR */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 transform transition hover:scale-105 border-4 border-emerald-500">
          <img 
            src="/duitnow.png" 
            alt="DuitNow QR Code" 
            className="w-48 h-48 md:w-56 md:h-56 object-contain"
          />
        </div>

        <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">
          Imbas QR di atas atau klik butang di bawah
        </p>

        {/* Butang Link Alternatif */}
        <a 
          href="https://toyyibpay.com/Derma-Hasil-Kerja-Ustaz-Ismail" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold shadow-xl transition transform hover:-translate-y-1"
        >
          💳 Klik Untuk Menyumbang
        </a>
      </div>

    </div>
  );
}

