'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabaseClient';

/**
 * RvidsPanel — panel kiri (deskripsi + komen) supaya susun atur berbeza
 * daripada YT Shorts/TikTok (yang letak teks di bawah & komen di sheet).
 */
export default function RvidsPanel({
  video,
  userEmail,
  onTutup,
}: {
  video: any;
  userEmail: string;
  onTutup?: () => void;
}) {
  const [senaraiKomen, setSenaraiKomen] = useState<any[]>([]);
  const [teksKomen, setTeksKomen] = useState('');
  const [hantarKomen, setHantarKomen] = useState(false);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    muatKomen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const muatKomen = async () => {
    setMemuat(true);
    const { data } = await supabase
      .from('rulaf_video_komentar')
      .select('*')
      .eq('video_id', video.id)
      .order('created_at', { ascending: true });
    setSenaraiKomen(data || []);
    setMemuat(false);
  };

  const kirimKomen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teksKomen.trim() || !userEmail) return;
    setHantarKomen(true);
    const { error } = await supabase
      .from('rulaf_video_komentar')
      .insert([{ video_id: video.id, penulis: userEmail, isi: teksKomen.trim() }]);
    if (error) alert('Gagal hantar komen: ' + error.message);
    else { setTeksKomen(''); muatKomen(); }
    setHantarKomen(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0f14] text-gray-100">
      {/* Deskripsi video */}
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-sky-300">@{video.pencipta_nama || video.pencipta || 'RuLaF'}</p>
            <h1 className="mt-1 text-base font-black leading-snug text-white">{video.tajuk_video}</h1>
            <span className="mt-1.5 inline-block rounded-full bg-[#1793D1]/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
              #{video.kategori || 'Jawi'}
            </span>
          </div>
          {onTutup && (
            <button
              onClick={onTutup}
              aria-label="Tutup panel"
              className="shrink-0 rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {video.penerangan && (
          <p className="mt-3 whitespace-pre-line text-[12px] leading-relaxed text-gray-300">{video.penerangan}</p>
        )}
      </div>

      {/* Komen */}
      <div className="shrink-0 border-b border-white/10 px-4 py-2.5">
        <p className="text-[11px] font-black uppercase tracking-wide text-gray-300">
          💬 Komen ({senaraiKomen.length})
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {memuat ? (
          <p className="text-[11px] text-gray-500 animate-pulse">Memuatkan komen…</p>
        ) : senaraiKomen.length === 0 ? (
          <p className="text-[11px] text-gray-500">Tiada komen lagi. Jadilah yang pertama!</p>
        ) : (
          senaraiKomen.map((k: any) => (
            <div key={k.id ?? `${k.penulis}-${k.created_at}`} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold text-sky-300">{k.penulis}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-200">{k.isi}</p>
            </div>
          ))
        )}
      </div>

      {/* Borang komen */}
      <form onSubmit={kirimKomen} className="shrink-0 border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={teksKomen}
            onChange={(e) => setTeksKomen(e.target.value)}
            placeholder={userEmail ? 'Tulis komen…' : 'Log masuk untuk komen'}
            disabled={!userEmail}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-[#1793D1] focus:outline-none"
          />
          <button
            disabled={hantarKomen || !userEmail || !teksKomen.trim()}
            className="rounded-lg bg-[#1793D1] px-3 text-xs font-black text-white disabled:opacity-40"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
