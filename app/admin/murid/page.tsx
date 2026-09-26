'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import BorangDaftarMurid from '../../../components/BorangDaftarMurid';
import MejaMurid from '../../../components/MejaMurid';

/**
 * Pengurusan Murid (multitenan) — daftar sekolah/kelas/murid + meja pukal.
 * Guru: hanya murid di sekolah sendiri. Admin: semua.
 */
export default function MuridPage() {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [siap, setSiap] = useState(false);
  const [kunci, setKunci] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { setSiap(true); return; }
      setEmail(session.user.email);
      const { data } = await supabase.from('profil_pengguna').select('peranan').eq('email', session.user.email).maybeSingle();
      setIsAdmin(data?.peranan === 'admin');
      setSiap(true);
    })();
  }, []);

  if (!siap) return <main className="min-h-screen p-10 text-xs text-gray-400 animate-pulse font-mono">Memuatkan…</main>;
  if (!email) return <main className="min-h-screen p-10 text-sm">Sila <Link href="/login" className="text-[#1793D1] font-bold underline">log masuk</Link> sebagai Guru.</main>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">🧒 Pengurusan Murid</h1>
          <Link href="/dashboard" className="ml-auto text-xs text-[#1793D1] font-bold hover:underline">[ ← Dashboard ]</Link>
        </div>
        <p className="text-[11px] text-gray-500 -mt-3">
          Daftar sekolah, kelas & murid anda. Token & QR dijana automatik. {isAdmin ? 'Mod Pentadbir: semua rekod.' : 'Anda hanya melihat murid sekolah sendiri.'}
        </p>
        <BorangDaftarMurid email={email} onChanged={() => setKunci((k) => k + 1)} />
        <MejaMurid email={email} isAdmin={isAdmin} refreshKey={kunci} />
      </div>
    </main>
  );
}
