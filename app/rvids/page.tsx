'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import RvidsKad from '../../components/RvidsKad';

const KATEGORI = ['Jawi', 'Ibadat', 'Bahasa Arab', 'Sirah', 'Tauhid', 'Adab', 'Leaderboard'];

/** 🎬 Rvids — satu video penuh pada satu masa, sapu untuk video rawak seterusnya (ala TikTok/Shorts). */
export default function RvidsPage() {
  const [video, setVideo] = useState<any[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [email, setEmail] = useState('');
  const [bolehMuat, setBolehMuat] = useState(false);

  // Pager rawak: turutan dikocok, habis → kocok semula (elak ulang terakhir)
  const [turutan, setTurutan] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const kunci = useRef(false);
  const sentuhY = useRef<number | null>(null);

  const [bukaMuat, setBukaMuat] = useState(false);
  const [fTajuk, setFTajuk] = useState('');
  const [fPenerangan, setFPenerangan] = useState('');
  const [fKategori, setFKategori] = useState('Jawi');
  const [failVideo, setFailVideo] = useState<File | null>(null);
  const [naikSibuk, setNaikSibuk] = useState(false);

  const kocok = useCallback((n: number, elakId?: number) => {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const muatFeed = useCallback(async () => {
    setMemuat(true);
    const { data } = await supabase.from('rulaf_videos').select('*').eq('is_aktif', true).order('created_at', { ascending: false });
    const senarai = data || [];
    setVideo(senarai);
    setTurutan(kocok(senarai.length));
    setPos(0);
    setMemuat(false);
  }, [kocok]);

  useEffect(() => {
    muatFeed();
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const emel = session?.user?.email || '';
      setEmail(emel);
      if (!emel) return;
      const { data: p } = await supabase.from('profil_pengguna').select('peranan').eq('email', emel).maybeSingle();
      const per = (p?.peranan || '').toLowerCase();
      setBolehMuat(per === 'guru' || per === 'admin');
    })();
  }, [muatFeed]);

  const videoKini = turutan.length > 0 && video.length > 0 ? video[turutan[pos]] : null;

  const pergi = useCallback((arah: 1 | -1) => {
    if (kunci.current || video.length === 0) return;
    kunci.current = true;
    setTimeout(() => { kunci.current = false; }, 450);
    setPos((p) => {
      if (arah === 1) {
        if (p + 1 < turutan.length) return p + 1;
        // Habis — kocok semula, elak ulang video terakhir
        const akhirId = video[turutan[p]]?.id;
        let baru = kocok(video.length);
        if (baru.length > 1 && video[baru[0]]?.id === akhirId) baru = [...baru.slice(1), baru[0]];
        setTurutan(baru);
        return 0;
      }
      return p > 0 ? p - 1 : p;
    });
  }, [video, turutan, kocok]);

  const kocokSemula = useCallback(() => {
    if (video.length === 0) return;
    setTurutan(kocok(video.length));
    setPos(0);
  }, [video, kocok]);

  // Kekunci papan kekunci + roda tetikus (desktop)
  useEffect(() => {
    const padaKekunci = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); pergi(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); pergi(-1); }
    };
    window.addEventListener('keydown', padaKekunci);
    return () => window.removeEventListener('keydown', padaKekunci);
  }, [pergi]);

  const muatNaik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTajuk.trim() || !failVideo) return alert('[!] Tajuk & fail video diperlukan.');
    if (failVideo.size > 50 * 1024 * 1024) return alert('[!] Had 50MB.');
    setNaikSibuk(true);
    try {
      const bersih = failVideo.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const laluan = `rvids/${Date.now()}_${bersih}`;
      const { error: e1 } = await supabase.storage.from('modul-rulaf').upload(laluan, failVideo, { contentType: 'video/mp4', upsert: true });
      if (e1) throw e1;
      const { data: { publicUrl } } = supabase.storage.from('modul-rulaf').getPublicUrl(laluan);
      const { data: p } = await supabase.from('profil_pengguna').select('nama').eq('email', email).maybeSingle();
      const { error: e2 } = await supabase.from('rulaf_videos').insert([{
        tajuk_video: fTajuk.trim(), pautan_video: publicUrl, kategori: fKategori,
        pencipta: email, pencipta_nama: p?.nama || email, penerangan: fPenerangan.trim(), is_aktif: true,
      }]);
      if (e2) throw e2;
      setFTajuk(''); setFPenerangan(''); setFailVideo(null); setBukaMuat(false);
      muatFeed();
      alert('🎉 Video disiarkan ke Rvids!');
    } catch (err: any) {
      alert('Gagal muat naik: ' + (err.message || err));
    } finally { setNaikSibuk(false); }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="bg-[#010409] border-b border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-3 text-sm">
          <Link href="/" className="font-bold hover:text-[#1793D1]">⬡ RuLaFHub</Link>
          <span className="text-gray-600">/</span>
          <span className="font-mono text-xs text-gray-400">🎬 RVIDS :: BELAJAR MICRO</span>
        </div>
      </nav>

      {/* Pentas satu video — sapu/klik untuk seterusnya */}
      <div
        className="relative mx-auto w-full max-w-[430px] border-x border-gray-800 bg-black overflow-hidden"
        style={{ height: 'calc(100vh - 3rem)' }}
        onTouchStart={(e) => { sentuhY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (sentuhY.current == null) return;
          const beza = sentuhY.current - e.changedTouches[0].clientY;
          sentuhY.current = null;
          if (Math.abs(beza) > 50) pergi(beza > 0 ? 1 : -1);
        }}
        onWheel={(e) => { if (Math.abs(e.deltaY) > 20) pergi(e.deltaY > 0 ? 1 : -1); }}
      >
        {memuat ? (
          <p className="text-center pt-20 text-xs text-gray-400 animate-pulse">Memuatkan Rvids…</p>
        ) : !videoKini ? (
          <p className="text-center pt-20 text-xs text-gray-400">Tiada video buat masa ini.</p>
        ) : (
          <div key={videoKini.id} className="h-full w-full">
            <RvidsKad video={videoKini} userEmail={email} aktif />
          </div>
        )}

        {/* Penunjuk + kocok */}
        {videoKini && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
            <span className="font-mono text-[10px] bg-black/60 px-2 py-1 rounded-full text-white/80">
              {pos + 1} / {video.length} · rawak 🔀
            </span>
            <button onClick={kocokSemula} title="Kocok semula" className="font-mono text-[10px] bg-black/60 px-2 py-1 rounded-full text-white/80 hover:text-white">
              🔀
            </button>
          </div>
        )}

        {/* Butang atas/bawah (desktop) */}
        {videoKini && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex flex-col gap-2">
            <button onClick={() => pergi(-1)} aria-label="Sebelumnya" className="w-8 h-8 rounded-full bg-black/60 text-white/80 hover:text-white text-sm">▲</button>
            <button onClick={() => pergi(1)} aria-label="Seterusnya" className="w-8 h-8 rounded-full bg-black/60 text-white/80 hover:text-white text-sm">▼</button>
          </div>
        )}
      </div>

      {bolehMuat && (
        <button onClick={() => setBukaMuat(true)} aria-label="Cipta video"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#1793D1] text-white text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all">
          🎥
        </button>
      )}

      {bukaMuat && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={() => setBukaMuat(false)}>
          <form onSubmit={muatNaik} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#171A21] text-gray-900 dark:text-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <p className="font-black text-sm">🎬 CIPTA VIDEO RVIDS</p>
            <input value={fTajuk} onChange={(e) => setFTajuk(e.target.value)} placeholder="Tajuk video" className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none" />
            <input value={fPenerangan} onChange={(e) => setFPenerangan(e.target.value)} placeholder="Penerangan (pilihan)" className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none" />
            <div className="flex flex-wrap gap-1.5">
              {KATEGORI.map((k) => (
                <button type="button" key={k} onClick={() => setFKategori(k)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${fKategori === k ? 'bg-[#1793D1] text-white border-[#1793D1]' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}>{k}</button>
              ))}
            </div>
            <label className="block cursor-pointer bg-gray-100 dark:bg-[#11141b] border border-dashed border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-xs font-bold text-center">
              {failVideo ? `✓ ${failVideo.name}` : 'Pilih Video MP4 (maks 50MB)…'}
              <input type="file" accept="video/*" className="hidden" onChange={(e) => setFailVideo(e.target.files?.[0] || null)} />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setBukaMuat(false)} className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-xs font-bold">Batal</button>
              <button disabled={naikSibuk} className="flex-1 bg-[#1793D1] text-white py-2 rounded-lg text-xs font-black disabled:opacity-50">{naikSibuk ? 'Memuat naik…' : '🚀 Siaran'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
