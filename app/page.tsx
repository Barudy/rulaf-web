export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">
        RuLaF<span className="text-blue-500">Hub</span>
      </h1>
      <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
        Selamat Datang ke Pusat Dokumentasi & Jurnal Penyelidikan Program RuLaF. 
        Misi kami adalah mendigitalisasi ekosistem pendidikan Jawi & Al-Quran 
        demi melahirkan generasi hibrid yang cemerlang.
      </p>
      
      <div className="mt-10 flex gap-4">
        <div className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg">
          Blog Akan Datang
        </div>
        <div className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full font-bold">
          Dokumentasi Tesis
        </div>
      </div>

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

