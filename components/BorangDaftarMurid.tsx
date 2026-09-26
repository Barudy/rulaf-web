'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabaseClient';
import { janaTokenId, janaQrDataUrl, muatTurunPng } from '../app/lib/rulafTenant';

/**
 * BorangDaftarMurid — daftar sekolah, kelas & murid untuk guru.
 * Murid baharu: auto token_id unik + QR sedia muat turun.
 */
export default function BorangDaftarMurid({ email, onChanged }: { email: string; onChanged: () => void }) {
  const [sekolah, setSekolah] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [amaran, setAmaran] = useState('');

  const [namaSekolah, setNamaSekolah] = useState('');
  const [alamatSekolah, setAlamatSekolah] = useState('');
  const [sekolahPilih, setSekolahPilih] = useState('');
  const [namaKelas, setNamaKelas] = useState('');

  const [f, setF] = useState({ nama: '', mykid: '', jantina: 'Lelaki', alamat: '', kelasId: '' });
  const [hasilDaftar, setHasilDaftar] = useState<{ nama: string; token: string; qr: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  // 📤 BULK UPLOAD CSV (nama,mykid,jantina,alamat — satu kelas bagi setiap import)
  const [csvKelasId, setCsvKelasId] = useState('');
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvHasil, setCsvHasil] = useState<any[]>([]);
  const [csvSibuk, setCsvSibuk] = useState(false);

  const parseCSV = (teks: string): string[][] => {
    const baris: string[][] = [];
    let medan = '', dalam = false;
    let rekod: string[] = [];
    const tolak = () => { rekod.push(medan.trim()); medan = ''; };
    for (let i = 0; i < teks.length; i++) {
      const c = teks[i];
      if (dalam) {
        if (c === '"') {
          if (teks[i + 1] === '"') { medan += '"'; i++; }
          else dalam = false;
        } else medan += c;
      } else if (c === '"') dalam = true;
      else if (c === ',') tolak();
      else if (c === '\n') { tolak(); if (rekod.some((x) => x !== '')) baris.push(rekod); rekod = []; }
      else if (c !== '\r') medan += c;
    }
    tolak();
    if (rekod.some((x) => x !== '')) baris.push(rekod);
    return baris;
  };

  const muatTemplateCsv = () => {
    const csv = 'nama,mykid,jantina,alamat\nAhmad bin Ali,100101010101,Lelaki,No 1 Jalan Melur\nSiti binti Abu,100202020202,Perempuan,No 2 Jalan Mawar\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'template-murid.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const bacaFailCsv = async (fail: File | undefined) => {
    if (!fail) return;
    setCsvHasil([]);
    const teks = await fail.text();
    const baris = parseCSV(teks);
    if (baris.length < 2) { alert('[!] CSV kosong atau tiada baris data.'); return; }
    const kepala = baris[0].map((h) => h.toLowerCase());
    const idx = (names: string[]) => kepala.findIndex((h) => names.includes(h));
    const iNama = idx(['nama', 'nama_murid', 'nama penuh', 'name']);
    const iMykid = idx(['mykid', 'my kid', 'no mykid', 'id']);
    const iJan = idx(['jantina', 'gender', 'jantina murid']);
    const iAlm = idx(['alamat', 'address', 'alamat murid']);
    if (iNama < 0 || iMykid < 0) { alert('[!] Pengepala CSV mesti ada lajur "nama" dan "mykid".'); return; }
    const data = baris.slice(1).map((r) => ({
      nama: (r[iNama] || '').trim(),
      mykid: (r[iMykid] || '').replace(/\D/g, '').slice(0, 12),
      jantina: /perempuan/i.test(r[iJan] || '') ? 'Perempuan' : 'Lelaki',
      alamat: iAlm >= 0 ? (r[iAlm] || '').trim() : '',
    })).filter((r) => r.nama && r.mykid);
    if (data.length === 0) { alert('[!] Tiada baris sah (nama + mykid diperlukan).'); return; }
    setCsvRows(data);
  };

  const sahkanImportCsv = async () => {
    if (!csvKelasId) return alert('[!] Pilih kelas untuk semua murid dalam CSV.');
    if (csvRows.length === 0) return;
    const kelasDipilih = kelas.find((k: any) => String(k.id) === String(csvKelasId));
    if (!kelasDipilih) return alert('[!] Kelas tidak sah.');
    setCsvSibuk(true);
    const hasil: any[] = [];
    for (const r of csvRows) {
      try {
        let token = janaTokenId();
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase.from('data_murid').select('mykid').eq('token_id', token).maybeSingle();
          if (!data) break;
          token = janaTokenId();
        }
        const { error } = await supabase.from('data_murid').insert([{
          mykid: r.mykid, nama_murid: r.nama, jantina: r.jantina,
          kelas_id: kelasDipilih.nama_kelas, alamat: r.alamat,
          token_id: token, status_akaun: 'aktif', sekolah_id: kelasDipilih.sekolah_id,
        }]);
        if (error) throw error;
        const qr = await janaQrDataUrl(token);
        hasil.push({ ...r, ok: true, token, qr });
      } catch (err: any) {
        hasil.push({ ...r, ok: false, ralat: err.message || 'Gagal' });
      }
    }
    setCsvHasil(hasil);
    setCsvRows([]);
    setCsvSibuk(false);
    onChanged();
  };

  const muat = async () => {
    const { data: s } = await supabase.from('rulaf_sekolah').select('*').eq('email_guru', email).order('nama_sekolah');
    if (s) setSekolah(s);
    const { data: k } = await supabase.from('rulaf_kelas').select('*').eq('email_guru', email).order('nama_kelas');
    if (k) setKelas(k);
  };

  useEffect(() => { muat(); }, [email]);

  const semakKolum = (e: any) => {
    const m = `${e?.message || ''} ${e?.code || ''}`;
    if (/column|42703|PGRST204/i.test(m)) {
      setAmaran('Jadual DB belum dikemas kini — jalankan supabase/migrasi-multitenan.sql di SQL Editor.');
      return true;
    }
    return false;
  };

  const daftarSekolah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSekolah.trim()) return alert('[!] Nama sekolah diperlukan.');
    setSibuk(true); setAmaran('');
    const { error } = await supabase.from('rulaf_sekolah').insert([{ nama_sekolah: namaSekolah.trim(), alamat: alamatSekolah.trim(), email_guru: email }]);
    if (error) { if (!semakKolum(error)) alert('Ralat: ' + error.message); }
    else { setNamaSekolah(''); setAlamatSekolah(''); muat(); onChanged(); }
    setSibuk(false);
  };

  const daftarKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sekolahPilih || !namaKelas.trim()) return alert('[!] Pilih sekolah & nama kelas.');
    setSibuk(true); setAmaran('');
    const { error } = await supabase.from('rulaf_kelas').insert([{ nama_kelas: namaKelas.trim(), sekolah_id: Number(sekolahPilih), email_guru: email }]);
    if (error) { if (!semakKolum(error)) alert('Ralat: ' + error.message); }
    else { setNamaKelas(''); muat(); onChanged(); }
    setSibuk(false);
  };

  const daftarMurid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.nama.trim() || !f.mykid.trim() || !f.kelasId) return alert('[!] Nama, MyKid & kelas diperlukan.');
    setSibuk(true); setAmaran(''); setHasilDaftar(null);
    try {
      const kelasDipilih = kelas.find((k: any) => String(k.id) === String(f.kelasId));
      if (!kelasDipilih) throw new Error('Kelas tidak sah.');
      let token = janaTokenId();
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.from('data_murid').select('mykid').eq('token_id', token).maybeSingle();
        if (!data) break;
        token = janaTokenId();
      }
      const { error } = await supabase.from('data_murid').insert([{
        mykid: f.mykid.trim(), nama_murid: f.nama.trim(), jantina: f.jantina,
        kelas_id: kelasDipilih.nama_kelas, alamat: f.alamat.trim(),
        token_id: token, status_akaun: 'aktif', sekolah_id: kelasDipilih.sekolah_id,
      }]);
      if (error) throw error;
      const qr = await janaQrDataUrl(token);
      setHasilDaftar({ nama: f.nama.trim(), token, qr });
      setF({ nama: '', mykid: '', jantina: 'Lelaki', alamat: '', kelasId: '' });
      onChanged();
    } catch (err: any) {
      if (!semakKolum(err)) alert('Ralat daftar murid: ' + (err.message || err));
    } finally { setSibuk(false); }
  };

  const inputCls = 'w-full bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none';

  return (
    <div className="space-y-4">
      {amaran && <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl p-3 text-xs font-bold">⚠️ {amaran}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <form onSubmit={daftarSekolah} className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black">🏫 Daftar Sekolah Baharu</h3>
          <input value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} placeholder="Nama sekolah" className={inputCls} />
          <input value={alamatSekolah} onChange={(e) => setAlamatSekolah(e.target.value)} placeholder="Alamat sekolah" className={inputCls} />
          <button disabled={sibuk} className="w-full bg-[#1793D1] text-white py-2 rounded-lg text-xs font-black hover:bg-[#1272ab] disabled:opacity-50">+ Daftar Sekolah</button>
          {sekolah.length > 0 && <p className="text-[10px] text-gray-500 font-mono">Sekolah saya: {sekolah.map((s: any) => s.nama_sekolah).join(' · ')}</p>}
        </form>

        <form onSubmit={daftarKelas} className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black">🏷️ Daftar Kelas Baharu</h3>
          <select value={sekolahPilih} onChange={(e) => setSekolahPilih(e.target.value)} className={inputCls}>
            <option value="">— Pilih sekolah —</option>
            {sekolah.map((s: any) => <option key={s.id} value={s.id}>{s.nama_sekolah}</option>)}
          </select>
          <input value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} placeholder="Cth: 3 Murshid" className={inputCls} />
          <button disabled={sibuk} className="w-full bg-[#1793D1] text-white py-2 rounded-lg text-xs font-black hover:bg-[#1272ab] disabled:opacity-50">+ Daftar Kelas</button>
          {kelas.length > 0 && <p className="text-[10px] text-gray-500 font-mono">Kelas saya: {kelas.map((k: any) => k.nama_kelas).join(' · ')}</p>}
        </form>
      </div>

      <form onSubmit={daftarMurid} className="bg-white dark:bg-[#171A21] border border-[#1793D1]/40 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-black">🧒 Daftar Murid Baharu <span className="font-mono text-[10px] text-gray-500 font-normal">— token & QR auto</span></h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="Nama penuh murid" className={inputCls} />
          <input value={f.mykid} onChange={(e) => setF({ ...f, mykid: e.target.value.replace(/\D/g, '').slice(0, 12) })} placeholder="MyKid (12 digit)" className={`${inputCls} font-mono`} />
          <select value={f.jantina} onChange={(e) => setF({ ...f, jantina: e.target.value })} className={inputCls}>
            <option>Lelaki</option><option>Perempuan</option>
          </select>
          <select value={f.kelasId} onChange={(e) => setF({ ...f, kelasId: e.target.value })} className={inputCls}>
            <option value="">— Pilih kelas —</option>
            {kelas.map((k: any) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
          </select>
        </div>
        <input value={f.alamat} onChange={(e) => setF({ ...f, alamat: e.target.value })} placeholder="Alamat murid" className={inputCls} />
        <button disabled={sibuk} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-xs font-black hover:bg-green-500 disabled:opacity-50">
          {sibuk ? '⏳ Mendaftar…' : '✅ Daftar Murid + Jana Token & QR'}
        </button>
      </form>

      {hasilDaftar && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <img src={hasilDaftar.qr} alt="QR murid" className="w-28 h-28 rounded-lg border border-green-300 bg-white p-1" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-black text-green-700 dark:text-green-300">🎉 {hasilDaftar.nama} berjaya didaftar!</p>
            <p className="font-mono text-xs mt-1">Token: <b>{hasilDaftar.token}</b></p>
            <button onClick={() => muatTurunPng(hasilDaftar.qr, `QR-${hasilDaftar.token}.png`)} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-green-500">⬇ Muat Turun QR Code</button>
          </div>
        </div>
      )}

      {/* 📤 BULK UPLOAD CSV */}
      <div className="bg-white dark:bg-[#171A21] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-black mr-auto">📤 Bulk Upload via CSV</h3>
          <button onClick={muatTemplateCsv} className="text-[11px] font-bold text-[#1793D1] hover:underline">⬇ Muat turun template CSV</button>
        </div>
        <p className="text-[11px] text-gray-500">Format: <span className="font-mono">nama,mykid,jantina,alamat</span> — token & QR dijana automatik setiap baris.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <select value={csvKelasId} onChange={(e) => setCsvKelasId(e.target.value)} className={inputCls}>
            <option value="">— Kelas untuk semua baris —</option>
            {kelas.map((k: any) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
          </select>
          <label className="cursor-pointer bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-center hover:border-[#1793D1]">
            📁 Pilih fail CSV…
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { bacaFailCsv(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
        {csvRows.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-100 dark:bg-[#11141b] text-gray-500 sticky top-0">
                  <tr><th className="p-2">#</th><th className="p-2">Nama</th><th className="p-2">MyKid</th><th className="p-2">Jantina</th><th className="p-2">Alamat</th></tr>
                </thead>
                <tbody>
                  {csvRows.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="p-2 text-gray-400">{i + 1}</td><td className="p-2 font-bold">{r.nama}</td>
                      <td className="p-2 font-mono">{r.mykid}</td><td className="p-2">{r.jantina}</td><td className="p-2 truncate max-w-[140px]">{r.alamat || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={sahkanImportCsv} disabled={csvSibuk} className="w-full bg-green-600 text-white py-2.5 text-xs font-black hover:bg-green-500 disabled:opacity-50">
              {csvSibuk ? '⏳ Mengimport…' : `✅ Sahkan & Import ${csvRows.length} Murid`}
            </button>
          </div>
        )}
        {csvHasil.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-[#11141b] px-3 py-2 text-[11px] font-black">
              Hasil import: {csvHasil.filter((r) => r.ok).length} berjaya · {csvHasil.filter((r) => !r.ok).length} gagal
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <tbody>
                  {csvHasil.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="p-2 font-bold">{r.nama}</td>
                      <td className="p-2 font-mono">{r.mykid}</td>
                      {r.ok ? (
                        <>
                          <td className="p-2 font-mono text-[#1793D1]">{r.token}</td>
                          <td className="p-2"><button onClick={() => muatTurunPng(r.qr, `QR-${r.token}-${r.mykid}.png`)} className="text-[#1793D1] font-black hover:underline">⬇ QR</button></td>
                        </>
                      ) : (
                        <td colSpan={2} className="p-2 text-red-500">❌ {r.ralat}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
