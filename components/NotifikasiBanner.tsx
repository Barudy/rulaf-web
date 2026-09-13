'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabaseClient';

export default function NotifikasiBanner() {
  const [notisList, setNotisList] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    tarikNotifikasi();
  }, []);

  const tarikNotifikasi = async () => {
    const { data } = await supabase
      .from('rulaf_notifikasi')
      .select('*')
      .eq('is_aktif', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) setNotisList(data);
  };

  const buangNotis = (id: number) => {
    setDismissed((prev) => [...prev, id]);
  };

  const paparan = notisList.filter((n) => !dismissed.includes(n.id));

  if (paparan.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-4">
      {paparan.map((n) => (
        <div
          key={n.id}
          className="flex items-start justify-between gap-3 p-3.5 bg-white dark:bg-[#11141b] border-l-4 border-l-[#1793D1] border border-gray-200 dark:border-gray-800 rounded text-xs font-mono shadow-sm"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-base">📢</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{n.tajuk}</span>
                <span className="bg-[#1793D1]/10 text-[#1793D1] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                  {n.kategori}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-sans leading-relaxed">{n.mesej}</p>
              {n.pautan_tindakan && (
                <a
                  href={n.pautan_tindakan}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1.5 text-[#1793D1] font-bold hover:underline"
                >
                  [ Teruskan ke Pautan ➔ ]
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => buangNotis(n.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}