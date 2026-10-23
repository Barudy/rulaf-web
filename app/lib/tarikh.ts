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

// Masa relatif gaya GitHub: "3 minit lalu", "2 jam lalu", "5 hari lalu"…
export const masaRelatif = (nilai?: string | null): string => {
  if (!nilai) return '—';
  const masa = new Date(nilai).getTime();
  if (Number.isNaN(masa)) return '—';

  const saat = Math.max(0, Math.floor((Date.now() - masa) / 1000));
  if (saat < 60) return 'baru sahaja';

  const minit = Math.floor(saat / 60);
  if (minit < 60) return `${minit} minit lalu`;

  const jam = Math.floor(minit / 60);
  if (jam < 24) return `${jam} jam lalu`;

  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;

  const bulan = Math.floor(hari / 30);
  if (bulan < 12) return `${bulan} bulan lalu`;

  return `${Math.floor(bulan / 12)} tahun lalu`;
};

// Tarikh kemas kini terbaik: updated_at jika ada, jika tidak created_at
export const tarikhKemasKini = (item: any): string | null =>
  item?.updated_at || item?.created_at || null;

