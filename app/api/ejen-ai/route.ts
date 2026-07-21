import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 1. Sambungan ke OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  baseURL: 'https://openrouter.ai/api/v1',
});

// 2. Sambungan rahsia ke Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    // Ambil soalan yang ditaip oleh cikgu dari paparan web
    const { soalan_guru } = await req.json();

    // 3. PROMPT SISTEM (Menyuap konteks pangkalan data kepada AI)
    const skema_database = `
    Anda adalah Ejen Analisis Data Pendidikan (ERP Agent) untuk RuLaFHub.
    Anda mempunyai akses kepada jadual PostgreSQL bernama 'markah_murid'.
    Lajur yang ada: 
    - mykid (text)
    - nama_murid (text)
    - kelas_id (text) - Contoh: '3 Murshid', '5 Murshid'
    - kehadiran (int)
    - markah_jawi (int)
    - bacaan_quran (text)
    - hafazan (text)
    - bulan_tahun (text) - Contoh: 'April 2026'
    
    Tugas anda: Tukarkan soalan pengguna kepada arahan SQL (PostgreSQL) yang SAH.
    Mod Artifak: HANYA berikan kod SQL tanpa blok kod (tiada tag \`\`\`sql). Jangan berikan sebarang penerangan tambahan. 
    Hanya pilih (SELECT) lajur yang relevan untuk menjawab soalan tersebut.
    PENTING: JANGAN letak tanda koma bertitik (;) pada hujung kod SQL!
    "Tindak sebagai Pakar Pendidikan Islam dan Pembina Modul Pembelajaran Terbeza (Differentiated Learning). Esok saya akan mengadakan ujian senyap secara lisan di dalam kelas (murid tidak dibenarkan buka buku).
Tajuk Ujian: [ Sila taip tajuk di sini, contoh: Cara Menyucikan Hadas Besar / Ejaan Jawi Imbuhan Awal ]
Tolong bina set soalan kuiz lisan berserta hint (pembayang) berdasarkan tahap kumpulan murid RuLaF saya:
1. RuLaF Ta (Murid Cemerlang/Mentor): Berikan soalan KBAT (Pemikiran Aras Tinggi). Berikan hint kognitif yang sangat minimum (hanya kata kunci). 2. RuLaF Ba (Murid Sederhana/Pembantu Fasilitator): Berikan soalan struktur atau kefahaman konteks. Berikan hint separuh jalan (membimbing pemikiran mereka). 3. RuLaF Khas & Alif (Murid Lemah/Pemulihan): Berikan soalan asas, visual, atau padanan ringkas. Berikan hint yang sangat jelas, bersifat psikomotor, dan menyokong emosi mereka supaya mereka berani menjawab.
Pastikan soalan ini pendek, santai, dan sesuai ditanya secara spontan kepada kumpulan murid bersaiz 5 orang."
    `;

    // 4. Menterjemah Bahasa Melayu ke SQL menggunakan AI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Boleh tukar kepada model lain mengikut API anda
      messages: [
        { role: 'system', content: skema_database },
        { role: 'user', content: soalan_guru }
      ],
      temperature: 0, // 0 supaya AI tidak mereka-reka (halusinasi) kod SQL
    });

    let arahan_sql = response.choices?.[0]?.message?.content?.trim() || '';
    
    // Pembersihan teks tahap tinggi (Buang markdown dan buang semicolon)
    arahan_sql = arahan_sql.replace(/```sql/g, '').replace(/```/g, '').replace(/;/g, '').trim();

    // 5. Eksekusi SQL yang dijana oleh AI terus ke Supabase melalui RPC
    const { data, error } = await supabase.rpc('execute_sql', { query: arahan_sql });

    if (error) throw error;

    // Pulangkan data kepada web
    return NextResponse.json({ sql: arahan_sql, hasil: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}