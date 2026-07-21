'use client';
import React, { useState } from 'react';
import { supabase } from './../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PengurusanSekolah() {
  const router = useRouter();
  
  // Hierarki 1: Sekolah
  const [sekolah, setSekolah] = useState('JYP0014 : SEKOLAH AGAMA SERI MUAFAKAT (6581)');
  
  // Hierarki 2: Kelas & Sesi
  const [kelas, setKelas] = useState('');
  const [bulanTahun, setBulanTahun] = useState('');

  // Hierarki 3: Pelajar & Markah
  const [senaraiMurid, setSenaraiMurid] = useState<any[]>([]);
  const [borangMarkah, setBorangMarkah] = useState<any>({});
  const [isPushing, setIsPushing] = useState(false);

  // Fungsi Tarik Data Murid berdasarkan Kelas (Diambil dari CSV anda)
  const paparSenaraiPelajar = async () => {
    if (!kelas) return alert('[!] Ralat: Sila pilih kelas.');
    if (!bulanTahun) return alert('[!] Ralat: Sila masukkan Bulan & Tahun penggredan (Contoh: April 2026).');

    let dataPelajar: any[] = [];
    
    // Membaca data dari 3 Murshid.csv
    if (kelas === '3 Murshid') {
      dataPelajar = [
        { bil: 1, mykid: '170807010333', nama: 'ADI ISKANDAR ALHAQ NORHASHIM BIN ABDUL FATTAH', jantina: 'LELAKI' },
        { bil: 2, mykid: '170401010368', nama: 'AINIYAH SHABIRA BINTI MUTAKIN', jantina: 'PEREMPUAN' },
        { bil: 3, mykid: '170726010980', nama: 'AISYAH SUMAYYAH BINTI MOHD AMINURRASYID', jantina: 'PEREMPUAN' },
        { bil: 4, mykid: '170913011188', nama: 'AQILAH DARWISYAH BINTI YUSRIZAL', jantina: 'PEREMPUAN' },
        { bil: 5, mykid: '170306011282', nama: 'ARIYANA MIKAYLA BINTI MOHD RAZIB', jantina: 'PEREMPUAN' },
        { bil: 6, mykid: '170222010143', nama: 'HARRAZ IQBAL BIN MUHAMAD HAFIZUDDIN', jantina: 'LELAKI' },
        { bil: 7, mykid: '171211010564', nama: 'HAURA AMEERA BINTI ABU AMIR', jantina: 'PEREMPUAN' },
        { bil: 8, mykid: '170119011236', nama: 'HAURA AMEENA BINTI ABU AMIR', jantina: 'PEREMPUAN' },
        { bil: 9, mykid: '170906010398', nama: 'INSYIRAH DHARIYAH BINTI MOHD NASARUDDIN', jantina: 'PEREMPUAN' },
        { bil: 10, mykid: '171220011737', nama: 'MUHAMMAD ARIFFUDDIN AZHAR BIN NAZRIEFAIZAN', jantina: 'LELAKI' },
        { bil: 11, mykid: '170717020271', nama: 'MUHAMMAD HAFIZZUDIN JALIL BIN ABDUL RAHMAN', jantina: 'LELAKI' },
        { bil: 12, mykid: '170415010887', nama: 'MUHAMMAD IZDIYAD NAUFAL BIN MOHD IRWAN', jantina: 'LELAKI' },
        { bil: 13, mykid: '171119011425', nama: 'MUHAMMAD NASRUL HAQ BIN MOHD AZHAR', jantina: 'LELAKI' },
        { bil: 14, mykid: '171101011590', nama: 'NUR ADRA IRDINA BINTI MOHAMMAD HAIRULNIZAM', jantina: 'PEREMPUAN' },
        { bil: 15, mykid: '171008010630', nama: 'NUR AISYAH BINTI AZREEN', jantina: 'PEREMPUAN' },
        { bil: 16, mykid: '171118010156', nama: 'NUR AISYAH HUMAIRA BINTI MOHD NORAZIZI', jantina: 'PEREMPUAN' },
        { bil: 17, mykid: '171031010110', nama: 'NUR AISYAH HUMAIRA BINTI ZULHELMI', jantina: 'PEREMPUAN' },
        { bil: 18, mykid: '170203010236', nama: 'NUR AMIRAH SOPHEA BINTI MOHD RIDZUAN', jantina: 'PEREMPUAN' },
        { bil: 19, mykid: '171126010172', nama: 'NUR AYRA BINTI IBRAHIM', jantina: 'PEREMPUAN' },
        { bil: 20, mykid: '170219010222', nama: 'NUR MAISARAH BINTI MUHAMMAD NAJIB', jantina: 'PEREMPUAN' },
        { bil: 21, mykid: '170506010962', nama: 'NUR QAMARINA NURAIN BINTI MOHD SANI', jantina: 'PEREMPUAN' },
        { bil: 22, mykid: '170117011056', nama: 'NUR QUDWATUN HASANAH BINTI MUHAMMAD AZIZUL', jantina: 'PEREMPUAN' },
        { bil: 23, mykid: '170322010714', nama: 'NUR RAISHA FAIHA BINTI MOHD FIRDAUS', jantina: 'PEREMPUAN' },
        { bil: 24, mykid: '171008010278', nama: 'NUR SYAZWIN BINTI MOHD SALLEH', jantina: 'PEREMPUAN' },
        { bil: 25, mykid: '170329010960', nama: 'PUTERI CAHAYA DANIELLA BINTI HERLMAN', jantina: 'PEREMPUAN' },
        { bil: 26, mykid: '170821012568', nama: 'PUTERI NUR HAWA BINTI ABDUL HAKIM', jantina: 'PEREMPUAN' },
        { bil: 27, mykid: '170519010435', nama: 'QALISH QAYYUM BIN MOHD KHAIRUL FAUZI NADZAM', jantina: 'LELAKI' },
        { bil: 28, mykid: '170504010336', nama: 'QASEH NUR AIN BINTI ABD RAZAK', jantina: 'PEREMPUAN' },
        { bil: 29, mykid: '170819010824', nama: 'QASEH NUR DAMIA BINTI ABDUL SHUKOR', jantina: 'PEREMPUAN' },
        { bil: 30, mykid: '170515011326', nama: 'SITI NUR BATRISYIA BINTI RAHMAT', jantina: 'PEREMPUAN' },
      ];
    } 
    // Membaca data dari 5 Murshid.csv
    else if (kelas === '5 Murshid') {
      dataPelajar = [
        { bil: 1, mykid: '150915010885', nama: 'ABYAN DARWISY BIN YUSRIZAL', jantina: 'LELAKI' },
        { bil: 2, mykid: '150524011098', nama: 'INSYIRAH DHUHA BINTI MOHD NASARUDDIN', jantina: 'PEREMPUAN' },
        { bil: 3, mykid: '150829010619', nama: 'KAARIZ MUHAMMAD DILFY BIN KHAIRUL AMARI', jantina: 'LELAKI' },
        { bil: 4, mykid: '150616010551', nama: 'MALIK BIN AZRY', jantina: 'LELAKI' },
        { bil: 5, mykid: '150104010793', nama: 'MOHAMAD ANIQ QAYYUM BIN MOHAMAD AZIZULQURNAIN', jantina: 'LELAKI' },
        { bil: 6, mykid: '150608011853', nama: 'MUHAMMAD ANAS BIN MD SAMSUL QAMAR', jantina: 'LELAKI' },
        { bil: 7, mykid: '150905010443', nama: 'MUHAMMAD ASYRAAF BIN MOHD AIZAT', jantina: 'LELAKI' },
        { bil: 8, mykid: '151229010177', nama: 'MUHAMMAD IMAN RIFQI BIN MOHD ROZI', jantina: 'LELAKI' },
        { bil: 9, mykid: '150707011859', nama: 'MUHAMMAD ISYRAF TAHQIF BIN ZAINAL', jantina: 'LELAKI' },
        { bil: 10, mykid: '150811010215', nama: 'MUHAMMAD NIYAZ AMSYAR BIN MOHD NASIR', jantina: 'LELAKI' },
        { bil: 11, mykid: '150930010365', nama: 'MUHAMMAD NUR ARYAN HARITH BIN NORHASWAD', jantina: 'LELAKI' },
        { bil: 12, mykid: '141030010525', nama: 'MUHAMMAD QAYYIUM MIKHAIL BIN MUHAMMAD AZIZUL', jantina: 'LELAKI' },
        { bil: 13, mykid: '151129011041', nama: 'NOOR HAFIY IKHWAAN BIN NOOR HALIM', jantina: 'LELAKI' },
        { bil: 14, mykid: '150314011145', nama: 'NORFIRAS ARSYAD BIN MOHD NORHARIDZUAN', jantina: 'LELAKI' },
        { bil: 15, mykid: '151015140910', nama: 'NUR ALESHA ZAHRA BINTI MOHD SAFRI', jantina: 'PEREMPUAN' },
        { bil: 16, mykid: '150814010640', nama: 'NUR ALYA HANNAN BINTI MUHAMAD ARIDZUAN', jantina: 'PEREMPUAN' },
        { bil: 17, mykid: '150708011658', nama: 'NUR ANNISA FAIHA BINTI MUSMULIADI', jantina: 'PEREMPUAN' },
        { bil: 18, mykid: '140908010802', nama: 'NUR AUNI ALEESYA BINTI MOHAMMAD HAIRULNIZAM', jantina: 'PEREMPUAN' },
        { bil: 19, mykid: '140731011542', nama: 'NUR DAHLIA DALISHA BINTI SULAIMAN', jantina: 'PEREMPUAN' },
        { bil: 20, mykid: '151121010116', nama: 'NUR DAMIA ALISHA BINTI MOHD ASRUL', jantina: 'PEREMPUAN' },
        { bil: 21, mykid: '150703010568', nama: 'NUR HIDAYAH INSYIRAH BINTI NOOR HAKEM', jantina: 'PEREMPUAN' },
        { bil: 22, mykid: '151104010974', nama: 'NUR KHALISAH BINTI ZULKIFLI', jantina: 'PEREMPUAN' },
        { bil: 23, mykid: '150204010088', nama: 'NUR MAISARAH BINTI MOHAMMED GHOWS', jantina: 'PEREMPUAN' },
        { bil: 24, mykid: '140922011764', nama: 'NUR MUAZZAH BINTI MUHIZAN', jantina: 'PEREMPUAN' },
        { bil: 25, mykid: '150702010638', nama: 'NUR NAJWA QALISAH BINTI NORDIN', jantina: 'PEREMPUAN' },
        { bil: 26, mykid: '130808010670', nama: 'NUR SYIFFA QALEESYA BINTI MUHAMMAD AZIZUL', jantina: 'PEREMPUAN' },
        { bil: 27, mykid: '140904010338', nama: 'NUR ZAKIRAH NURAIN BINTI MOHD ZAINI', jantina: 'PEREMPUAN' },
        { bil: 28, mykid: '150322010636', nama: 'UMMI UMAIRAH BINTI ABD RAZAK', jantina: 'PEREMPUAN' },
      ];
    }

    setSenaraiMurid(dataPelajar);

    // Sediakan state 'borang kosong' bagi setiap MyKid untuk diisi secara manual
    const stateAwal: any = {};
    dataPelajar.forEach((murid) => {
      stateAwal[murid.mykid] = { kehadiran: '', markah_jawi: '', bacaan_quran: '', hafazan: '' };
    });
    setBorangMarkah(stateAwal);
  };

  const handleInput = (mykid: string, field: string, value: string) => {
    setBorangMarkah((prev: any) => ({
      ...prev,
      [mykid]: { ...prev[mykid], [field]: value }
    }));
  };

  const pushSistem = async () => {
    setIsPushing(true);
    const payload = senaraiMurid.map((murid) => ({
      mykid: murid.mykid,
      nama_murid: murid.nama,
      kelas_id: kelas,
      bulan_tahun: bulanTahun,
      kehadiran: borangMarkah[murid.mykid].kehadiran,
      markah_jawi: borangMarkah[murid.mykid].markah_jawi,
      bacaan_quran: borangMarkah[murid.mykid].bacaan_quran,
      hafazan: borangMarkah[murid.mykid].hafazan,
      tahap_rulaf: borangMarkah[murid.mykid]?.tahap_rulaf || murid.tahap_rulaf
    }));

    const { error } = await supabase.from('markah_murid').insert(payload);

    if (error) {
      alert('Ralat Pangkalan Data: ' + error.message);
    } else {
      alert(`[+] Berjaya! Data markah kelas ${kelas} bagi sesi ${bulanTahun} telah dikemas kini ke dalam pangkalan data.`);
      setSenaraiMurid([]); 
      setBulanTahun('');
      setKelas('');
    }
    setIsPushing(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-7xl mx-auto bg-[#171A21] border border-[#1793D1] rounded-sm shadow-[0_0_15px_rgba(23,147,209,0.3)]">
        
        <div className="bg-[#1793D1] text-[#0F1419] px-4 py-2 flex justify-between items-center font-bold text-sm">
          <span>rulaf-admin(1) - SISTEM PENGURUSAN INSTITUSI BERSEPADU</span>
          <button onClick={() => router.push('/admin')} className="hover:text-white font-bold transition-colors">
            [ cd .. / Kembali ke Admin ]
          </button>
        </div>

        <div className="p-8">
          {/* HIERARKI 1: NAMA SEKOLAH */}
          <div className="mb-6 border-b border-gray-700 pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="text-orange-500">❖</span> {sekolah}
            </h1>
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500 px-3 py-1 text-xs font-bold rounded">
              MOD PENGGREDAN AKTIF
            </span>
          </div>

          {/* HIERARKI 2: PILIHAN KELAS (Mirip UI SIMPENI) */}
          <div className="bg-gray-900 border border-gray-700 p-4 mb-8 shadow-md flex flex-col sm:flex-row gap-4 items-end rounded">
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold mb-1 text-gray-300">PILIH KELAS:</label>
              <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="w-full p-2 bg-black border border-gray-600 text-white outline-none focus:border-[#1793D1]">
                <option value="">-- Senarai Kelas --</option>
                <option value="3 Murshid">3 MURSHID</option>
                <option value="5 Murshid">5 MURSHID</option>
              </select>
            </div>
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold mb-1 text-gray-300">BULAN / TAHUN:</label>
              <input type="text" value={bulanTahun} onChange={(e)=>setBulanTahun(e.target.value)} className="w-full p-2 bg-black border border-gray-600 text-white outline-none focus:border-[#1793D1]" placeholder="Contoh: April 2026" />
            </div>
            <div className="w-full sm:w-1/3">
              <button onClick={paparSenaraiPelajar} className="bg-[#1793D1] text-black w-full py-2 font-bold hover:bg-blue-400 transition-colors h-[42px] rounded-sm">
                [ PAPAR PELAJAR ]
              </button>
            </div>
          </div>

          {/* HIERARKI 3: SENARAI MURID & KEMASUKAN MARKAH */}
          {senaraiMurid.length > 0 && (
            <div className="bg-[#14181F] border border-gray-700 shadow-md overflow-hidden rounded">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 font-bold text-white text-sm">
                MAKLUMAT PELAJAR & KEMASUKAN MARKAH - KELAS {kelas.toUpperCase()}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-black/50 text-[#1793D1] text-xs border-b border-gray-700">
                      <th className="p-3 font-bold text-center w-10">BIL</th>
                      <th className="p-3 font-bold">NAMA PELAJAR</th>
                      <th className="p-3 font-bold w-32">NO. KP (MYKID)</th>
                      <th className="p-3 font-bold w-24">JANTINA</th>
                      <th className="p-3 font-bold w-24 text-center">KEHADIRAN</th>
                      <th className="p-3 font-bold w-24 text-center">JAWI (%)</th>
                      <th className="p-3 font-bold w-32 text-center">BACAAN QURAN</th>
                      <th className="p-3 font-bold w-24 text-center">HAFAZAN</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-300">
                    {senaraiMurid.map((murid) => (
                      <tr key={murid.mykid} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 text-center">{murid.bil}.</td>
                        <td className="p-3 font-bold text-white">{murid.nama}</td>
                        <td className="p-3">{murid.mykid}</td>
                        <td className="p-3">{murid.jantina}</td>
                        
                        {/* Ruangan Pengisian Manual */}
                        <td className="p-2">
                          <input type="number" value={borangMarkah[murid.mykid]?.kehadiran} onChange={(e) => handleInput(murid.mykid, 'kehadiran', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-center text-white outline-none focus:border-green-500 rounded-sm" placeholder="Hari" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={borangMarkah[murid.mykid]?.markah_jawi} onChange={(e) => handleInput(murid.mykid, 'markah_jawi', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-center text-white outline-none focus:border-green-500 rounded-sm" placeholder="%" />
                        </td>
                        <td className="p-2">
                          <select value={borangMarkah[murid.mykid]?.bacaan_quran} onChange={(e) => handleInput(murid.mykid, 'bacaan_quran', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-xs text-center text-white outline-none focus:border-green-500 rounded-sm">
                            <option value="">--Pilih--</option>
                            <option value="Iqra 1">Iqra 1</option>
                            <option value="Iqra 2">Iqra 2</option>
                            <option value="Iqra 3">Iqra 3</option>
                            <option value="Iqra 4">Iqra 4</option>
                            <option value="Iqra 5">Iqra 5</option>
                            <option value="Iqra 6">Iqra 6</option>
                            <option value="Al-Quran">Al-Quran</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={borangMarkah[murid.mykid]?.hafazan} onChange={(e) => handleInput(murid.mykid, 'hafazan', e.target.value)} className="w-full p-1.5 bg-black border border-gray-600 text-xs text-center text-white outline-none focus:border-green-500 rounded-sm">
                            <option value="">- Gred -</option>
                            <option value="A">Gred A</option>
                            <option value="B">Gred B</option>
                            <option value="C">Gred C</option>
                            <option value="D">Gred D</option>
                            <option value="E">Gred E</option>
    </select>
                        </td>
  <td className="p-2 border border-gray-700">
    <select
      className="w-full bg-black border border-gray-600 p-1 text-xs text-white focus:border-[#1793D1]"
      defaultValue={murid.tahap_rulaf || ''}
      onChange={(e) => handleInput(murid.mykid, 'tahap_rulaf', e.target.value)}
    >
      <option value="">- Pilih Tahap -</option>
      <option value="RuLaF Ta">[*] RuLaF Ta (Mentor)</option>
      <option value="RuLaF Ba">[~] RuLaF Ba (Sederhana)</option>
      <option value="RuLaF Alif">[!] RuLaF Alif (Lemah)</option>
      <option value="RuLaF Khas">[!!] RuLaF Khas (Pemulihan)</option>
    </select>
  </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                <button onClick={pushSistem} disabled={isPushing} className="bg-green-600 text-white px-8 py-2 font-bold hover:bg-green-500 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.4)] disabled:bg-gray-600 disabled:text-gray-400 rounded-sm">
                  {isPushing ? 'MENYIMPAN DATA...' : 'SIMPAN MARKAH KELAS'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}