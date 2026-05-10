import React from 'react';

export default function RuLaFCard({ student }) {
  const getCardStyle = (tahap) => {
    if (tahap === 'Ta') return 'bg-yellow-400 text-yellow-900'; 
    if (tahap === 'Ba') return 'bg-gray-300 text-gray-900'; 
    if (tahap === 'Alif') return 'bg-orange-400 text-white'; 
    if (tahap === 'Khas') return 'bg-blue-500 text-white'; 
    return 'bg-white text-black';
  };

  return (
    <div className={`w-72 rounded-2xl shadow-xl p-4 border-2 border-white transform transition hover:scale-105 ${getCardStyle(student.tahap)}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black">{student.markah}</span>
          <span className="text-xs font-bold uppercase">Keseluruhan</span>
        </div>
        <div className="text-xl font-black uppercase text-right">
          RULAF<br/>{student.tahap}
        </div>
      </div>
      <h2 className="mt-4 text-lg font-bold text-center uppercase border-b-2 border-black/20 pb-2">
        {student.nama}
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mt-4 text-sm font-bold">
        <div className="flex justify-between"><span>3M</span> <span>{student.stat.tiga_m}</span></div>
        <div className="flex justify-between"><span>SOLAT</span> <span>{student.stat.solat}</span></div>
        <div className="flex justify-between"><span>TUGASAN</span> <span>{student.stat.kerja}</span></div>
        <div className="flex justify-between"><span>ALQURAN</span> <span>{student.stat.quran}</span></div>
        <div className="flex justify-between"><span>IQRA</span><span>{student.stat.iqra}</span></div>
        <div className="flex justify-between"><span>HADIR</span> <span>{student.stat.hadir}</span></div>
        <div className="flex justify-between"><span>UJI</span> <span>{student.stat.peperiksaan}</span></div>
        <div className="flex justify-between"><span>T_JAWI</span> <span>{student.stat.jawi}</span></div>
      </div>
    </div>
  );
}
