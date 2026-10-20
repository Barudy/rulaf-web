'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

/** 📝 Pendaftaran Terbuka Guru — menunggu kelulusan Admin. */
export default function HalamanDaftar() {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState('');
  const [jantina, setJantina] = useState('Lelaki');
  const [email, setEmail] = useState('');
  const [kataLaluan, setKataLaluan] = useState('');
  const [ulangKataLaluan, setUlangKataLaluan] = useState('');
  const [jawapan2, setJawapan2] = useState('');
  const [setujuSumbang, setSetujuSumbang] = useState(false);
  const [sedangHantar, setSedangHantar] = useState(false);
  const [berjaya, setBerjaya] = useState(false);

  const hantar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !kataLaluan) return alert('[!] Sila isi nama, e-mel dan kata laluan.');
    if (umur && (parseInt(umur) < 18 || parseInt(umur) > 80)) return alert('[!] Umur tidak munasabah.');
    if (kataLaluan.length < 6) return alert('[!] Kata laluan mesti sekurang-kurangnya 6 aksara.');
    if (kataLaluan !== ulangKataLaluan) return alert('[!] Kata laluan tidak sepadan.');
    if (!jawapan2.trim()) return alert('[!] Sila jawab Soalan 2 (bagaimana RuLaFHub membantu PdP anda).');
    if (!setujuSumbang) return alert('[!] Sila sahkan Soalan 3 (sumbangan & arahan anti-phishing).');

    setSedangHantar(true);
    try {
      // 1. Cipta akaun auth (pengguna boleh log masuk tetapi DISEKIT sebelum diluluskan)
      const { data: daftar, error: eDaftar } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: kataLaluan,
      });
      if (eDaftar) throw eDaftar;

      // 0. Profil sementara (peranan Guru automatik, DISEKIT sehingga admin luluskan)
      const { error: eProfil } = await supabase.from('profil_pengguna').upsert({
        email: email.trim().toLowerCase(),
        nama: nama.trim(),
        peranan: 'Guru',
        status: 'menunggu',
      }, { onConflict: 'email' });
      if (eProfil) console.error('Profil:', eProfil.message);

      // 2. Rekod pendaftaran + 3 soalan screener untuk kelulusan admin
      const { error: eRekod } = await supabase.from('rulaf_pendaftaran_guru').insert([{
        email: email.trim().toLowerCase(),
        nama: nama.trim(),
        umur: umur ? parseInt(umur) : null,
        jantina,
        jawapan_1: 'Ya — Saya seorang guru',
        jawapan_2: jawapan2.trim(),
        jawapan_3: 'Ya — Saya bersetuju menyumbang & arahan anti-phishing dibaca (akaun akan BAN/PADAM segera jika menyebar link phishing)',
      }]);
      if (eRekod) throw eRekod;

      setBerjaya(true);
    } catch (err: any) {
      alert('Gagal mendaftar: ' + (err.message || err));
    } finally {
      setSedangHantar(false);
    }
  };

  if (berjaya) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#171A21] border border-emerald-500/50 rounded-xl p-8 text-center space-y-4">
          <span className="text-5xl block">✅</span>
          <h1 className="text-lg font-black text-white">Pendaftaran Diterima!</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Terima kasih, <span className="text-[#1793D1] font-bold">{nama}</span>. Permohonan anda kini{' '}
            <span className="text-amber-400 font-bold">MENUNGGU KELULUSAN</span> daripada pentadbir RuLaFHub.
            Anda akan dapat mengakses penuh (BBM/RUR, Kuiz, Forum, Rvids) selepas diluluskan.
          </p>
          <Link href="/login" className="block bg-[#1793D1] text-[#0F1419] py-2.5 rounded text-xs font-black hover:bg-blue-400 transition-colors">
            [ Ke Halaman Log Masuk ]
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full bg-[#0F1419] border border-gray-700 p-2 rounded text-sm text-white focus:border-[#1793D1] focus:outline-none';

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10">
      <div className="max-w-xl mx-auto bg-[#171A21] border border-[#1793D1] rounded shadow-lg overflow-hidden">
        <div className="bg-[#1793D1] text-[#0F1419] px-6 py-4 flex justify-between items-center font-bold text-sm">
          <span>📝 DAFTAR AKAUN GURU RULAFHUB</span>
          <Link href="/login" className="text-white hover:underline">[ cd ~/ Login ]</Link>
        </div>

        <form onSubmit={hantar} className="p-6 sm:p-8 space-y-6 text-xs">

          {/* Maklumat Diri */}
          <section className="space-y-3 bg-gray-900/40 p-5 rounded border border-gray-800">
            <h2 className="text-sm font-black text-white border-b border-gray-800 pb-2">1. Maklumat Diri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Nama Penuh</label>
                <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Cth: Mohd Ismail bin Noor" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Umur</label>
                <input type="number" min="18" max="80" value={umur} onChange={(e) => setUmur(e.target.value)} placeholder="Cth: 32" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Jantina</label>
                <select value={jantina} onChange={(e) => setJantina(e.target.value)} className={inputCls}>
                  <option>Lelaki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">E-mel</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guru@sekolah.edu.my" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Kata Laluan</label>
                <input type="password" required minLength={6} value={kataLaluan} onChange={(e) => setKataLaluan(e.target.value)} placeholder="Minimum 6 aksara" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Ulang Kata Laluan</label>
                <input type="password" required value={ulangKataLaluan} onChange={(e) => setUlangKataLaluan(e.target.value)} placeholder="Taip semula" className={inputCls} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">Peranan: <span className="text-[#1793D1] font-bold">Guru</span> (automatik — akses penuh BBM/RUR, Kuiz, Forum, Rvids selepas kelulusan).</p>
          </section>

          {/* Tiga Soalan Screener */}
          <section className="space-y-4 bg-gray-900/40 p-5 rounded border border-gray-800">
            <h2 className="text-sm font-black text-white border-b border-gray-800 pb-2">2. Soalan Screener (untuk kelulusan Admin)</h2>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-bold">Soalan 1: Adakah kamu seorang guru?</label>
              <input type="text" readOnly value="Ya" className={`${inputCls} opacity-70 cursor-not-allowed`} />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-bold">Soalan 2: Bagaimana RuLaFHub ini boleh membantu kamu dalam sesi PdP/PdPc/PdPr? <span className="text-amber-400">(subjektif — ditanda oleh Admin)</span></label>
              <textarea rows={4} required value={jawapan2} onChange={(e) => setJawapan2(e.target.value)} placeholder="Tuliskan secara ringkas bagaimana platform ini membantu pengajaran & pembelajaran anda..." className={inputCls} />
            </div>

            <div className="border border-red-500/40 bg-red-950/20 rounded p-3 space-y-2">
              <label className="block text-[10px] font-bold text-red-400 uppercase">Soalan 3: Adakah kamu akan memberikan sumbangan terhadap RuLaFHub?</label>
              <p className="text-[10px] text-red-300/80 leading-relaxed">
                ⚠️ <strong>AMARAN RASMI:</strong> Sebarang guru yang menyebarkan link phishing atau kandungan berniat jahat melalui RuLaFHub akan menyebabkan akaunnya <strong>BAN atau PADAM dengan serta-merta</strong> tanpa notis.
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={setujuSumbang} onChange={(e) => setSetujuSumbang(e.target.checked)} className="mt-0.5 accent-[#1793D1]" />
                <span className="text-[11px] text-gray-300 font-bold">Ya — Saya bersetuju menyumbang & telah membaca arahan anti-phishing di atas.</span>
              </label>
            </div>
          </section>

          <button type="submit" disabled={sedangHantar} className="w-full bg-[#1793D1] text-[#0F1419] py-3 rounded font-black text-sm hover:bg-blue-400 transition-colors disabled:opacity-50">
            {sedangHantar ? 'MENGHANTAR PERMOHONAN...' : '[ 🚀 HANTAR PERMOHONAN DAFTAR ]'}
          </button>
          <p className="text-center text-[10px] text-gray-500">Permohonan akan disemak & diluluskan oleh pentadbir RuLaFHub.</p>
        </form>
      </div>
    </div>
  );
}
