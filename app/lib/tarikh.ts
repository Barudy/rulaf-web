// Utiliti tarikh kongsi untuk paparan RUR (gaya GitHub)
export const formatTarikh = (nilai?: string | null): string => {
  if (!nilai) return '—';
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Kira berapa bulan sejak tarikh terakhir (0 jika tiada)
export const bulanSejak = (nilai?: string | null): number => {
  if (!nilai) return 0;
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return 0;
  const sekarang = new Date();
  return Math.max(
    0,
    (sekarang.getFullYear() - d.getFullYear()) * 12 + (sekarang.getMonth() - d.getMonth())
  );
};

// Folder dianggap tidak diurus jika tiada aktiviti 6 bulan atau lebih
export const tidakDiurus = (nilai?: string | null): boolean => bulanSejak(nilai) >= 6;
