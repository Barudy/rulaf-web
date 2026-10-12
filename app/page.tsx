'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabaseClient';
import CountDownUpkk from '../components/CountDownUpkk';

/**
 * RuLaFHub — GitHub-style interactive educational landing.
 * Mod gelap & cerah: kelas `dark:` mengikut togol tema global (Navbar).
 * Blog feed berpusat di /blog (jadual blog_rulaf).
 * Notifikasi (Android-exclusive) tidak disentuh di sini.
 */

/* Skrip animasi terminal — gantikan blok terminal dengan
   <img src="/demo.gif" alt="Demo RuLaFHub" /> jika GIF tersedia. */
const SKRIP = [
  '$ rulaf status --upkk 2026',
  '✓ 58 murid berdaftar',
  '✓ gred 60:40 disegerakkan',
  '$ ejen-ai "murid 3 Murshid markah jawi > 80"',
  '→ 12 rekod ditemui ✓',
];

const CIRI = [
  { id: 'prestasi', ikon: '📊', nama: 'Performance Tracking', href: '/semakan', ringkas: 'Jejak prestasi murid & rekod formatif.', detail: 'Carian MyKid, gred 60:40 dan analisis markah Jawi, Arab & Al-Quran mengikut kelas.' },
  { id: 'arked', ikon: '🎮', nama: 'RPG Arcade', href: '/permainan', ringkas: 'Misi permainan & kuiz interaktif.', detail: 'Tebus mata, papan pendahulu dan misi bertema yang memotivasikan murid.' },
  { id: 'repo', ikon: '📂', nama: 'BBM Repository', href: '/repo', ringkas: 'Bahan Bantu Mengajar terbuka.', detail: 'Koleksi PDF, pautan dan folder guru — boleh kongsi dan muat turun.' },
  { id: 'forum', ikon: '💬', nama: 'Forum', href: '/forum', ringkas: 'Perbincangan komuniti PAK21.', detail: 'Topik, balasan dan perkongsian amalan bilik darjah sesama guru.' },
  { id: 'rbox', ikon: '🔒', nama: 'RBox NFC/QR', href: '/docs', ringkas: 'Privacy-first, disambung via NFC/QR.', detail: 'Reka bentuk privacy-first: data murid terkawal, akses mengikut peranan, disambung melalui RBox.' },
  { id: 'dana', ikon: '❤️', nama: 'Bantu Kami', href: '/dana', ringkas: 'Bantu pengembangan RuLaFHub.', detail: 'Bantu pengembangan dan pembangunan infrastruktur RuLaFHub dengan sumbangan anda.' },
];

const NILAI = [
  { ikon: '🎯', tajuk: 'Misi Pendidikan', teks: 'Memartabat prestasi murid KAFA melalui data yang telus dan mudah dicapai guru.' },
  { ikon: '🔒', tajuk: 'Privasi Diutamakan', teks: 'Reka bentuk privacy-first: data murid kekal terkawal, akses mengikut peranan.' },
  { ikon: '🤝', tajuk: 'Untuk Guru & Murid', teks: 'Guru merancang dengan analitik; murid belajar melalui permainan dan motivasi.' },
];

