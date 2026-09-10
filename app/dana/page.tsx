'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function DanaPage() {
  const [lejar, setLejar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [pilihanJumlah, setPilihanJumlah] = useState<number>(10);
  const [jumlahKustom, setJumlahKustom] = useState<string>('');
  const [namaPenyumbang, setNamaPenyumbang] = useState<string>('');
  const [emelPenyumbang, setEmelPenyumbang] = useState<string>('');
  const [doaPenyumbang, setDoaPenyumbang] = useState<string>('');

  // Tambah di bahagian atas useEffect dalam app/dana/page.tsx
useEffect(() => {
  tarikDataLejar();

  // 🎯 SEMAKAN AUTOPILOT BILA KEMBALI DARIPADA BANK
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const statusId = urlParams.get('status_id');
    const billcode = urlParams.get('billcode');
    const refno = urlParams.get('transaction_id') || urlParams.get('refno');

    if (statusId === '1' && billcode) {
      sahDanRekodTransaksi(billcode, refno);
    }
  }
}, []);

// Fungsi pembantu untuk mengunci rekod terus ke Supabase
const sahDanRekodTransaksi = async (billcode: string, refno: string | null) => {
  try {
    // 1. Semak sama ada rekod sudah ada
    const query = supabase.from('rulaf_kewangan').select('id');
    if (refno) query.eq('ref_no', refno);
    else query.ilike('butiran', `%${billcode}%`);
    
    const { data: ada } = await query.maybeSingle();

    if (!ada) {
      // 2. Tarik maklumat transaksi terus daripada ToyyibPay
      const res = await fetch(`https://toyyibpay.com/index.php/api/getBillTransactions?billCode=${billcode}`);
      const data = await res.json();

      if (Array.isArray(data) && data[0]?.billpaymentStatus === '1') {
        const bayaran = data[0];
        await supabase.from('rulaf_kewangan').insert([
          {
            tarikh: new Date().toISOString().split('T')[0],
            jenis: 'masuk',
            kategori: 'Sumbangan Komuniti (FPX)',
            butiran: `Sumbangan FPX melalui ToyyibPay (Bil: ${billcode})`,
            jumlah: parseFloat(bayaran.billpaymentAmount),
            penyumbang_atau_penerima: bayaran.billPaidBy || 'Hamba Allah',
            ref_no: bayaran.billpaymentInvoiceNo || refno || `MANUAL-${billcode}`,
            status: 'selesai'
          }
        ]);
        // Segerakkan lejar serta-merta
        tarikDataLejar();
      }
    }
  } catch (e) {
    console.error('Ralat pengesahan automatik:', e);
  }
};

  const tarikDataLejar = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('rulaf_kewangan')
      .select('*')
      .order('tarikh', { ascending: false })
      .order('id', { ascending: false });

    if (data) setLejar(data);
    setIsLoading(false);
  };

  // Kiraan Ringkasan Kewangan
  const totalMasuk = lejar
    .filter((item) => item.jenis === 'masuk')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const totalKeluar = lejar
    .filter((item) => item.jenis === 'keluar')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const bakiBersih = totalMasuk - totalKeluar;

  const hantarSumbangan = async (e: React.FormEvent) => {
    e.preventDefault();
    const jumlahAkhir = jumlahKustom ? parseFloat(jumlahKustom) : pilihanJumlah;

    if (!jumlahAkhir || jumlahAkhir < 2) {
      alert('Sila masukkan nilai sumbangan sekurang-kurangnya RM 2.00');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/derma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: namaPenyumbang || 'Hamba Allah',
          emel: emelPenyumbang || 'penyumbang@rulafhub.com',
          jumlah: jumlahAkhir,
          doa: doaPenyumbang
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Alih terus ke FPX ToyyibPay
      } else {
        alert(data.error || 'Ralat memulakan pembayaran.');
      }
    } catch (err: any) {
      alert('Ralat sambungan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigasi Utama */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-xs text-[#1793D1] hover:underline font-bold">
            [ &lt;-- Kembali ke Laman Utama ]
          </Link>
          <span className="text-xs text-gray-500">RULAF-FINANCIAL-CORE :: v1.0</span>
        </div>

        {/* Pengenalan & Prinsip Ketelusan */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1]/40 rounded-xl p-6 sm:p-8 shadow-md">
          <span className="text-xs font-bold text-[#1793D1] uppercase tracking-widest block mb-2">
            TABUNG INOVASI & OPERASI DIGITAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4">
            Ketelusan Kewangan Komuniti RuLaFHub
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            RuLaFHub dibina sebagai inisiatif perisian pendidikan terbuka tanpa keuntungan komersial. Kami tidak meletakkan iklan mahupun mengenakan yuran langganan kepada murid dan guru. Setiap ringgit sumbangan anda dialirkan secara berdisiplin untuk menampung kos teknologi dan peralatan bilik darjah.
          </p>
        </div>

        {/* 📊 Kad Metrik Aliran Tunai (Real-time Ledger Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#171A21] border border-emerald-500/30 rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-500 uppercase block mb-1">
              📥 Jumlah Dana Disumbang
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              RM {totalMasuk.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Daripada komuniti & pendidik</p>
          </div>

          <div className="bg-white dark:bg-[#171A21] border border-rose-500/30 rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-rose-500 uppercase block mb-1">
              📤 Jumlah Perbelanjaan
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              RM {totalKeluar.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Kos pelayan & kad NFC murid</p>
          </div>

          <div className="bg-white dark:bg-[#171A21] border border-[#1793D1]/40 rounded-xl p-5 shadow-sm bg-[#1793D1]/5">
            <span className="text-[11px] font-bold text-[#1793D1] uppercase block mb-1">
              💼 Baki Bersih Tabung
            </span>
            <span className="text-2xl font-black text-[#1793D1]">
              RM {bakiBersih.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Dana operasi aktif semasa</p>
          </div>
        </div>

        {/* 💳 Borang Sumbangan FPX ToyyibPay */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🎁</span>
            <span>Hulurkan Sokongan (FPX / DuitNow)</span>
          </h2>

          <form onSubmit={hantarSumbangan} className="space-y-4 text-xs">
            {/* Pilihan Nilai Pantas */}
            <div>
              <label className="block text-gray-500 mb-2 font-bold">Pilih Nilai Sumbangan:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[5, 10, 30, 50].map((nilai) => (
                  <button
                    key={nilai}
                    type="button"
                    onClick={() => {
                      setPilihanJumlah(nilai);
                      setJumlahKustom('');
                    }}
                    className={`py-3 rounded-lg border font-bold text-sm transition-all ${
                      pilihanJumlah === nilai && !jumlahKustom
                        ? 'border-[#1793D1] bg-[#1793D1] text-white shadow-md'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    RM {nilai}
                  </button>
                ))}
              </div>
            </div>

            {/* Nilai Kustom */}
            <div>
              <label className="block text-gray-500 mb-1">Atau Masukkan Nilai Lain (RM):</label>
              <input
                type="number"
                min="2"
                step="1"
                placeholder="Contoh: 15"
                value={jumlahKustom}
                onChange={(e) => setJumlahKustom(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1">Nama / Nama Samaran (Pilihan):</label>
                <input
                  type="text"
                  placeholder="Hamba Allah"
                  value={namaPenyumbang}
                  onChange={(e) => setNamaPenyumbang(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">E-mel (Untuk Resit ToyyibPay):</label>
                <input
                  type="email"
                  placeholder="emel@anda.com"
                  value={emelPenyumbang}
                  onChange={(e) => setEmelPenyumbang(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Doa / Pesanan Santai (Pilihan):</label>
              <input
                type="text"
                placeholder="Moga bermanfaat untuk asatizah & anak-anak murid..."
                value={doaPenyumbang}
                onChange={(e) => setDoaPenyumbang(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1793D1] hover:bg-blue-600 text-white font-bold rounded-lg text-sm shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? '[ SEDANG MENJANA PORTAL TOYYIBPAY... ]' : '🚀 [ TERUSKAN KE BAYARAN FPX SECARA SELAMAT ]'}
            </button>
          </form>
        </div>

        {/* 📑 Lejar Kewangan Terbuka (Public Audit Trail) */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📜</span>
              <span>Rekod Audit Transaksi Terbuka</span>
            </h2>
            <button
              onClick={tarikDataLejar}
              className="text-xs text-[#1793D1] hover:underline"
            >
              [ Segerakkan Semula ]
            </button>
          </div>

          {isLoading ? (
            <p className="text-center py-8 text-xs text-gray-400 animate-pulse">
              Memuat turun data lejar daripada pangkalan data...
            </p>
          ) : lejar.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-500">
              Belum ada rekod transaksi kewangan didaftarkan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase text-[10px]">
                    <th className="py-3 px-2">Tarikh</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2">Butiran</th>
                    <th className="py-3 px-2">Penyumbang / Penerima</th>
                    <th className="py-3 px-2 text-right">Jumlah</th>
                    <th className="py-3 px-2 text-center">Bukti Resit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {lejar.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 whitespace-nowrap text-gray-500">{item.tarikh}</td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.jenis === 'masuk'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          }`}
                        >
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-300 min-w-[200px]">{item.butiran}</td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{item.penyumbang_atau_penerima}</td>
                      <td
                        className={`py-3 px-2 text-right font-bold whitespace-nowrap ${
                          item.jenis === 'masuk' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {item.jenis === 'masuk' ? '+' : '-'} RM {Number(item.jumlah).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {item.pautan_resit ? (
                          <a
                            href={item.pautan_resit}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1793D1] hover:underline font-bold text-[11px]"
                          >
                            [ Lihat Resit ]
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}