'use client';
import React, { useState } from 'react';
import { supabase } from './../lib/supabaseClient'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg('[!] Akses Ditolak: E-mel atau kata laluan tidak tepat.');
      setIsLoggingIn(false);
    } else {
      // Jika berjaya, sistem akan terus bawa pengguna ke halaman Repositori
      router.push('/repo');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono flex flex-col items-center justify-center p-6 selection:bg-[#1793D1] selection:text-white">
      <div className="w-full max-w-md bg-[#171A21] p-8 border border-[#1793D1] shadow-[0_0_15px_rgba(23,147,209,0.3)] rounded-sm">
        
        {/* Header Ala Terminal */}
        <div className="border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-black text-white">rulaf-auth(1)</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem Pengesahan Komuniti RuLaF</p>
        </div>

        {/* Borang Log Masuk */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-[#1793D1] font-bold text-sm block mb-1">USER_EMAIL:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]"
              placeholder="contoh@rulaf.com"
              required
            />
          </div>

          <div>
            <label className="text-[#1793D1] font-bold text-sm block mb-1">PASSWORD:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 text-white outline-none focus:border-[#1793D1]"
              placeholder="Kata laluan..."
              required
            />
          </div>

          {errorMsg && <p className="text-red-500 text-xs font-bold animate-pulse">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-4 w-full bg-[#1793D1] text-[#0F1419] font-bold py-2 hover:bg-blue-400 transition-colors disabled:bg-gray-600 disabled:text-gray-300"
          >
            {isLoggingIn ? 'Authenticating...' : '[ sudo login ]'}
          </button>
        </form>

        {/* Bantuan / Footer */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>Belum mempunyai akses? Sila hubungi Admin Mail untuk pendaftaran akaun PAK21.</p>
          <a href="/" className="text-[#1793D1] hover:underline mt-3 inline-block">
            [ Kembali ke Laman Utama ]
          </a>
        </div>
      </div>
    </div>
  );
}