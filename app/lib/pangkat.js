import { supabase } from './supabaseClient';
import { ialahAdmin } from './akses';

/**
 * Pangkat Guru RUR (RuLaFHub Users Repository) — parody AUR.
 * Moderator/Adopted: senarai emel statik (kembangkan bila perlu).
 * Master: guru yang mempunyai folder sendiri dalam RUR.
 */
export const SENARAI_MODERATOR = [
  // 'guru contoh@sekolah.edu.my',
];

export const SENARAI_ADOPTED = [
  // 'guru contoh@sekolah.edu.my', // guru yang maintain folder guru lain
];

export async function kiraPangkat(email) {
  if (!email) return { nama: 'Tetamu', badge: '👤' };
  const e = email.toLowerCase();
  if (ialahAdmin(email)) return { nama: 'Founder', badge: '👑' };
  if (SENARAI_MODERATOR.includes(e)) return { nama: 'Moderator', badge: '🛡️' };
  if (SENARAI_ADOPTED.includes(e)) return { nama: 'Adopted', badge: '🤝' };
  try {
    const { count } = await supabase
      .from('rulaf_repo')
      .select('*', { count: 'exact', head: true })
      .eq('penyumbang', email)
      .eq('is_folder', true);
    if (count && count > 0) return { nama: 'Master', badge: '🎓' };
  } catch (err) {
    console.error('Ralat kira pangkat:', err);
  }
  return { nama: 'Guru', badge: '👨🏫' };
}
