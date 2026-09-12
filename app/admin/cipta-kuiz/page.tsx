'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DynamicQuestion {
  level: 1 | 2 | 3;
  type: 'pilihan' | 'susun_atur' | 'suara' | 'tulis';
  imageUrl?: string; // 🖼️ Ciri baru soalan bergambar
  rumiQ: string;
  rumiOptions: string[];
  rumiA: string;
  jawiQ: string;
  jawiOptions: string[];
  jawiA: string;
}

export default function BinaKuizGuru() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  // States borang metadata kuiz
  const [tajuk, setTajuk] = useState('');
  const [subjek, setSubjek] = useState('Jawi');
  const [darjah, setDarjah] = useState('Darjah 3');
  const [deskripsi, setDeskripsi] = useState('');

  // 🚀 Senarai Soalan Dinamik
  const [questions, setQuestions] = useState<DynamicQuestion[]>([
    {
      level: 1,
      type: 'pilihan',
      imageUrl: '',
      rumiQ: '',
      rumiOptions: ['', '', ''],
      rumiA: '',
      jawiQ: '',
      jawiOptions: ['', '', ''],
      jawiA: ''
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    semakSesiAkses();
  }, []);

  const semakSesiAkses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      const { data: profil } = await supabase
        .from('profil_pengguna')
        .select('peranan')
        .eq('email', session.user.email)
        .single();
      
      if (profil && (profil.peranan === 'Guru' || profil.peranan === 'admin')) {
        setIsTeacher(true);
      } else {
        alert('Ralat Akses: Seksyen ini hanya untuk Guru bertauliah.');
        router.push('/');
      }
    } else {
      router.push('/login');
    }
  };

  const tambahSoalanBaru = () => {
    setQuestions(prev => [
      ...prev,
      {
        level: 1,
        type: 'pilihan',
        imageUrl: '',
        rumiQ: '',
        rumiOptions: ['', '', ''],
        rumiA: '',
        jawiQ: '',
        jawiOptions: ['', '', ''],
        jawiA: ''
      }
    ]);
  };

  const buangSoalan = (index: number) => {
    if (questions.length === 1) {
      return alert('Misi permainan mestilah mempunyai sekurang-kurangnya satu (1) soalan!');
    }
    setQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: keyof DynamicQuestion, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, type: 'rumi' | 'jawi', oIndex: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      if (type === 'rumi') {
        const optsCopy = [...copy[qIndex].rumiOptions];
        optsCopy[oIndex] = val;
        copy[qIndex].rumiOptions = optsCopy;
      } else {
        const optsCopy = [...copy[qIndex].jawiOptions];
        optsCopy[oIndex] = val;
        copy[qIndex].jawiOptions = optsCopy;
      }
      return copy;
    });
  };

  // Muat naik fail gambar ke Supabase Storage
  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      const fileExt = file.name.split('.').pop();
      const fileName = `kuiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `soalan-visual/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('modul-rulaf')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modul-rulaf')
        .getPublicUrl(filePath);

      handleQuestionChange(index, 'imageUrl', publicUrl);
    } catch (err: any) {
      alert('Gagal memuat naik gambar: ' + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const simpanKuizBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tajuk) {
      return alert('Sila masukkan Tajuk Misi Permainan!');
    }

    setIsSaving(true);

    const level1: any[] = [];
    const level2: any[] = [];
    const level3: any[] = [];

    questions.forEach((q) => {
      const formatted: any = {};
      
      let jawiQText = q.jawiQ;
      let rumiQText = q.rumiQ;

      if (q.type === 'suara') {
        jawiQText = `[Lafaz Niat] ${q.jawiQ}`;
        rumiQText = `[Lafaz Niat] ${q.rumiQ}`;
      } else if (q.type === 'tulis') {
        jawiQText = `[Tulis Jawi] ${q.jawiQ}`;
        rumiQText = `[Tulis Jawi] ${q.rumiQ}`;
      } else if (q.type === 'susun_atur') {
        jawiQText = `[Susun Atur] ${q.jawiQ}`;
        rumiQText = `[Susun Atur] ${q.rumiQ}`;
      }

      // 🖼️ Sertakan URL gambar jika ada
      if (q.imageUrl && q.imageUrl.trim() !== '') {
        formatted.img = q.imageUrl.trim();
      }

      formatted.jawi = {
        q: jawiQText,
        options: q.jawiOptions.filter(o => o.trim() !== ''),
        a: q.jawiA
      };

      formatted.rumi = {
        q: rumiQText,
        options: q.rumiOptions.filter(o => o.trim() !== ''),
        a: q.rumiA
      };

      if (q.level === 1) level1.push(formatted);
      else if (q.level === 2) level2.push(formatted);
      else level3.push(formatted);
    });

    const finalPayload = {
      tajuk,
      subjek,
      darjah,
      deskripsi,
      soalan: {
        level1: level1,
        level2: level2.length > 0 ? level2 : [{ jawi: { q: "Adakah anda faham?", options: ["Ya", "Tidak"], a: "Ya" } }],
        level3: level3.length > 0 ? level3 : [{ jawi: { q: "Adakah anda bersedia?", options: ["Sedia", "Belum Sedia"], a: "Sedia" } }]
      }
    };

    const { error } = await supabase.from('rulaf_kuiz').insert([finalPayload]);

    setIsSaving(false);
    if (error) {
      alert('Ralat menyimpan kuiz: ' + error.message);
    } else {
      alert('🎉 Tahniah! Misi permainan bergambar berjaya diterbitkan!');
      router.push('/permainan');
    }
  };

  if (!isLoggedIn || !isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1419] flex items-center justify-center font-mono">
        <p className="animate-pulse text-[#1793D1]">Menyemak kelayakan pentadbir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0F1419] text-gray-800 dark:text-[#A5B2D9] font-mono p-4 sm:p-10 selection:bg-[#1793D1] selection:text-white">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#171A21] border border-gray-200 dark:border-[#1793D1] rounded shadow-lg overflow-hidden transition-all duration-300">
        
        <div className="bg-[#1793D1] text-[#0F1419] px-6 py-4 flex justify-between items-center font-bold text-sm">
          <span>🛠️ BINA MISI PERMAINAN (SOALAN BERGAMBAR & TEKS)</span>
          <Link href="/admin" className="text-white hover:underline">[ cd ~/ Admin ]</Link>
        </div>

        <form onSubmit={simpanKuizBaru} className="p-6 sm:p-10 space-y-8">
          
          {/* Metadata */}
          <div className="space-y-4 bg-gray-50 dark:bg-[#11141b]/50 p-6 rounded border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">1. Maklumat Utama Permainan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-bold">Tajuk Misi</label>
                <input type="text" required value={tajuk} onChange={(e)=>setTajuk(e.target.value)} placeholder="Cth: Eja Objek Jawi Bergambar" className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 p-2 rounded text-sm focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-bold">Subjek</label>
                <select value={subjek} onChange={(e)=>setSubjek(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 p-2.5 rounded text-sm focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white">
                  <option value="Jawi">Jawi</option>
                  <option value="Ibadah">Ibadah</option>
                  <option value="Tauhid">Tauhid</option>
                  <option value="Sirah">Sirah</option>
                  <option value="Adab">Adab</option>
                  <option value="Bahasa Arab">Bahasa Arab</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-bold">Peringkat Sasaran</label>
                <select value={darjah} onChange={(e)=>setDarjah(e.target.value)} className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 p-2.5 rounded text-sm focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white">
                  <option value="Darjah 1">Darjah 1</option>
                  <option value="Darjah 2">Darjah 2</option>
                  <option value="Darjah 3">Darjah 3</option>
                  <option value="Darjah 4">Darjah 4</option>
                  <option value="Darjah 5">Darjah 5</option>
                  <option value="UPKK">UPKK</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">Deskripsi Misi</label>
              <textarea rows={2} required value={deskripsi} onChange={(e)=>setDeskripsi(e.target.value)} placeholder="Tuliskan penerangan ringkas tentang objektif siri kuiz ini..." className="w-full bg-white dark:bg-[#171A21] border border-gray-300 dark:border-gray-700 p-2 rounded text-sm focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white" />
            </div>
          </div>

          {/* Form Builder Soalan */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">📝 2. Set Soalan Misi ({questions.length})</h2>
              <button
                type="button"
                onClick={tambahSoalanBaru}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded text-xs transition-all shadow-md active:scale-95"
              >
                [ + Tambah Soalan ]
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-[#11141b]/60 border border-gray-200 dark:border-gray-800 rounded relative space-y-4">
                <button
                  type="button"
                  onClick={() => buangSoalan(idx)}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white text-[10px] px-2.5 py-1 rounded font-bold"
                >
                  Padam Soalan #{idx + 1}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-bold">Pilih Tahap (Level)</label>
                    <select
                      value={q.level}
                      onChange={(e) => handleQuestionChange(idx, 'level', parseInt(e.target.value))}
                      className="w-full bg-white dark:bg-[#171A21] border rounded p-2 text-xs focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white"
                    >
                      <option value={1}>Tahap 1 (Bilingual Jawi-Rumi)</option>
                      <option value={2}>Tahap 2 (Jawi Sahaja)</option>
                      <option value={3}>Tahap 3 (Jawi Sahaja - Level Boss)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-bold">Jenis Interaktiviti</label>
                    <select
                      value={q.type}
                      onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                      className="w-full bg-white dark:bg-[#171A21] border rounded p-2 text-xs focus:outline-none focus:border-[#1793D1] text-gray-900 dark:text-white"
                    >
                      <option value="pilihan">Pilihan 3 Jawapan (Standard MCQ)</option>
                      <option value="susun_atur">Susun Atur Kalimat (Drag & Drop)</option>
                      <option value="suara">Sebutan Suara (TTS Pembaca Arab)</option>
                      <option value="tulis">Lakar Jawi Kanvas (Canvas Writing)</option>
                    </select>
                  </div>
                </div>

                {/* 🖼️ MODUL GAMBAR SOALAN */}
                <div className="bg-blue-50/50 dark:bg-[#1793D1]/5 border border-[#1793D1]/30 p-3.5 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-[#1793D1] flex items-center gap-2">
                    🖼️ Gambar Rangsangan Soalan (Pilihan / Visual Scaffolding)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <input
                        type="url"
                        placeholder="Tampal Pautan Gambar (cth: https://...)"
                        value={q.imageUrl || ''}
                        onChange={(e) => handleQuestionChange(idx, 'imageUrl', e.target.value)}
                        className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none mb-1.5"
                      />
                      <label className="text-[11px] text-gray-500 block mb-1">Atau muat naik imej (.jpg/.png):</label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingIndex === idx}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(idx, e.target.files[0]);
                          }
                        }}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#1793D1] file:text-white hover:file:opacity-80"
                      />
                      {uploadingIndex === idx && <span className="text-[10px] text-orange-500 ml-2 animate-pulse">Memuat naik imej...</span>}
                    </div>

                    {/* Pratonton Gambar */}
                    {q.imageUrl && (
                      <div className="flex items-center gap-3">
                        <img
                          src={q.imageUrl}
                          alt={`Visual Soalan ${idx + 1}`}
                          className="h-24 w-36 object-contain rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-black p-1 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(idx, 'imageUrl', '')}
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          [ Buang Imej ]
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Inputs Jawi & Rumi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  
                  {/* BAHAGIAN JAWI */}
                  <div className="space-y-3 bg-[#1793D1]/5 p-4 rounded border border-[#1793D1]/20">
                    <h4 className="text-xs font-bold text-[#1793D1]">🕌 BAHAGIAN JAWI</h4>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Teks Soalan Jawi</label>
                      <input
                        type="text"
                        required
                        value={q.jawiQ}
                        onChange={(e) => handleQuestionChange(idx, 'jawiQ', e.target.value)}
                        placeholder="Cth: اڤاکه نام بواه دالم ݢامبر دأتس؟"
                        className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs text-right rounded text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    {q.type === 'pilihan' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] text-gray-400">Pilihan Jawapan Jawi (3 Opsi)</label>
                        <input type="text" required value={q.jawiOptions[0] || ''} onChange={(e) => handleOptionChange(idx, 'jawi', 0, e.target.value)} placeholder="Pilihan 1" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs text-right rounded text-gray-900 dark:text-white focus:outline-none" />
                        <input type="text" required value={q.jawiOptions[1] || ''} onChange={(e) => handleOptionChange(idx, 'jawi', 1, e.target.value)} placeholder="Pilihan 2" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs text-right rounded text-gray-900 dark:text-white focus:outline-none" />
                        <input type="text" required value={q.jawiOptions[2] || ''} onChange={(e) => handleOptionChange(idx, 'jawi', 2, e.target.value)} placeholder="Pilihan 3" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs text-right rounded text-gray-900 dark:text-white focus:outline-none" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Jawapan Betul Jawi</label>
                      <input
                        type="text"
                        required
                        value={q.jawiA}
                        onChange={(e) => handleQuestionChange(idx, 'jawiA', e.target.value)}
                        placeholder="Masukkan jawapan tepat"
                        className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs text-right rounded text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* BAHAGIAN RUMI */}
                  <div className="space-y-3 bg-gray-200/20 dark:bg-gray-800/20 p-4 rounded border border-gray-300 dark:border-gray-800">
                    <h4 className="text-xs font-bold text-gray-500">🔤 BAHAGIAN RUMI</h4>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Teks Soalan Rumi</label>
                      <input
                        type="text"
                        required={q.level === 1}
                        value={q.rumiQ}
                        onChange={(e) => handleQuestionChange(idx, 'rumiQ', e.target.value)}
                        placeholder="Cth: Apakah nama buah dalam gambar di atas?"
                        className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    {q.type === 'pilihan' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] text-gray-400">Pilihan Jawapan Rumi (3 Opsi)</label>
                        <input type="text" required={q.level === 1} value={q.rumiOptions[0] || ''} onChange={(e) => handleOptionChange(idx, 'rumi', 0, e.target.value)} placeholder="Pilihan 1" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none" />
                        <input type="text" required={q.level === 1} value={q.rumiOptions[1] || ''} onChange={(e) => handleOptionChange(idx, 'rumi', 1, e.target.value)} placeholder="Pilihan 2" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none" />
                        <input type="text" required={q.level === 1} value={q.rumiOptions[2] || ''} onChange={(e) => handleOptionChange(idx, 'rumi', 2, e.target.value)} placeholder="Pilihan 3" className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Jawapan Betul Rumi</label>
                      <input
                        type="text"
                        required={q.level === 1}
                        value={q.rumiA}
                        onChange={(e) => handleQuestionChange(idx, 'rumiA', e.target.value)}
                        placeholder="Masukkan jawapan tepat"
                        className="w-full bg-white dark:bg-[#171A21] border p-2 text-xs rounded text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-[#1793D1] text-[#0F1419] font-black text-sm rounded shadow hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {isSaving ? "SEDANG MENYIMPAN MISI..." : "[ TERBITKAN KUIZ DYNAMIC GURU ]"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}