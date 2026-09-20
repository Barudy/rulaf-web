'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ambilPeranan, ialahAdmin } from '../lib/akses';

export interface HariKerajinan {
  tarikh: string;
  tugasanDiberi: number;
  tugasanSiap: number;
  hadir: boolean;
}

export default function ProfilPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [peranan, setPeranan] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);

  const [profil, setProfil] = useState({
    nama: '',
    umur: '',
    jantina: '',
    peranan: 'Murid',
    mykid: '0000000000000',
    profile_picture_url: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // 🔒 Tukar Kata Laluan
  const [kataLaluanLama, setKataLaluanLama] = useState('');
  const [kataLaluanBaru, setKataLaluanBaru] = useState('');
  const [sahkanKataLaluan, setSahkanKataLaluan] = useState('');
  const [mesejPass, setMesejPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);

  const [dataKerajinan, setDataKerajinan] = useState<HariKerajinan[]>([]);

  useEffect(() => {
    semakSesi();
  }, []);

  const semakSesi = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserEmail(session.user.email || '');
    const norm = await ambilPeranan(session.user.email || '');
    setPeranan(norm);

    const { data } = await supabase
      .from('profil_pengguna')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (data) {
      const mykidMurid = data.mykid || '0000000000000';
      setProfil({
        nama: data.nama || '',
        umur: data.umur || '',
        jantina: data.jantina || '',
        peranan: data.peranan || 'Murid',
        mykid: mykidMurid,
        profile_picture_url: data.profile_picture_url || '',
      });

      // 🔑 SEDUT REKOD KERAJINAN SEBENAR DARI SUPABASE
      if (mykidMurid && mykidMurid !== '0000000000000') {
        const { data: rekodHarian } = await supabase
          .from('rekod_kerajinan_harian')
          .select('*')
          .eq('mykid', mykidMurid)
          .order('tarikh', { ascending: true });

        if (rekodHarian && rekodHarian.length > 0) {
          const formattedData: HariKerajinan[] = rekodHarian.map((item: any) => ({
            tarikh: item.tarikh,
            tugasanDiberi: 2,
            tugasanSiap: item.tugasan_siap || 0,
            hadir: item.status_hadir ?? true
          }));
          setDataKerajinan(formattedData);
        }
      }
    }
    setIsChecking(false);
  };

  const simpanProfil = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('profil_pengguna').upsert({
      email: userEmail,
      nama: profil.nama,
      umur: profil.umur,
      jantina: profil.jantina,
      peranan: profil.peranan,
      mykid: profil.mykid || '0000000000000',
      profile_picture_url: profil.profile_picture_url || ''
    }, { onConflict: 'email' });

    if (error) alert('Ralat kemas kini: ' + error.message);
    else alert('[+] Profil berjaya dikemas kini!');
    setIsUpdating(false);
  };


  // 🔘 MUAT NAIK GAMBAR PROFIL (AVATAR) KE BUCKET "modul-rulaf"
  const muatNaikAvatar = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('[!] Sila pilih fail imej (JPG/PNG/WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('[!] Saiz imej melebihi had 5MB.');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const sambungan = file.name.split('.').pop() || 'png';
      const laluanFail = `profil-avatar/${Date.now()}_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}.${sambungan}`;
      const { error: uploadError } = await supabase.storage
        .from('modul-rulaf')
        .upload(laluanFail, file, { upsert: true });
      if (uploadError) throw uploadError1Error__;

      const { data: { publicUrl } } = supabase.storage
        .from('modul-rulaf')
        .getPublicUrl(laluanFail);
      if (publicUrl) {
        setProfil((p) => ({ ...p, profile_picture_url: publicUrl }));
        const { error } = await supabase.from('profil_pengguna').upsert({
          email: userEmail,
          nama: profil.nama,
          umur: profil.umur,
          jantina: profil.jantina,
          peranan: profil.peranan,
          mykid: profil.mykid || '0000000000000',
          profile_picture_url: publicUrl
        }, { onConflict: 'email' });
        if (error) throw error;
        alert('[+] Gambar profil berjaya dimuat naik!');
      }
    } catch (err: any) {
      alert('Ralat muat naik avatar: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const tukarKataLaluan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesejPass('');

    if (kataLaluanBaru.length < 6) {
      setMesejPass('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
      return;
    }
    if (kataLaluanBaru !== sahkanKataLaluan) {
      setMesejPass('Pengesahan kata laluan tidak sepadan!');
      return;
    }
    if (kataLaluanLama === kataLaluanBaru) {
      setMesejPass('Kata laluan baharu mesti berbeza daripada kata laluan semasa.');
      return;
    }

    setIsChangingPass(true);
    try {
      // Sahkan kata laluan lama dahulu
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: kataLaluanLama,
      });
      if (verifyError) {
        setMesejPass('[!] Kata laluan semasa tidak tepat.');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: kataLaluanBaru });
      if (error) {
        setMesejPass('Ralat tukar kata laluan: ' + error.message);
      } else {
        setMesejPass('✅ Kata laluan berjaya dikemas kini!');
        setKataLaluanLama('');
        setKataLaluanBaru('');
        setSahkanKataLaluan('');
        setShowPassForm(false);
      }
    } catch (err: any) {
      setMesejPass('Ralat: ' + (err.message || 'Sila cuba lagi.'));
    } finally {
      setIsChangingPass(false);
    }
  };

  const logKeluar = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getWarnaKotak = (hari: HariKerajinan) => {
    if (!hari.hadir) return 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400';
    if (hari.tugasanDiberi === 0 || hari.tugasanSiap === 0) {
      return 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500';
    }
    const peratus = (hari.tugasanSiap / hari.tugasanDiberi) * 100;
    if (peratus >= 100) return 'bg-emerald-500 border-emerald-400 text-white';
    if (peratus >= 50) return 'bg-amber-400 border-amber-300 text-black';
    return 'bg-rose-500 border-rose-400 text-white';
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="text-[#1793D1] animate-pulse">Memuatkan profil anda...</p>
      </div>
    );
  }

  const isAdmin = ialahAdmin(userEmail) || peranan === 'admin';
  const isGuru = peranan === 'Guru' || peranan === 'admin' || isAdmin;
  const isMurid = peranan === 'Murid';

  // Ikon & warna lencana peranan
  const roleBadge = isAdmin
    ? { label: 'Pentadbir', ikon: '🛡️', warna: 'bg-indigo-600 text-white' }
    : peranan === 'Guru'
      ? { label: 'Guru', ikon: '👨‍🏫', warna: 'bg-[#1793D1] text-white' }
      : peranan === 'Ibu Bapa'
        ? { label: 'Ibu Bapa / Waris', ikon: '👨‍👩‍👧', warna: 'bg-amber-600 text-white' }
        : { label: 'Murid', ikon: '🎓', warna: 'bg-emerald-600 text-white' };

  // 📋 Senarai pintasan Akses & Tetapan mengikut peranan
  const senaraiTetapan = [
    { ikon: '🏠', label: 'Papan Pemuka', desc: 'Ke dashboard utama anda', tujuan: '/dashboard' },
    ...(isGuru ? [
      { ikon: '🔍', label: 'Fungsi Semakan', desc: 'Semak prestasi murid', tujuan: '/semakan' },
      { ikon: '📋', label: 'Pengurusan Murid', desc: 'Rekod gred 60:40', tujuan: '/admin/pengurusan' },
      { ikon: '📅', label: 'Audit Kehadiran', desc: 'Kalendar kehadiran bulanan', tujuan: '/admin/kehadiran' },
      { ikon: '✍️', label: 'Cipta Kuiz', desc: 'Bina misi permainan', tujuan: '/admin/cipta-kuiz' },
    ] : []),
    ...(isMurid ? [
      { ikon: '🔍', label: 'Semak Markah Saya', desc: 'Lihat prestasi formatif', tujuan: '/semakan' },
    ] : []),
    ...(peranan === 'Ibu Bapa' ? [
      { ikon: '🔍', label: 'Semakan Waris', desc: 'Semak prestasi melalui MyKid', tujuan: '/semakan' },
    ] : []),
    { ikon: '💬', label: 'Forum Komuniti', desc: 'Sertai perbincangan PAK21', tujuan: '/forum' },
    { ikon: '📂', label: 'Repositori BBM', desc: 'Bahan Bantu Mengajar terbuka', tujuan: '/repo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-sans p-3 sm:p-8 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ============ TETAPAN ATAS (GAYA ANDROID) ============ */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1793D1] font-bold hover:underline">
          [ ⬅️ Kembali ke Dashboard ]
        </Link>

        {/* Kad Profil Utama (Header Android-Style) */}
        <div className="bg-gradient-to-r from-[#0F2027] via-[#1793D1]/90 to-[#0F2027] dark:from-[#0a0e14] dark:via-[#0e4a6b] dark:to-[#0a0e14] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-[#1793D1]/30 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="flex items-center gap-4 relative">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden relative group/avatar">
              {profil.profile_picture_url ? (
                <img src={profil.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{inisial}</span>
              )}
              {/* 📷 Butang Muat Naik Gambar */}
              <label className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-center py-0.5 text-[9px] font-bold cursor-pointer hover:bg-[#1793D1] hover:text-[#0F1419] transition-colors invisible group-hover/avatar:visible">
                📷
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) muatNaikAvatar(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">{profil.nama || 'Pengguna RuLaF'}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.warna}`}>
                  {roleBadge.ikon} {roleBadge.label}
                </span>
              </div>
              <p className="text-xs text-sky-200/80 font-mono mt-1 truncate">{userEmail}</p>
              <p className="text-[11px] text-sky-200/60 mt-1.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Akaun disahkan
              </p>
            </div>
            <button
              onClick={logKeluar}
              className="self-start bg-red-600/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Log Keluar
            </button>
          </div>
        </div>

        {/* Maklumat Peribadi (Sunting Profil) */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <span>👤</span> Maklumat Peribadi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#1793D1] font-bold block mb-1">NAMA PENUH</label>
              <input
                type="text"
                value={profil.nama}
                onChange={(e) => setProfil({ ...profil, nama: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="Nama anda..."
              />
            </div>
            <div>
              <label className="text-xs text-[#1793D1] font-bold block mb-1">UMUR</label>
              <input
                type="number"
                value={profil.umur}
                onChange={(e) => setProfil({ ...profil, umur: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="Umur..."
              />
            </div>
            <div>
              <label className="text-xs text-[#1793D1] font-bold block mb-1">JANTINA</label>
              <select
                value={profil.jantina}
                onChange={(e) => setProfil({ ...profil, jantina: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none"
              >
                <option value="">Pilih...</option>
                <option value="Lelaki">Lelaki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-purple-400 font-bold block mb-1">PERANAN (ROLE)</label>
              <select
                value={profil.peranan}
                disabled={true}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-purple-500/40 rounded-xl px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed focus:outline-none"
              >
                <option value="Murid">Murid</option>
                <option value="Ibu Bapa">Ibu Bapa</option>
                <option value="Guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-[11px] text-red-400 mt-1.5">*Hanya Admin boleh menukar akses peranan.</p>
            </div>

            {isMurid && (
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs text-[#1793D1] font-bold block mb-1">NO. MYKID (KERAHSIAAN)</label>
                <input
                  type="text"
                  value={profil.mykid}
                  onChange={(e) => setProfil({ ...profil, mykid: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                  placeholder="0000000000000"
                />
                <p className="text-[11px] text-gray-400 mt-1">*Nilai dilindungi secara generik bagi mematuhi privasi.</p>
              </div>
            )}
          </div>

          <button
            onClick={simpanProfil}
            disabled={isUpdating}
            className="mt-5 w-full sm:w-auto bg-[#1793D1] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1272ab] transition-all disabled:bg-gray-400"
          >
            {isUpdating ? 'Menyimpan...' : '💾 Simpan Profil'}
          </button>
        </div>

        {/*
          ============================================
          SEKSYEN KHUSUS MURID: STREAK KERAJINAN & SEMAKAN
          ============================================
        */}
        {isMurid && (
          <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>🔥</span> Streak Kerajinan Harian
              </h2>
              <span className="text-[10px] text-gray-500">Bulan Semasa</span>
            </div>

            {dataKerajinan.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada rekod kerajinan untuk akaun ini.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {dataKerajinan.map((hari, idx) => {
                    const warna = getWarnaKotak(hari);
                    return (
                      <div
                        key={idx}
                        title={`${hari.tarikh} | Selesai: ${hari.tugasanSiap}/${hari.tugasanDiberi}`}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold cursor-pointer transition-transform hover:scale-125 ${warna}`}
                      >
                        {hari.tugasanSiap > 0 ? hari.tugasanSiap : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-500">
                  <span>Petunjuk:</span>
                  <span className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 rounded inline-block"></span> 0
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded inline-block"></span> &lt;50%
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded inline-block"></span> 50%
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded inline-block"></span> 100%
                </div>
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <LinkButton tujuan="/semakan" warna="bg-emerald-600 hover:bg-emerald-500">📊 Semak Markah Saya</LinkButton>
              <LinkButton tujuan="/permainan" warna="bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">🎮 Main Permainan</LinkButton>
            </div>
          </div>
        )}

        {/* ============ TUKAR KATA LALUAN (SETTING BARU) ============ */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowPassForm(!showPassForm)}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-[#11141b] transition-colors"
          >
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <h2 className="text-sm font-black text-gray-900 dark:text-white">Tukar Kata Laluan</h2>
              <p className="text-[11px] text-gray-500">Kemas kini kata laluan akaun RuLaFHub anda</p>
            </div>
            <span className={`text-[#1793D1] font-bold transition-transform ${showPassForm ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {showPassForm && (
            <form onSubmit={tukarKataLaluan} className="px-5 pb-5 space-y-3 bg-gray-50 dark:bg-[#11141b]/60">
              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Kata Laluan Semasa</label>
                <input
                  type="password"
                  value={kataLaluanLama}
                  onChange={(e) => setKataLaluanLama(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1">Kata Laluan Baharu</label>
                  <input
                    type="password"
                    value={kataLaluanBaru}
                    onChange={(e) => setKataLaluanBaru(e.target.value)}
                    placeholder="Min. 6 aksara"
                    required
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold block mb-1">Sahkan Kata Laluan Baharu</label>
                  <input
                    type="password"
                    value={sahkanKataLaluan}
                    onChange={(e) => setSahkanKataLaluan(e.target.value)}
                    placeholder="Ulang kata laluan baharu"
                    required
                    className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {mesejPass && (
                <p className={`text-xs font-bold ${mesejPass.startsWith('✅') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {mesejPass}
                </p>
              )}

              <button
                type="submit"
                disabled={isChangingPass}
                className="bg-[#1793D1] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1272ab] transition-all disabled:opacity-50"
              >
                {isChangingPass ? 'Memproses...' : '🔑 Kemas Kini Kata Laluan'}
              </button>
            </form>
          )}
        </div>

        {/* ============ AKSES & TETAPAN (SENARAI PILIHAN AL-AL-ANDROID) ============ */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>⚙️</span> Akses & Tetapan
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {senaraiTetapan.map((item) => (
              <LinkButton
                key={item.label}
                tujuan={item.tujuan}
                warna="hover:bg-gray-50 dark:hover:bg-[#11141b] bg-transparent"
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors"
              >
                <span className="text-xl">{item.ikon}</span>
                <span className="flex-1 text-left">
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
                  <span className="block text-[11px] text-gray-500">{item.desc}</span>
                </span>
                <span className="text-[#1793D1] font-bold">›</span>
              </LinkButton>
            ))}
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-400 pb-6">
          RuLaFHub :: V2.0-Stable — Komuniti pendidikan Jawi.
        </div>
      </div>
    </div>
  );
}

function LinkButton({ tujuan, warna = '', className = '', children }: any) {
  return (
    <button
      onClick={() => window.location.assign(tujuan)}
      className={`${warna} ${className}`}
    >
      {children}
    </button>
  );
}