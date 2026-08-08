'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '../app/lib/supabaseClient'; // Path relatif yang tepat ke lib/supabaseClient di dalam folder app

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mengawal status menu mobile (buka/tutup)

  // Memantau sesi pengguna secara masa nyata (real-time) menggunakan Supabase Auth
  useEffect(() => {
    const semakSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    semakSesi();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#171a21]/95 backdrop-blur-md border-b border-[#1793D1]/40 shadow-lg transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* ==================== KIRI: LOGO & BRANDING ==================== */}
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
            <span className="text-xl font-extrabold text-white tracking-wider font-mono">
              RuLaF<span className="text-[#1793D1] transition-colors duration-300 group-hover:text-cyan-400">Hub</span>
            </span>
          </a>

          {/* ==================== KANAN: NAVIGASI DESKTOP ==================== */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <a
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Halaman Utama
            </a>
            <a
              href="/permainan"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/permainan' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Arked
            </a>
            <a
              href="/semakan"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/semakan' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Semakan
            </a>
            <a
              href="/repo"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/repo' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Repositori
            </a>
            <a
              href="/docs"
              className={`px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 ${
                pathname === '/docs' 
                  ? 'text-[#1793D1] bg-[#1793D1]/10' 
                  : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Docs
            </a>

            {/* Garis Pemisah */}
            <div className="h-5 w-[1px] bg-gray-700/60 mx-2" />

            {/* Butang Autentikasi Dinamik */}
            {isLoggedIn ? (
              <a
                href="/profil"
                className="ml-2 px-4 py-1.5 rounded text-sm font-bold text-[#0F1419] bg-[#1793D1] border border-[#1793D1] hover:bg-transparent hover:text-[#1793D1] transition-all duration-300 shadow-[0_0_12px_rgba(23,147,209,0.3)] hover:shadow-none"
              >
                [ Profil ]
              </a>
            ) : (
              <a
                href="/login"
                className="ml-2 px-4 py-1.5 rounded text-sm font-bold text-[#1793D1] border border-[#1793D1] hover:bg-[#1793D1] hover:text-[#0F1419] transition-all duration-300"
              >
                Log Masuk
              </a>
            )}
          </nav>

          {/* ==================== BUTTON HAMBURGER (MOBILE) ==================== */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#1793D1] hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1793D1] transition-all duration-300"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Buka menu utama</span>
              {isOpen ? (
                // Ikon Pangkah (X)
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Ikon Hamburger (3 Baris)
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ==================== MENULURUN DRAWER (MOBILE) ==================== */}
      {isOpen && (
        <div className="md:hidden bg-[#171a21] border-b border-[#1793D1]/30 transition-all duration-300 ease-in-out" id="mobile-menu">
          <div className="space-y-1 px-4 pt-2 pb-4 shadow-inner">
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Halaman Utama
            </a>
            <a
              href="/permainan"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/permainan' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Arked
            </a>
            <a
              href="/semakan"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/semakan' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Semakan
            </a>
            <a
              href="/repo"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/repo' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Repositori
            </a>
            <a
              href="/docs"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${
                pathname === '/docs' ? 'text-[#1793D1] bg-[#1793D1]/10' : 'text-gray-300 hover:text-[#1793D1] hover:bg-gray-800/40'
              }`}
            >
              Docs
            </a>

            <div className="h-[1px] bg-gray-800 my-3" />

            {/* Butang Autentikasi Dinamik (Mobile) */}
            {isLoggedIn ? (
              <a
                href="/profil"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full py-2.5 rounded-md text-base font-bold text-[#0F1419] bg-[#1793D1] border border-[#1793D1] shadow-[0_0_12px_rgba(23,147,209,0.2)]"
              >
                [ Profil ]
              </a>
            ) : (
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
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
