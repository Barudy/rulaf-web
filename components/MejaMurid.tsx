'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabaseClient';
import { janaQrDataUrl, muatTurunPng, kiraKomposit6040 } from '../app/lib/rulafTenant';

const BULAN = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const TAHUN = ['2024','2025','2026','2027','2028'];

/**
 * MejaMurid — jadual pukal gaya Toyyibpay untuk guru.
 * Lajur: Nama, MyKid, Jantina, Alamat, Token, QR, Hasil RuLaF (bulan+tahun).
 * Aksi baris: Edit, Padam, Aktif/Nyahaktif. Pilihan pukal + carian.
 */
export default function MejaMurid({ email, isAdmin, refreshKey }: { email: string; isAdmin: boolean; refreshKey: number }) {
  const [murid, setMurid] = useState<any[]>([]);
  const [markah, setMarkah] = useState<Record<string, any>>({});
  const [memuat, setMemuat] = useState(true);

  const [cari, setCari] = useState('');
  const [tapisKelas, setTapisKelas] = useState('');
  const [tapisStatus, setTapisStatus] = useState('');
  const [bulan, setBulan] = useState('Ogos');
  const [tahun, setTahun] = useState('2026');

  const [pilih, setPilih] = useState<string[]>([]);
  const [sunting, setSunting] = useState<any | null>(null);
  const [fEdit, setFEdit] = useState({ nama: '', jantina: 'Lelaki', alamat: '', kelas: '', merit: '0', demerit: '0' });

  const muat = async () => {
    setMemuat(true);
    let senarai: any[] = [];
    try {
      if (isAdmin) {
        const { data, error } = await supabase.from('data_murid').select('*').order('nama_murid');
        if (error) throw error;
        senarai = data || [];
      } else {
        const { data: sk } = await supabase.from('rulaf_sekolah').select('id').eq('email_guru', email);
        const ids = (sk || []).map((s: any) => s.id);
        if (ids.length === 0) { setMurid([]); setMemuat(false); return; }
        const { data, error } = await supabase.from('data_murid').select('*').in('sekolah_id', ids).order('nama_murid');
        if (error) throw error;
        senarai = data || [];
      }
    } catch (e: any) {
      const { data } = await supabase.from('data_murid').select('*').order('nama_murid');
      senarai = isAdmin ? (data || []) : [];
    }
    setMurid(senarai);
    setPilih([]);
    setMemuat(false);
  };

  const muatMarkah = async (senarai: any[]) => {
    if (senarai.length === 0) { setMarkah({}); return; }
    const bt = `${bulan} ${tahun}`;
    const { data } = await supabase.from('markah_murid').select('*').eq('bulan_tahun', bt).in('mykid', senarai.map((m: any) => m.mykid));
    const peta: Record<string, any> = {};
    (data || []).forEach((r: any) => { peta[r.mykid] = r; });
    setMarkah(peta);
  };

  useEffect(() => { muat(); }, [email, refreshKey]);
  useEffect(() => { muatMarkah(murid); }, [murid, bulan, tahun]);

  const tapis = murid.filter((m: any) => {
    if (cari && !`${m.nama_murid} ${m.mykid}`.toLowerCase().includes(cari.toLowerCase())) return false;
    if (tapisKelas && m.kelas_id !== tapisKelas) return false;
    if (tapisStatus && (m.status_akaun || 'aktif') !== tapisStatus) return false;
    return true;
  });
  const senaraiKelas = [...new Set(murid.map((m: any) => m.kelas_id).filter(Boolean))];

  const togolPilih = (mykid: string) => setPilih((p) => (p.includes(mykid) ? p.filter((x) => x !== mykid) : [...p, mykid]));

  const muatQr = async (m: any) => {
    if (!m.token_id) return alert('[!] Murid ini tiada token.');
    const qr = await janaQrDataUrl(m.token_id);
    muatTurunPng(qr, `QR-${m.token_id}-${m.mykid}.png`);
  };

  const tukarStatus = async (m: any, status: string) => {
    if (!window.confirm(`${status === 'aktif' ? 'Aktifkan' : 'Nyahaktifkan'} akaun ${m.nama_murid}?`)) return;
    const { error } = await supabase.from('data_murid').update({ status_akaun: status }).eq('mykid', m.mykid);
    if (error) alert('Ralat: ' + error.message); else muat();
  };

  const pukalNyahaktif = async () => {
    if (pilih.length === 0 || !window.confirm(`Nyahaktifkan ${pilih.length} akaun terpilih?`)) return;
    const { error } = await supabase.from('data_murid').update({ status_akaun: 'nyahaktif' }).in('mykid', pilih);
    if (error) alert('Ralat: ' + error.message); else muat();
  };

  const padam = async (m: any) => {
    if (!window.confirm(`Padam ${m.nama_murid} (${m.mykid}) secara KEKAL?`)) return;
    const { error } = await supabase.from('data_murid').delete().eq('mykid', m.mykid);
    if (error) alert('Ralat: ' + error.message); else muat();
  };

  const bukaSunting = (m: any) => {
    setSunting(m);
    setFEdit({ nama: m.nama_murid || '', jantina: m.jantina || 'Lelaki', alamat: m.alamat || '', kelas: m.kelas_id || '', merit: String(m.merit ?? 0), demerit: String(m.demerit ?? 0) });
  };

  const simpanSunting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sunting) return;
    const { error } = await supabase.from('data_murid').update({
      nama_murid: fEdit.nama.trim(), jantina: fEdit.jantina, alamat: fEdit.alamat.trim(), kelas_id: fEdit.kelas.trim(),
      merit: Math.max(0, parseInt(fEdit.merit) || 0), demerit: Math.max(0, parseInt(fEdit.demerit) || 0),
    }).eq('mykid', sunting.mykid);
    if (error) alert('Ralat: ' + error.message);
    else { setSunting(null); muat(); }
  };

  const inputCls = 'bg-white dark:bg-[#11141b] border border-gray-300 dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none';

  return (
    <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-black mr-auto">📋 Senarai Murid <span className="font-mono text-[10px] text-gray-500 font-normal">({tapis.length})</span></h3>
        <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="🔍 Cari nama / MyKid" className={`${inputCls} w-44`} />
        <select value={tapisKelas} onChange={(e) => setTapisKelas(e.target.value)} className={inputCls}>
          <option value="">Semua Kelas</option>
          {senaraiKelas.map((k: string) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={tapisStatus} onChange={(e) => setTapisStatus(e.target.value)} className={inputCls}>
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nyahaktif">Nyahaktif</option>
        </select>
        <select value={bulan} onChange={(e) => setBulan(e.target.value)} className={inputCls}>{BULAN.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={tahun} onChange={(e) => setTahun(e.target.value)} className={inputCls}>{TAHUN.map((t) => <option key={t}>{t}</option>)}</select>
        {pilih.length > 0 && (
          <button onClick={pukalNyahaktif} className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-amber-500">
            Nyahaktif ({pilih.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#11141b] text-gray-500 uppercase text-[10px]">
              <th className="p-3 w-8"><input type="checkbox" checked={tapis.length > 0 && pilih.length === tapis.length} onChange={() => setPilih(pilih.length === tapis.length ? [] : tapis.map((m: any) => m.mykid))} /></th>
              <th className="p-3">Nama</th><th className="p-3">MyKid</th><th className="p-3">Jantina</th>
              <th className="p-3">Alamat</th><th className="p-3">No. Token</th><th className="p-3">QR</th>
              <th className="p-3">Hasil RuLaF ({bulan} {tahun})</th><th className="p-3">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {memuat ? (
              <tr><td colSpan={9} className="p-6 text-center text-gray-400 animate-pulse">Memuatkan…</td></tr>
            ) : tapis.length === 0 ? (
              <tr><td colSpan={9} className="p-6 text-center text-gray-400">Tiada murid. Daftar murid baharu di atas.</td></tr>
            ) : tapis.map((m: any) => {
              const r = markah[m.mykid];
              const komp = r ? kiraKomposit6040(r.markah_jawi, r.ujian_bertulis) : null;
              const aktif = (m.status_akaun || 'aktif') === 'aktif';
              return (
                <tr key={m.mykid} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#11141b]/60 ${!aktif ? 'opacity-50' : ''}`}>
                  <td className="p-3"><input type="checkbox" checked={pilih.includes(m.mykid)} onChange={() => togolPilih(m.mykid)} /></td>
                  <td className="p-3 font-bold">{m.nama_murid}<span className="block text-[10px] text-gray-400 font-mono">{m.kelas_id}{!aktif && ' · NYAHAKTIF'}</span></td>
                  <td className="p-3 font-mono">{m.mykid}</td>
                  <td className="p-3">{m.jantina || '—'}</td>
                  <td className="p-3 max-w-[160px] truncate" title={m.alamat || ''}>{m.alamat || '—'}</td>
                  <td className="p-3 font-mono text-[#1793D1]">{m.token_id || '—'}</td>
                  <td className="p-3"><button onClick={() => muatQr(m)} disabled={!m.token_id} className="bg-gray-100 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 px-2 py-1 rounded text-[10px] font-black hover:border-[#1793D1] disabled:opacity-40">⬇ QR</button></td>
                  <td className="p-3">{r ? <span className="inline-block bg-[#1793D1]/10 text-[#1793D1] font-black px-2 py-0.5 rounded-full text-[10px]">{r.tahap_rulaf || komp?.tahap} · {komp?.peratus}%</span> : <span className="text-gray-400 text-[10px]">Tiada rekod</span>}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => bukaSunting(m)} className="text-[#1793D1] font-black mr-2 hover:underline">Edit</button>
                    <button onClick={() => tukarStatus(m, aktif ? 'nyahaktif' : 'aktif')} className="text-amber-600 font-black mr-2 hover:underline">{aktif ? 'Nyahaktif' : 'Aktifkan'}</button>
                    <button onClick={() => padam(m)} className="text-red-500 font-black hover:underline">Padam</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sunting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSunting(null)}>
          <form onSubmit={simpanSunting} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#171A21] rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="text-sm font-black">✏️ Sunting — <span className="font-mono">{sunting.mykid}</span></h3>
            <input value={fEdit.nama} onChange={(e) => setFEdit({ ...fEdit, nama: e.target.value })} placeholder="Nama" className={`${inputCls} w-full`} />
            <select value={fEdit.jantina} onChange={(e) => setFEdit({ ...fEdit, jantina: e.target.value })} className={`${inputCls} w-full`}><option>Lelaki</option><option>Perempuan</option></select>
            <input value={fEdit.alamat} onChange={(e) => setFEdit({ ...fEdit, alamat: e.target.value })} placeholder="Alamat" className={`${inputCls} w-full`} />
            <input value={fEdit.kelas} onChange={(e) => setFEdit({ ...fEdit, kelas: e.target.value })} placeholder="Kelas" className={`${inputCls} w-full`} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-green-600">✅ Merit</label>
                <input type="number" min="0" value={fEdit.merit} onChange={(e) => setFEdit({ ...fEdit, merit: e.target.value })} className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-red-500">⚠️ Demerit</label>
                <input type="number" min="0" value={fEdit.demerit} onChange={(e) => setFEdit({ ...fEdit, demerit: e.target.value })} className={`${inputCls} w-full`} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSunting(null)} className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-xs font-bold">Batal</button>
              <button className="flex-1 bg-[#1793D1] text-white py-2 rounded-lg text-xs font-black hover:bg-[#1272ab]">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
