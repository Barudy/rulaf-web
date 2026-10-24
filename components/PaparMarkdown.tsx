'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * PaparMarkdown — renderer ringkas gaya GitHub untuk README/blog + Sokongan Pemain YouTube.
 */
export default function PaparMarkdown({ teks, kelas = '' }: { teks: string; kelas?: string }) {
  if (!teks) return null;

  // 📺 Sokongan YouTube Embed secara automatik jika URL YouTube dikesan
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;
  const matchYoutube = youtubeRegex.exec(teks);
  const youtubeEmbedId = matchYoutube ? matchYoutube[1] : null;

  const baris = teks.split('\n');

  const renderInline = (s: string, kunci: string): React.ReactNode[] => {
    const hasil: React.ReactNode[] = [];
    let baki = s;
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Imej ![alt](url)
      const mImej = /!\[([^\]]*)\]\(([^)\s]+)\)/.exec(baki);
      // Pautan [teks](url)
      const mPautan = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(baki);
      // Bold **teks**
      const mBold = /\*\*([^*]+)\*\*/.exec(baki);
      // Italic *teks*
      const mItalik = /(?<!\*)\*([^*\n]+)\*(?!\*)/.exec(baki);
      // Code `teks`
      const mKod = /`([^`]+)`/.exec(baki);

      const kandidat = [
        mImej ? { jenis: 'imej', m: mImej } : null,
        mPautan ? { jenis: 'pautan', m: mPautan } : null,
        mBold ? { jenis: 'bold', m: mBold } : null,
        mItalik ? { jenis: 'italik', m: mItalik } : null,
        mKod ? { jenis: 'kod', m: mKod } : null,
      ].filter(Boolean) as { jenis: string; m: RegExpExecArray }[];

      if (kandidat.length === 0) { if (baki) hasil.push(baki); break; }
      const terawal = kandidat.reduce((a, b) => (b.m.index < a.m.index ? b : a));
      if (terawal.m.index > 0) hasil.push(baki.slice(0, terawal.m.index));
      const [, teksM, urlM] = terawal.m;
      const key = `${kunci}-${i++}`;
      if (terawal.jenis === 'imej') hasil.push(<img key={key} src={urlM} alt={teksM} className="rounded-lg max-w-full my-1" loading="lazy" />);
      else if (terawal.jenis === 'pautan') {
        const dalaman = urlM.startsWith('/');
        hasil.push(dalaman
          ? <Link key={key} href={urlM} className="text-[#1793D1] font-bold hover:underline">{teksM}</Link>
          : <a key={key} href={urlM} target="_blank" rel="noopener noreferrer" className="text-[#1793D1] font-bold hover:underline">{teksM}</a>);
      }
      else if (terawal.jenis === 'bold') hasil.push(<strong key={key} className="font-black text-gray-900 dark:text-white">{teksM}</strong>);
      else if (terawal.jenis === 'italik') hasil.push(<em key={key}>{teksM}</em>);
      else hasil.push(<code key={key} className="bg-gray-100 dark:bg-[#11141b] px-1.5 py-0.5 rounded text-[11px] font-mono text-rose-600 dark:text-rose-400">{teksM}</code>);
      baki = baki.slice(terawal.m.index + terawal.m[0].length);
    }
    return hasil;
  };

  const senarai: React.ReactNode[] = [];
  let senaraiAktif: { jenis: 'bullet' | 'nombor'; item: React.ReactNode[] } | null = null;
  const tutupSenarai = () => {
    if (!senaraiAktif) return;
    const Tag = senaraiAktif.jenis === 'bullet' ? 'ul' : 'ol';
    senarai.push(
      <Tag key={senarai.length} className={`list-inside ${senaraiAktif.jenis === 'bullet' ? 'list-disc' : 'list-decimal'} ml-5 my-1 space-y-0.5`}>
        {senaraiAktif.item.map((it, ix) => <li key={ix}>{it}</li>)}
      </Tag>
    );
    senaraiAktif = null;
  };

  baris.forEach((b, idx) => {
    const bTrim = b.trim();
    if (!bTrim) { tutupSenarai(); return; }

    // Jika baris adalah URL YouTube tunggal, paparkan video player iframe responsive
    const ytMatch = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/.exec(bTrim);
    if (ytMatch) {
      tutupSenarai();
      const vidId = ytMatch[1];
      senarai.push(
        <div key={idx} className="my-4 aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black shadow-lg">
          <iframe
            src={`https://www.youtube-embed.netlify.app/embed/${vidId} || https://www.youtube.com/embed/${vidId}`}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
      return;
    }

    const mTajuk = /^(#{1,4})\s+(.+)$/.exec(bTrim);
    if (mTajuk) {
      tutupSenarai();
      const tahap = mTajuk[1].length;
      const kelasT = tahap <= 1 ? 'text-lg font-black mt-4 mb-1'
        : tahap === 2 ? 'text-base font-black mt-3 mb-1'
        : 'text-sm font-black mt-2 mb-1';
      const Tag: any = `h${Math.min(tahap + 1, 6)}`;
      senarai.push(<Tag key={idx} className={`${kelasT} text-gray-900 dark:text-white`}>{renderInline(mTajuk[2], `t${idx}`)}</Tag>);
      return;
    }
    if (/^(-{3,}|\*{3,})$/.test(bTrim)) { tutupSenarai(); senarai.push(<hr key={idx} className="border-gray-200 dark:border-gray-800 my-3" />); return; }
    if (/^>\s?/.test(bTrim)) {
      tutupSenarai();
      senarai.push(
        <blockquote key={idx} className="border-l-4 border-[#1793D1] pl-3 py-1 bg-sky-50 dark:bg-[#11141b] my-2 text-gray-700 dark:text-gray-300 italic">
          {renderInline(bTrim.replace(/^>\s?/, ''), `q${idx}`)}
        </blockquote>
      );
      return;
    }
    const mBullet = /^[-*]\s+(.+)$/.exec(bTrim);
    if (mBullet) {
      if (!senaraiAktif || senaraiAktif.jenis !== 'bullet') { tutupSenarai(); senaraiAktif = { jenis: 'bullet', item: [] }; }
      senaraiAktif.item.push(renderInline(mBullet[1], `b${idx}`));
      return;
    }
    const mNombor = /^\d+[.)]\s+(.+)$/.exec(bTrim);
    if (mNombor) {
      if (!senaraiAktif || senaraiAktif.jenis !== 'nombor') { tutupSenarai(); senaraiAktif = { jenis: 'nombor', item: [] }; }
      senaraiAktif.item.push(renderInline(mNombor[1], `n${idx}`));
      return;
    }
    tutupSenarai();
    senarai.push(<p key={idx} className="my-1 leading-relaxed">{renderInline(bTrim, `p${idx}`)}</p>);
  });
  tutupSenarai();

  return <div className={`text-xs sm:text-sm ${kelas}`}>{senarai}</div>;
}
