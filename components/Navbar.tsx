'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '../app/lib/supabaseClient'; // Sesuaikan mengikut struktur projek anda

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu drawer
  const [tema, setTema] = useState('dark'); // 'dark' atau 'light'
  const [menuBuka, setMenuBuka] = useState(false); // Dropdown menu profil
  const [avatarUrl, setAvatarUrl] = useState('');
  const [namaPengguna, setNamaPengguna] = useState('');

  useEffect(() => {
    // 1. Semak sesi log masuk + gambar profil untuk menu avatar
    const semakSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        const { data } = await supabase
          .from('profil_pengguna')
          .select('profile_picture_url,nama')
          .eq('email', session.user.email)
          .maybeSingle();
        if (data) {
          setAvatarUrl(data.profile_picture_url || '');
          setNamaPengguna(data.nama || '');
        }
      } else {
        setAvatarUrl('');
        setNamaPengguna('');
      }
    };
    semakSesi();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      semakSesi();
    });

    // 2. Setkan tema sedia ada dari localStorage (Lalai: 'dark' untuk identiti RuLaF)
    const temaDisimpan = localStorage.getItem('theme') || 'dark';
    setTema(temaDisimpan);
    if (temaDisimpan === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Log keluar dari menu profil
  const logKeluar = async () => {
    setMenuBuka(false);
    setIsOpen(false);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAvatarUrl('');
    setNamaPengguna('');
    window.location.href = '/';
  };

  // Fungsi untuk menukar tema secara global
  const tukarTema = () => {
    const temaBaharu = tema === 'dark' ? 'light' : 'dark';
    setTema(temaBaharu);
    localStorage.setItem('theme', temaBaharu);
    
    if (temaBaharu === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#171a21]/95 dark:bg-[#171a21]/95 bg-white/95 backdrop-blur-md border-b border-[#1793D1]/40 dark:border-[#1793D1]/40 border-gray-200 shadow-md dark:shadow-lg transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Branding */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/rulafhub.png"
                alt="Logo RuLaFHub"
                fill
                priority
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-wider font-mono">
              RuLaF<span className="text-[#1793D1] transition-colors duration-300 group-hover:text-cyan-400">Hub</span>
            </span>
          </a>

          {/* Navigasi Kanan (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <a
              href="/blog"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/blog' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Blog
            </a>
            <a
              href="/repo"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname.startsWith('/repo') 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Repositori
            </a>
            <a
              href="/forum"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname.startsWith('/forum') 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Forum
            </a>
            <a
              href="/docs"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/docs' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Docs
            </a>
            <a
              href="/dana"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/dana' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Dana
            </a>

            <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700/60 mx-2" />

            {/* Butang Log Masuk / Menu Profil (Avatar + Dropdown) */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setMenuBuka((b) => !b)}
                  title={namaPengguna || 'Menu pengguna'}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#1793D1]/60 hover:border-[#1793D1] bg-[#1793D1]/10 flex items-center justify-center text-sm font-black text-[#1793D1] transition-all focus:outline-none"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(namaPengguna || 'R').trim().charAt(0).toUpperCase()}</span>
                  )}
                </button>
                {menuBuka && (
                  <>
                    <button aria-hidden tabIndex={-1} onClick={() => setMenuBuka(false)} className="fixed inset-0 z-40 cursor-default bg-transparent border-0" />
                    <div className="absolute right-0 mt-2 w-48 z-50 bg-white dark:bg-[#171a21] border border-gray-200 dark:border-[#1793D1]/30 rounded-xl shadow-xl overflow-hidden">
                      <a href="/dashboard" onClick={() => setMenuBuka(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-[#1793D1] transition-colors">
                        <span>📊</span> Dashboard
                      </a>
                      <a href="/profil" onClick={() => setMenuBuka(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-[#1793D1] transition-colors">
                        <span>👤</span> Profil
                      </a>
                      <a href="/profil#tetapan" onClick={() => setMenuBuka(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-[#1793D1] transition-colors">
                        <span>⚙️</span> Tetapan
                      </a>
                      <div className="h-[1px] bg-gray-200 dark:bg-gray-800" />
                      <button onClick={logKeluar} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <span>🚪</span> Log Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-1.5 rounded text-sm font-bold text-[#1793D1] border border-[#1793D1] hover:bg-[#1793D1] hover:text-[#0F1419] transition-all duration-300"
              >
                Log Masuk
              </a>
            )}

            {/* ☀️/🌙 BUTANG SWITCH TEMA (DESKTOP) */}
            <button
              onClick={tukarTema}
              className="ml-2 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              title="Tukar Tema Paparan"
            >
              {tema === 'dark' ? (
                // Ikon Matahari (Tukar ke Light Mode)
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                // Ikon Bulan (Tukar ke Dark Mode)
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </nav>

          {/* Button Hamburger (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Butang Tema Mobile */}
            <button
              onClick={tukarTema}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
            >
              {tema === 'dark' ? (
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-[#1793D1] hover:bg-gray-100 dark:hover:bg-gray-800/50 focus:outline-none transition-all duration-300"
            >
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Drawer Menu (Mobile) */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#171a21] border-b border-gray-200 dark:border-[#1793D1]/30 transition-all duration-300">
          <div className="space-y-1 px-4 pt-2 pb-4 shadow-inner">
            <a
              href="/blog"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/blog' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Blog
            </a>
            <a
              href="/repo"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname.startsWith('/repo') ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Repositori
            </a>
            <a
              href="/forum"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname.startsWith('/forum') ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Forum
            </a>
            <a
              href="/docs"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/docs' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Docs
            </a>
            <a
              href="/dana"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/dana' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40'
              }`}
            >
              Dana
            </a>

            <div className="h-[1px] bg-gray-200 dark:bg-gray-800 my-3" />

            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                >
                  📊 Dashboard
                </a>
                <a
                  href="/profil"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                >
                  👤 Profil
                </a>
                <a
                  href="/profil#tetapan"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                >
                  ⚙️ Tetapan
                </a>
                <button
                  onClick={logKeluar}
                  className="block w-full text-left px-3 py-2.5 rounded-md text-base font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  🚪 Log Keluar
                </button>
              </>
            ) : (
              <a
                onClick={() => setIsOpen(false)}
                href="/login"
                className="block text-center w-full py-2.5 rounded-md text-base font-bold text-[#1793D1] border border-[#1793D1] hover:bg-[#1793D1] hover:text-[#0F1419] transition-all"
              >
                Log Masuk
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}