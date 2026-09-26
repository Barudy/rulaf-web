'use client';

import QRCode from 'qrcode';

/**
 * RuLaFHub :: Util multitenan + token + tahap automatik + QR.
 * Dikongsi oleh MejaMurid (pendaftaran) & Pengurusan (gred 60:40).
 */

/** 0–39 Khas · 40–59 Alif · 60–79 Ba · 80–100 Ta */
export function kiraTahapRulaf(peratus: number): string {
  const p = Math.max(0, Math.min(100, Math.round(peratus || 0)));
  if (p < 40) return 'RuLaF Khas';
  if (p < 60) return 'RuLaF Alif';
  if (p < 80) return 'RuLaF Ba';
  return 'RuLaF Ta';
}

/**
 * Komposit 60:40 = 0.6 * markah_jawi + 0.4 * ujian_bertulis.
 * Tahap automatik dihitung daripada komposit ini (tiada pilih manual).
 */
export function kiraKomposit6040(markahJawi: any, ujianBertulis: any): { peratus: number; tahap: string } {
  const j = Math.max(0, Math.min(100, Number(markahJawi) || 0));
  const u = Math.max(0, Math.min(100, Number(ujianBertulis) || 0));
  const peratus = Math.round(0.6 * j + 0.4 * u);
  return { peratus, tahap: kiraTahapRulaf(peratus) };
}

/** Jana token unik RULAF-XXXXXX (semak pelanggaran di DB oleh pemanggil). */
export function janaTokenId(): string {
  const aksara = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let kod = '';
  for (let i = 0; i < 6; i++) kod += aksara[Math.floor(Math.random() * aksara.length)];
  return `RULAF-${kod}`;
}

/** Jana QR PNG (data URL) daripada token — untuk NFC/RBox & muat turun. */
export async function janaQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, { width: 256, margin: 2 });
}

/** Muat turun data-URL sebagai fail PNG. */
export function muatTurunPng(dataUrl: string, namaFail: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = namaFail;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