function TerminalAnimasi() {
  const [telah, setTelah] = useState<string[]>([]);
  const [semasa, setSemasa] = useState('');

  useEffect(() => {
    let li = 0;
    let ci = 0;
    let siap: string[] = [];
    const id = setInterval(() => {
      const baris = SKRIP[li];
      ci += 1;
      setSemasa(baris.slice(0, ci));
      if (ci >= baris.length) {
        siap = [...siap, baris];
        setTelah(siap);
        setSemasa('');
        ci = 0;
        li += 1;
        if (li >= SKRIP.length) {
          li = 0;
          siap = [];
          setTelah([]);
        }
      }
    }, 32);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] shadow-2xl shadow-black/40 bg-[#0d1117]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-gray-500">rulaf — zsh</span>
        <span className="ml-auto font-mono text-[10px] text-green-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> live
        </span>
      </div>
      <div className="p-4 font-mono text-[12px] sm:text-[13px] leading-6 min-h-[190px]">
        {telah.map((t, i) => (
          <p key={i} className={t.startsWith('$') ? 'text-[#e6edf3]' : t.startsWith('→') ? 'text-[#1793D1]' : 'text-green-400'}>{t}</p>
        ))}
        <p className="text-[#e6edf3]">{semasa}<span className="inline-block w-2 h-4 bg-green-400 animate-pulse align-middle ml-0.5" /></p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aktif, setAktif] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsLoggedIn(true);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] font-sans transition-colors duration-300 selection:bg-[#1793D1] selection:text-white">

      {/* HERO */}
      <header className="border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-mono text-[11px] text-green-600 dark:text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> v2 · Next.js &amp; Android Jetpack Compose · RBox NFC/QR
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
              The future of educational management &amp; student performance{' '}
              <span className="text-[#1793D1]">happens together.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              RuLaFHub ialah ekosistem pendidikan privacy-first: pengurusan prestasi murid,
              arked RPG bermisi, repositori BBM terbuka dan Ejen AI NL2SQL — dibina dengan
              Next.js di web dan Jetpack Compose di Android, disambung melalui RBox NFC/QR.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={isLoggedIn ? '/dashboard' : '/login'} className="px-4 py-2 rounded-lg bg-[#1793D1] text-white text-sm font-black hover:bg-[#1272ab] transition-colors">Mula Sekarang →</Link>
              <Link href="/repo" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#30363d] text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-[#1793D1] hover:text-[#1793D1] transition-colors">📂 Repositori</Link>
              <Link href="/blog" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#30363d] text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-[#1793D1] hover:text-[#1793D1] transition-colors">📚 Log Pembangunan</Link>
            </div>
          </div>
          <div>
            <TerminalAnimasi />
            <p className="mt-2 font-mono text-[10px] text-gray-500 text-center">Animasi langsung — Ejen AI &amp; status UPKK dalam terminal</p>
          </div>
        </div>
      </header>

      {/* COUNTDOWN (dikekalkan) */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-5 transition-colors duration-300">
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-3">⏳ Peperiksaan UPKK</p>
          <CountDownUpkk />
        </div>
      </section>

      {/* FILOSOFI */}
      <section className="max-w-5xl mx-auto px-4 pb-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">✨ Falsafah &amp; Sumbangan Pendidikan</h2>
        <p className="text-xs text-gray-500 mt-1">Nilai teras yang memandu setiap modul RuLaFHub.</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {NILAI.map((n) => (
            <div key={n.tajuk} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl p-4 hover:border-[#1793D1]/60 transition-colors">
              <p className="text-2xl">{n.ikon}</p>
              <p className="mt-2 text-sm font-black text-gray-900 dark:text-white">{n.tajuk}</p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{n.teks}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CIRI INTERAKTIF */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">🧩 Modul Utama <span className="font-mono text-[10px] text-gray-500 font-normal">— klik kad untuk perincian</span></h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CIRI.map((c) => {
            const buka = aktif === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setAktif(buka ? null : c.id)}
                className={`text-left bg-white dark:bg-[#161b22] border rounded-xl p-4 transition-all hover:-translate-y-0.5 ${buka ? 'border-[#1793D1]' : 'border-gray-200 dark:border-[#30363d] hover:border-[#1793D1]/60'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.ikon}</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{c.nama}</span>
                  <span className="ml-auto text-gray-400 dark:text-gray-600 text-xs">{buka ? '▾' : '▸'}</span>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{c.ringkas}</p>
                {buka && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#30363d]">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{c.detail}</p>
                    <Link href={c.href} onClick={(e) => e.stopPropagation()} className="inline-block mt-2 text-[11px] font-black text-[#1793D1] hover:underline">
                      Buka {c.nama} →
                    </Link>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
