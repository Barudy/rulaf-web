'use client';

import React, { useState, useEffect } from 'react';

export default function CountDownUpkk() {
  const [bakiMasa, setBakiMasa] = useState({
    hari: 0,
    jam: 0,
    minit: 0,
    saat: 0,
    selesai: false
  });

  useEffect(() => {
    // Tarikh Peperiksaan UPKK: 2 November 2026, 8:00 AM (Waktu Malaysia)
    const tarikhUpkk = new Date('2026-11-02T08:00:00+08:00').getTime();

    const kiraMasa = () => {
      const sekarang = new Date().getTime();
      const perbezaan = tarikhUpkk - sekarang;

      if (perbezaan <= 0) {
        setBakiMasa({ hari: 0, jam: 0, minit: 0, saat: 0, selesai: true });
        return;
      }

      const hari = Math.floor(perbezaan / (1000 * 60 * 60 * 24));
      const jam = Math.floor((perbezaan % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minit = Math.floor((perbezaan % (1000 * 60 * 60)) / (1000 * 60));
      const saat = Math.floor((perbezaan % (1000 * 60)) / 1000);

      setBakiMasa({ hari, jam, minit, saat, selesai: false });
    };

    kiraMasa();
    const interval = setInterval(kiraMasa, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-[#1793D1]/20 to-blue-900/40 border border-[#1793D1]/50 rounded-xl p-4 sm:p-5 shadow-lg text-center font-mono my-6">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        <span className="text-xs sm:text-sm font-black tracking-widest text-[#1793D1] dark:text-[#42a5f5] uppercase">
          ⏳ DETIK MENGHADAPI PEPERIKSAAN UPKK 2026
        </span>
      </div>

      {bakiMasa.selesai ? (
        <p className="text-lg font-bold text-emerald-400">
          🎉 SELAMAT MENDUDUKI PEPERIKSAAN UPKK! BITTWFIQ WANNAJAH!
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-[#11141b]/90 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white block">
              {bakiMasa.hari}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Hari</span>
          </div>

          <div className="bg-white/80 dark:bg-[#11141b]/90 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white block">
              {String(bakiMasa.jam).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Jam</span>
          </div>

          <div className="bg-white/80 dark:bg-[#11141b]/90 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white block">
              {String(bakiMasa.minit).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Minit</span>
          </div>

          <div className="bg-white/80 dark:bg-[#11141b]/90 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-[#1793D1] block">
              {String(bakiMasa.saat).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Saat</span>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
        Tarikh Mula: <strong className="text-gray-700 dark:text-gray-200">2 November 2026</strong> | Teruskan latih tubi RuLaF & kuiz hibrid!
      </p>
    </div>
  );
}