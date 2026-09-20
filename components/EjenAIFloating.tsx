'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * 🤖 EJEN AI ANALISIS PRESTASI (NL2SQL) — WIDGET TERAPUNG
 * Widget boleh-diguna-semula untuk dashboard & blog.
 * Guna hujung API /api/ejen-ai (OpenRouter → NL2SQL → Supabase).
 */
interface EjenAIFloatingProps {
  label?: string;
}

export function EjenAIFloating({ label = 'Tanya Ejen AI' }: EjenAIFloatingProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [soalan, setSoalan] = useState('');
  const [hasil, setHasil] = useState<any[] | null>(null);
  const [sql, setSql] = useState('');
  const [memikir, setMemikir] = useState(false);
  const [ralat, setRalat] = useState('');

  const tanya = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soalan.trim()) return;
    setMemikir(true);
    setHasil(null);
    setSql('');
    setRalat('');

    try {
      const res = await fetch('/api/ejen-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soalan }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasil(data.data || data.results || []);
        setSql(data.sql || '');
      } else {
        setRalat(data.error || 'Gagal memproses soalan.');
      }
    } catch (err: any) {
      setRalat(err.message || 'Ralat sambungan.');
    } finally {
      setMemikir(false);
    }
  };

  const logKeluarAje = async () => {};

  return (
    <>
      {/* 🔵 Butang Terapung (FAB) */}
      <button
        onClick={() => setTerbuka((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 w-14 h-14 rounded-full bg-[#1793D1] text-white shadow-2xl shadow-[#1793D1]/40 hover:bg-[#1272ab] hover:scale-110 active:scale-95 transition-all font-black text-xl flex items-center justify-center border-2 border-white/20"
        aria-label="Ejen AI"
      >
        {terbuka ? '✕' : '🤖'}
      </button>

      {/* 🪟 Panel Sembang Ejen AI */}
      {terbuka && (
        <div className="fixed bottom-6 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-96 max-h-[70vh] flex flex-col bg-white dark:bg-[#171A21] border border-[#1793D1]/40 rounded-2xl shadow-2xl overflow-hidden font-mono">
          {/* Header Pane Tambem */}
          <div className="bg-gradient-to-r from-[#0F2027] to-[#1793D1]/80 p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Ejen RuLaFHub</p>
              <h3 className="text-sm font-black">🤖 Ejen AI Analisis Prestasi (NL2SQL)</h3>
            </div>
            <button onClick={() => setTerbuka(false)} className="text-white/70 hover:text-white text-lg font-black">✕</button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <p className="text-[10px] text-gray-500">
              Tanya soalan dalam bahasa tabii. Ejen AI akan menjana SQL untuk merungkai markah & rekod murid.
            </p>

            <form onSubmit={tanya} className="space-y-2">
              <input
                type="text"
                value={soalan}
                onChange={(e) => setSoalan(e.target.value)}
                placeholder="Cth: berapa murid dalam 3 Murshid yang lancar Al-Quran?"
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
              />
              <button
                type="submit"
                disabled={memikir}
                className="w-full bg-[#1793D1] text-white py-2 rounded-lg text-[11px] font-black hover:bg-[#1272ab] disabled:opacity-50 transition-all"
              >
                {memikir ? '⚙️ Memikir...' : '[ Tanya AI ]'}
              </button>
            </form>

            {ralat && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg p-3 text-[10px]">
                [!] {ralat}
              </div>
            )}

            {sql && (
              <div className="bg-[#0b0e14] border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-[#121620] px-3 py-1 text-[9px] text-gray-500 font-bold border-b border-gray-800">~% SQL</div>
                <pre className="p-3 text-[10px] text-cyan-400 overflow-x-auto whitespace-pre">{sql}</pre>
              </div>
            )}

            {hasil && hasil.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto">
                <div className="bg-gray-100 dark:bg-gray-800/40 px-3 py-1 text-[9px] text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                  [+] {hasil.length} REKOD DITEMUI
                </div>
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      {Object.keys(hasil[0]).map((k) => (
                        <th key={k} className="px-3 py-1.5 font-black uppercase text-gray-500">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hasil.map((baris, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800/60">
                        {Object.values(baris).map((v, j) => (
                          <td key={j} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {v !== null && v !== undefined ? String(v) : 'null'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EjenAIFloating;
