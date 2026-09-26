import { supabase } from './supabaseClient';

export const SENARAI_ADMIN = [
  'admin@rulafhub.com',
  'ismail@rulafhub.com',
  'ust_ismail@rulafhub.com',
];

// Ejen AI (NL2SQL) dikunci ketat: hanya Admin utama sahaja.
export const ADMIN_AI_EMAIL = 'admin@rulafhub.com';

export function bolehAksesAI(email) {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_AI_EMAIL;
}

// Blog CMS: hanya Admin (emel utama atau peranan admin).
export function bolehUrusBlog(email, peranan) {
  if (!email) return false;
  if (email.toLowerCase() === ADMIN_AI_EMAIL) return true;
  return (peranan || '').toLowerCase() === 'admin';
}

export function ialahAdmin(email) {
  if (!email) return false;
  return (
    SENARAI_ADMIN.includes(email) ||
    email.startsWith('admin') ||
    email.includes('ust_ismail') ||
    email.includes('ismail')
  );
}

export function normalizePeranan(peranan) {
  const p = (peranan || '').toLowerCase();
  if (p === 'admin') return 'admin';
  if (p === 'guru') return 'guru';
  if (p === 'murid') return 'murid';
  if (p === 'ibu bapa' || p === 'ibu_bapa' || p === 'waris') return 'waris';
  return '';
}

export async function ambilPeranan(email) {
  if (!email) return '';
  try {
    const { data } = await supabase
      .from('profil_pengguna')
      .select('peranan')
      .eq('email', email)
      .maybeSingle();
    if (data && data.peranan) return data.peranan;
  } catch (err) {
    console.error('Ralat ambil peranan:', err);
  }
  return ialahAdmin(email) ? 'Guru' : '';
}

export async function ambilPerananDinormal(email) {
  const peranan = await ambilPeranan(email);
  const norm = normalizePeranan(peranan);
  if (norm) return norm;
  return ialahAdmin(email) ? 'guru' : '';
}

export async function ambilProfilLengkap(email) {
  if (!email) return null;
  try {
    const { data } = await supabase
      .from('profil_pengguna')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    return data || null;
  } catch (err) {
    console.error('Ralat ambil profil:', err);
    return null;
  }
}

export async function ambilSesi() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}