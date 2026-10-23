'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../app/lib/supabaseClient';

/**
 * RvidsKad — satu video menegak: main/jeda, suka, komen, kongsi, lapor.
 * Cermin kelakuan Kotlin: rollback optimistik + kira views sekali.
 */
export default function RvidsKad({
  video,
  userEmail,
  aktif,
  onBukaPanel,
}: {
  video: any;
  userEmail: string;
  aktif: boolean;
  onBukaPanel?: () => void;
}) {
  const refVideo = useRef<HTMLVideoElement>(null);
  const sudahKira = useRef(false);

  const [suka, setSuka] = useState(false);
  const [kiraSuka, setKiraSuka] = useState(video.likes || 0);
  const [kiraKongsi, setKiraKongsi] = useState(video.shares || 0);
  const [kiraKomen, setKiraKomen] = useState(0);

  const [bukaLapor, setBukaLapor] = useState(false);
  const [sebabLapor, setSebabLapor] = useState('Kandungan tidak sesuai');
  const [notaLapor, setNotaLapor] = useState('');

  // Main hanya video aktif; kira tontonan sekali
  useEffect(() => {
    const v = refVideo.current;
    if (!v) return;
    if (aktif) {
      v.play().catch(() => {});
      if (!sudahKira.current) {
        sudahKira.current = true;
        (async () => {
          await supabase.from('rulaf_videos').update({ views: (video.views || 0) + 1 }).eq('id', video.id);
        })();
      }
    } else {
      v.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktif]);

  // Status suka + bilangan komen
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('rulaf_video_likes').select('pengguna').eq('video_id', video.id);
      if (data) {
        setKiraSuka(data.length);
        setSuka(data.some((r: any) => (r.pengguna || '').toLowerCase() === (userEmail || '').toLowerCase()));
      }
      const { count } = await supabase.from('rulaf_video_komentar').select('*', { count: 'exact', head: true }).eq('video_id', video.id);
      setKiraKomen(count || 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const togolSuka = async () => {
    if (!userEmail) return alert('[!] Sila log masuk untuk suka.');
    if (!suka) {
      setSuka(true); setKiraSuka((c) => c + 1);
      const { error } = await supabase.from('rulaf_video_likes').insert([{ video_id: video.id, pengguna: userEmail }]);
      if (error) { setSuka(false); setKiraSuka((c) => Math.max(0, c - 1)); alert('Gagal simpan suka: ' + error.message); }
    } else {
      setSuka(false); setKiraSuka((c) => Math.max(0, c - 1));
      const { error } = await supabase.from('rulaf_video_likes').delete().eq('video_id', video.id).eq('pengguna', userEmail);
      if (error) { setSuka(true); setKiraSuka((c) => c + 1); alert('Gagal buang suka: ' + error.message); }
    }
  };

  const kirimLaporan = async () => {
    if (!userEmail) return alert('[!] Sila log masuk untuk melapor.');
    const { error } = await supabase.from('rulaf_video_laporan').insert([{ video_id: video.id, pelapor: userEmail, sebab: sebabLapor, keterangan: notaLapor.trim() }]);
    if (error) alert('Gagal hantar laporan: ' + error.message);
    else { alert('✓ Laporan dihantar. Terima kasih.'); setBukaLapor(false); setNotaLapor(''); }
  };

  const kongsi = async () => {
    const teks = `${video.tajuk_video} — ${window.location.origin}/rvids`;
    try {
      const nav: any = navigator;
      if (nav.share) { await nav.share({ title: video.tajuk_video, text: teks }); }
      else { await navigator.clipboard.writeText(teks); alert('Pautan disalin!'); }
      const baru = kiraKongsi + 1;
      setKiraKongsi(baru);
      await supabase.from('rulaf_videos').update({ shares: baru }).eq('id', video.id);
    } catch { /* batal kongsi — abaikan */ }
  };

  return (
    <div data-rvids-id={video.id} className="relative h-full w-full bg-black snap-start snap-always shrink-0 flex items-center justify-center overflow-hidden">
      <video ref={refVideo} src={video.pautan_video} className="h-full w-full object-contain" loop muted={false} playsInline preload="metadata" onClick={(e) => { const v = e.currentTarget; v.paused ? v.play().catch(() => {}) : v.pause(); }} />
      {/* Aksi sisi */}
      <div className="absolute right-2 bottom-6 flex flex-col items-center gap-4 text-white">
        <button onClick={togolSuka} className="flex flex-col items-center gap-0.5">
          <span className={`text-2xl ${suka ? 'text-red-500' : 'text-white'}`}>{suka ? '❤️' : '🤍'}</span>
          <span className="text-[10px] font-bold">{kiraSuka}</span>
        </button>
        <button onClick={() => onBukaPanel?.()} className="flex flex-col items-center gap-0.5" aria-label="Buka komen">
          <span className="text-2xl">💬</span>
          <span className="text-[10px] font-bold">{kiraKomen}</span>
        </button>
        <button onClick={kongsi} className="flex flex-col items-center gap-0.5">
          <span className="text-2xl">↗️</span>
          <span className="text-[10px] font-bold">{kiraKongsi}</span>
        </button>
        <button onClick={() => setBukaLapor(true)} className="text-xl text-white/80">⋮</button>
      </div>
      {/* Lapor */}
      {bukaLapor && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6" onClick={() => setBukaLapor(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#171A21] rounded-2xl p-5 w-full max-w-xs space-y-3 text-gray-900 dark:text-white">
            <p className="text-sm font-black">Lapor Video Ini</p>
            <select value={sebabLapor} onChange={(e) => setSebabLapor(e.target.value)} className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs">
              {['Kandungan tidak sesuai', 'Keganasan atau bahaya', 'Spam atau mengelirukan', 'Pelanggaran hak cipta', 'Lain-lain'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={notaLapor} onChange={(e) => setNotaLapor(e.target.value)} placeholder="Keterangan (pilihan)" className="w-full bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs" />
            <div className="flex gap-2">
              <button onClick={() => setBukaLapor(false)} className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-xs font-bold">Batal</button>
              <button onClick={kirimLaporan} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-black">Hantar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
