export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 font-sans text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Dasar Privasi RuLaFHub</h1>
      <p className="text-sm mb-4">Tarikh Kemas Kini: 9 September 2026</p>
      
      <h2 className="text-lg font-semibold mt-4 mb-2">1. Pengumpulan Maklumat</h2>
      <p className="text-sm leading-relaxed mb-3">
        RuLaFHub mengumpul maklumat asas murid seperti nama penuh, nombor MyKid/pengenalan, kelas, dan rekod kehadiran harian melalui imbasan NFC atau penandaan guru. Data ini digunakan secara eksklusif bagi tujuan pentaksiran holistik 60/40 dan aktiviti PdP Jawi.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">2. Keselamatan & Perlindungan Data</h2>
      <p className="text-sm leading-relaxed mb-3">
        Semua data disulitkan dan disimpan di infrastruktur pangkalan data selamat (Supabase). Kami tidak menjual, berkongsi, atau menyewakan data peribadi murid kepada mana-mana entiti pihak ketiga atau platform pengiklanan.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">3. Hak Penjaga & Pemadaman Data</h2>
      <p className="text-sm leading-relaxed mb-3">
        Ibu bapa dan pentadbir sekolah berhak menyemak, mengemas kini, atau memohon pemadaman rekod murid pada bila-bila masa dengan menghubungi pihak pentadbir sekolah.
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Permohonan Pemadaman Akaun & Data (RuLaFHub - Al-BabDev)</h2>
<p className="text-sm leading-relaxed mb-3">
  Pengguna aplikasi <strong>RuLaFHub</strong> oleh pembangun <strong>Al-BabDev</strong> boleh memohon pemadaman akaun dan seluruh data peribadi pada bila-bila masa melalui langkah berikut:
</p>
<ol className="list-decimal pl-5 text-sm space-y-1 mb-3">
  <li>Hantar e-mel ke <strong>admin@rulafhub.com</strong> dengan tajuk "Permohonan Pemadaman Akaun RuLaFHub".</li>
  <li>Sertakan alamat e-mel akaun berdaftar dan Nombor MyKid/ID pengguna.</li>
  <li>Pihak pentadbir akan memproses permohonan dan memadam profil, rekod log masuk Supabase, catatan kehadiran, dan markah kuiz dalam tempoh 14 hari bekerja.</li>
</ol>
<p className="text-sm text-gray-500">
  Tiada data peribadi yang disimpan selepas proses pemadaman selesai kecuali rekod arkib sekolah yang diwajibkan oleh pihak pengurusan pentadbiran.
</p>

      <h2 className="text-lg font-semibold mt-4 mb-2">4. Hubungi Kami</h2>
      <p className="text-sm">E-mel pentadbir: admin@rulafhub.com</p>
    </div>
  );
}