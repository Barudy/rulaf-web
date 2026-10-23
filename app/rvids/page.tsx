'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import RvidsKad from '../../components/RvidsKad';
import RvidsPanel from '../../components/RvidsPanel';

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
  const [bukaPanel, setBukaPanel] = useState(false);
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

  // 🔒 Kunci scroll halaman supaya video sentiasa satu skrin penuh
  useEffect(() => {
    const asal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = asal; };
  }, []);

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
    <main className="h-[calc(100dvh-4rem)] overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-full w-full max-w-7xl lg:gap-4 lg:p-4">
        {/* Panel kiri (desktop): deskripsi + komen — bukan gaya Shorts/TikTok */}
        <aside className="hidden h-full w-[340px] shrink-0 overflow-hidden rounded-2xl border border-white/10 lg:block xl:w-[380px]">
          {videoKini ? (
            <RvidsPanel video={videoKini} userEmail={email} />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-gray-500">
              Tiada video untuk dipaparkan.
            </div>
          )}
        </aside>

        {/* Pentas video — tinggi tepat satu skrin, sapu/roda untuk seterusnya */}
        <div
          className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-black lg:rounded-2xl lg:border lg:border-white/10"
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
            <p className="text-xs text-gray-400 animate-pulse">Memuatkan Rvids…</p>
          ) : !videoKini ? (
            <p className="text-xs text-gray-400">Tiada video buat masa ini.</p>
          ) : (
            <div
              key={videoKini.id}
              className="relative h-full"
              style={{ aspectRatio: '9 / 16', maxWidth: '100%' }}
            >
              <RvidsKad
                video={videoKini}
                userEmail={email}
                aktif
                onBukaPanel={() => setBukaPanel(true)}
              />
            </div>
          )}

          {/* Penunjuk + kocok */}
          {videoKini && (
            <div className="absolute left-2 top-2 z-10 flex items-center gap-2">
              <span className="rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80">
                {pos + 1} / {video.length} · rawak 🔀
              </span>
              <button onClick={kocokSemula} title="Kocok semula" className="rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80 hover:text-white">
                🔀
              </button>
            </div>
          )}

          {/* Butang info (mudah alih) */}
          {videoKini && (
            <button
              onClick={() => setBukaPanel(true)}
              aria-label="Buka deskripsi & komen"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold text-white/90 hover:text-white lg:hidden"
            >
              ℹ️ Info & Komen
            </button>
          )}

          {/* Butang atas/bawah */}
          {videoKini && (
            <div className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
              <button onClick={() => pergi(-1)} aria-label="Sebelumnya" className="h-8 w-8 rounded-full bg-black/60 text-sm text-white/80 hover:text-white">▲</button>
              <button onClick={() => pergi(1)} aria-label="Seterusnya" className="h-8 w-8 rounded-full bg-black/60 text-sm text-white/80 hover:text-white">▼</button>
            </div>
          )}
        </div>
      </div>

      {/* Panel kiri (mudah alih) — drawer dari kiri */}
      {bukaPanel && videoKini && (
        <div className="fixed inset-0 z-[60] bg-black/60 lg:hidden" onClick={() => setBukaPanel(false)}>
          <div
            className="h-full w-[86%] max-w-sm border-r border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <RvidsPanel video={videoKini} userEmail={email} onTutup={() => setBukaPanel(false)} />
          </div>
        </div>
      )}

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
