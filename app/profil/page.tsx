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
    profile_picture_url: '',
    jawatan: '',
    no_tel: '',
    alamat: '',
    kokurikulum: ''
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

  // 🎓 E-Profil: pencapaian akademik + kokurikulum
  const [hasilAkademik, setHasilAkademik] = useState<any[]>([]);
  const [rekodKoku, setRekodKoku] = useState<any[]>([]);
  const [kokuForm, setKokuForm] = useState({ aktiviti: '', kategori: 'Kelab & Persatuan', peringkat: 'Sekolah', tahun: '', pencapaian: '' });
  const [simpanKoku, setSimpanKoku] = useState(false);

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
        jawatan: data.jawatan || '',
        no_tel: data.no_tel || '',
        alamat: data.alamat || '',
        kokurikulum: data.kokurikulum || '',
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

        // 🎓 SEDUT HASIL AKADEMIK (markah_murid) UNTUK E-PROFIL
        const { data: markah } = await supabase
          .from('markah_murid')
          .select('*')
          .eq('mykid', mykidMurid)
          .order('bulan_tahun');
        if (markah) setHasilAkademik(markah);
      }

      // 🏅 SEDUT REKOD KOKURIKULUM SENDIRI (abaikan jika jadual belum wujud)
      const { data: koku } = await supabase
        .from('rulaf_kokurikulum')
        .select('*')
        .eq('email', session.user.email)
        .order('tahun', { ascending: false });
      if (koku) setRekodKoku(koku);
    }
    setIsChecking(false);
  };

  const simpanProfil = async () => {
    setIsUpdating(true);
    const asas = {
      email: userEmail,
      nama: profil.nama,
      umur: profil.umur,
      jantina: profil.jantina,
      peranan: profil.peranan,
      mykid: profil.mykid || '0000000000000',
      profile_picture_url: profil.profile_picture_url || ''
    };
    const penuh = {
      ...asas,
      jawatan: profil.jawatan || '',
      no_tel: profil.no_tel || '',
      alamat: profil.alamat || '',
      kokurikulum: profil.kokurikulum || ''
    };
    let { error } = await supabase.from('profil_pengguna').upsert(penuh, { onConflict: 'email' });
    if (error && /column|42703|PGRST204/i.test(`${error.message} ${error.code || ''}`)) {
      // Jadual belum migrasi — simpan medan asas sahaja
      const r2 = await supabase.from('profil_pengguna').upsert(asas, { onConflict: 'email' });
      error = r2.error;
      if (!error) alert('[!] Disimpan tanpa medan E-Profil baharu. Jalankan supabase/migrasi-eprofil.sql di SQL Editor.');
    }

    if (error) alert('Ralat kemas kini: ' + error.message);
    else alert('[+] Profil berjaya dikemas kini!');
    setIsUpdating(false);
  };

  // 🏅 TAMBAH REKOD KOKURIKULUM
  const tambahKoku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kokuForm.aktiviti.trim()) return alert('[!] Nama aktiviti diperlukan.');
    setSimpanKoku(true);
    const { error } = await supabase.from('rulaf_kokurikulum').insert([{
      email: userEmail,
      mykid: profil.mykid !== '0000000000000' ? profil.mykid : null,
      aktiviti: kokuForm.aktiviti.trim(),
      kategori: kokuForm.kategori,
      peringkat: kokuForm.peringkat,
      tahun: kokuForm.tahun.trim(),
      pencapaian: kokuForm.pencapaian.trim(),
    }]);
    if (error) {
      if (/column|42703|PGRST204|relation|42P01/i.test(`${error.message} ${error.code || ''}`))
        alert('[!] Jadual rulaf_kokurikulum belum wujud. Jalankan supabase/migrasi-eprofil.sql di SQL Editor.');
      else alert('Ralat: ' + error.message);
    } else {
      setKokuForm({ aktiviti: '', kategori: 'Kelab & Persatuan', peringkat: 'Sekolah', tahun: '', pencapaian: '' });
      const { data } = await supabase.from('rulaf_kokurikulum').select('*').eq('email', userEmail).order('tahun', { ascending: false });
      if (data) setRekodKoku(data);
    }
    setSimpanKoku(false);
  };

  // 🗑️ PADAM REKOD KOKURIKULUM
  const padamKoku = async (id: number) => {
    if (id == null) return alert('[!] Rekod ini tiada ID (data lama) — tidak boleh dipadam.');
    if (!window.confirm('Padam rekod kokurikulum ini?')) return;
    const { error } = await supabase.from('rulaf_kokurikulum').delete().eq('id', id);
    if (error) alert('Ralat: ' + error.message);
    else setRekodKoku((r) => r.filter((x: any) => x.id !== id));
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
    { ikon: '📂', label: 'RUR (Users Repository)', desc: 'Bahan Bantu Mengajar terbuka', tujuan: '/repo' },
  ];

  // Inisial untuk avatar fallback (elak ReferenceError ketika tiada gambar)
  const inisial = (profil.nama || 'R')
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
            <div>
              <label className="text-xs text-[#1793D1] font-bold block mb-1">JAWATAN / PERANAN KHAS</label>
              <input
                type="text"
                value={profil.jawatan}
                onChange={(e) => setProfil({ ...profil, jawatan: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="Cth: Ketua Kelas, Pengawas, Guru Kelas..."
              />
            </div>
            <div>
              <label className="text-xs text-[#1793D1] font-bold block mb-1">NO. TELEFON</label>
              <input
                type="text"
                value={profil.no_tel}
                onChange={(e) => setProfil({ ...profil, no_tel: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="01X-XXXXXXX"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs text-[#1793D1] font-bold block mb-1">ALAMAT</label>
              <input
                type="text"
                value={profil.alamat}
                onChange={(e) => setProfil({ ...profil, alamat: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="Alamat tempat tinggal..."
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs text-[#1793D1] font-bold block mb-1">PENGLIBATAN KOKURIKULUM (RINGKASAN)</label>
              <input
                type="text"
                value={profil.kokurikulum}
                onChange={(e) => setProfil({ ...profil, kokurikulum: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#1793D1] focus:outline-none font-sans"
                placeholder="Cth: Pengakap, Bola Sepak, Nasyid..."
              />
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
          E-PROFIL: PENCAPAIAN AKADEMIK + SOFTCOPY
          ============================================
        */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎓</span> Pencapaian Akademik
            </h2>
            {hasilAkademik.length > 0 && (
              <button onClick={() => window.print()} className="no-print ml-auto bg-[#1793D1] text-white px-4 py-1.5 rounded-lg text-[11px] font-black hover:bg-[#1272ab] transition-colors">
                🖨️ Cetak / Simpan PDF
              </button>
            )}
          </div>
          <div id="laporan-akademik">
            <div className="hidden print:block mb-3">
              <p className="font-black text-base">Laporan Pencapaian Akademik — {profil.nama}</p>
              <p className="text-xs text-gray-600">MyKid: {profil.mykid} · Dijana RuLaFHub</p>
            </div>
            {hasilAkademik.length === 0 ? (
              <p className="text-xs text-gray-400">Tiada rekod markah ditemui untuk MyKid ini. Rekod akan dipaparkan selepas guru menyegerakkan gred 60:40.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase text-[10px]">
                      <th className="py-2 pr-3">Bulan/Tahun</th>
                      <th className="py-2 pr-3">Jawi %</th>
                      <th className="py-2 pr-3">Ujian %</th>
                      <th className="py-2 pr-3">Quran</th>
                      <th className="py-2 pr-3">Hafazan</th>
                      <th className="py-2">Tahap RuLaF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasilAkademik.map((r: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800/60">
                        <td className="py-2 pr-3 font-bold">{r.bulan_tahun}</td>
                        <td className="py-2 pr-3">{r.markah_jawi ?? '—'}</td>
                        <td className="py-2 pr-3">{r.ujian_bertulis ?? '—'}</td>
                        <td className="py-2 pr-3">{r.bacaan_quran || '—'}</td>
                        <td className="py-2 pr-3">{r.hafazan || '—'}</td>
                        <td className="py-2"><span className="inline-block bg-[#1793D1]/10 text-[#1793D1] font-black px-2 py-0.5 rounded-full text-[10px]">{r.tahap_rulaf || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/*
          ============================================
          E-PROFIL: PENCAPAIAN KOKURIKULUM
          ============================================
        */}
        <div className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <span>🏅</span> Pencapaian Kokurikulum
          </h2>
          <form onSubmit={tambahKoku} className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            <input value={kokuForm.aktiviti} onChange={(e) => setKokuForm({ ...kokuForm, aktiviti: e.target.value })} placeholder="Aktiviti (cth: Bola Sepak)" className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none" />
            <select value={kokuForm.kategori} onChange={(e) => setKokuForm({ ...kokuForm, kategori: e.target.value })} className="bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none">
              <option>Sukan</option><option>Unit Beruniform</option><option>Kelab &amp; Persatuan</option><option>Kesenian &amp; Kebudayaan</option><option>Akademik &amp; STEM</option><option>Khidmat Masyarakat</option>
            </select>
            <select value={kokuForm.peringkat} onChange={(e) => setKokuForm({ ...kokuForm, peringkat: e.target.value })} className="bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none">
              <option>Sekolah</option><option>MSSD</option><option>MSSN</option><option>Kebangsaan</option>
            </select>
            <input value={kokuForm.tahun} onChange={(e) => setKokuForm({ ...kokuForm, tahun: e.target.value })} placeholder="Tahun (cth: 2026)" className="bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none" />
            <input value={kokuForm.pencapaian} onChange={(e) => setKokuForm({ ...kokuForm, pencapaian: e.target.value })} placeholder="Pencapaian (cth: Johan)" className="bg-gray-50 dark:bg-[#11141b] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:border-[#1793D1] focus:outline-none" />
            <button disabled={simpanKoku} className="bg-[#1793D1] text-white rounded-xl py-2 text-xs font-black hover:bg-[#1272ab] disabled:opacity-50">+ Tambah</button>
          </form>
          {rekodKoku.length === 0 ? (
            <p className="text-xs text-gray-400">Tiada rekod kokurikulum. Tambah penglibatan pertama anda di atas.</p>
          ) : (
            <div className="space-y-4">
              {['Sekolah', 'MSSD', 'MSSN', 'Kebangsaan'].map((pk) => {
                const senarai = rekodKoku.filter((r: any) => r.peringkat === pk);
                if (senarai.length === 0) return null;
                return (
                  <div key={pk}>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#1793D1] mb-1.5">🏷️ {pk} ({senarai.length})</p>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      {senarai.map((r: any) => (
                        <li key={r.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                          <span className="font-bold">{r.aktiviti}</span>
                          <span className="text-gray-400">· {r.kategori}{r.tahun ? ` · ${r.tahun}` : ''}{r.pencapaian ? ` — 🏆 ${r.pencapaian}` : ''}</span>
                          <button onClick={() => padamKoku(r.id)} className="ml-auto text-red-400 hover:text-red-500 font-bold">✕</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
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
        <div id="tetapan" className="bg-white dark:bg-[#171A21] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm scroll-mt-24">
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

        {/* ============ KESELAMATAN AKAUN (T8) ============ */}
        <div className="bg-white dark:bg-[#171A21] border border-red-300/40 dark:border-red-900/40 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>🔐</span> Keselamatan Akaun
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Pautkan Google untuk log masuk pantas, atau padamkan akaun anda.</p>
          </div>
          <div className="px-5 pb-5 space-y-3">
            <button
              onClick={async () => {
                try {
                  const auth: any = supabase.auth;
                  if (typeof auth.linkIdentity === 'function') {
                    const { error } = await auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.origin + '/profil' } });
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/profil' } });
                    if (error) throw error;
                  }
                } catch (err: any) {
                  alert('Gagal memautkan Google: ' + (err.message || err) + '\n\nNota: admin perlu benarkan provider Google di Supabase Dashboard → Authentication → Providers.');
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#11141b] hover:border-[#1793D1] transition-all text-left"
            >
              <span className="text-xl">🔗</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-white">Pautkan Akaun Google</span>
                <span className="block text-[11px] text-gray-500">Log masuk pada masa hadapan tanpa kata laluan</span>
              </span>
            </button>

            <button
              onClick={async () => {
                const ok = window.confirm(
                  '⚠️ PADAM AKAUN\n\nIni akan:\n1. Memadam profil, tetapan dan data peribadi RuLaFHub anda\n2. Mengeluarkan sesi semasa\n\nNota: ID log masuk e-mel kekal dalam sistem keselamatan Supabase sehingga pentadbir mengemas kininya secara manual.\n\nAdakah anda pasti?'
                );
                if (!ok) return;
                try {
                  const { error } = await supabase.from('profil_pengguna').delete().eq('email', userEmail);
                  if (error) throw error;
                  await supabase.auth.signOut();
                  alert('✓ Akaun anda telah dipadam. Sehingga jumpa lagi!');
                  window.location.href = '/';
                } catch (err: any) {
                  alert('Gagal memadam akaun: ' + (err.message || err));
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all text-left"
            >
              <span className="text-xl">🗑️</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-red-600 dark:text-red-400">Padam Akaun Saya</span>
                <span className="block text-[11px] text-red-400/80">Tindakan kekal — profil & data peribadi dipadam</span>
              </span>
            </button>
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