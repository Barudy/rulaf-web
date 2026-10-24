import Link from 'next/link';

/**
 * RuLaFHub :: Global Footer — dipaparkan di semua halaman via layout.
 */
export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#171a21] dark:bg-[#010409] bg-gray-100 border-t border-[#1793D1]/40 dark:border-[#1793D1]/40 border-gray-200 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#1793D1] text-lg">⬡</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white font-mono">
              RuLaF<span className="text-[#1793D1]">Hub</span>
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Link href="/blog" className="hover:text-[#1793D1] transition-colors">Blog</Link>
            <Link href="/repo" className="hover:text-[#1793D1] transition-colors">RUR</Link>
            <Link href="/forum" className="hover:text-[#1793D1] transition-colors">Forum</Link>
            <Link href="/docs" className="hover:text-[#1793D1] transition-colors">Docs</Link>
            <Link href="/dashboard" className="hover:text-[#1793D1] transition-colors">Dashboard</Link>
          </nav>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-center space-y-1">
          <p className="text-[11px] text-gray-500 dark:text-gray-500">
            © {tahun} RuLaFHub oleh <span className="font-bold text-gray-700 dark:text-gray-300">Al-BabDev</span> (Ustaz Mohamad Ismail bin Mohd Noor) · Hak Cipta Terpelihara
          </p>
          <p className="text-[10px] font-mono text-[#1793D1]">
            Code by Ust_Ismail(Al-BabDev)
          </p>
        </div>
      </div>
    </footer>
  );
}
