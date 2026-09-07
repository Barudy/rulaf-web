import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 1. Sambungan ke OpenRouter (OpenAI SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://rulafhub.vercel.app',
    'X-Title': 'RuLaFHub Admin AI',
  },
});

// 2. Sambungan ke Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    // 🔑 DIBAIKI: Terima sama ada 'soalan' atau 'soalan_guru'
    const body = await req.json();
    const soalanTeks = body.soalan || body.soalan_guru;

    if (!soalanTeks || typeof soalanTeks !== 'string' || !soalanTeks.trim()) {
      return NextResponse.json(
        { error: 'Sila masukkan soalan teks yang sah.' },
        { status: 400 }
      );
    }

    // 3. Prompt Sistem NL2SQL yang Tepat (Teks kuiz lisan telah dibuang)
    const skema_database = `
Anda adalah Ejen AI Analisis Data (NL2SQL) profesional untuk sistem RuLaFHub.
Pangkalan data menggunakan PostgreSQL (Supabase).

Akses jadual: 'markah_murid'
Lajur yang wujud:
- mykid (text)
- nama_murid (text)
- kelas_id (text) - Cth: '3 Murshid', '5 Murshid'
- kehadiran (numeric)
- hari_hadir (numeric)
- jumlah_hari_sekolah (numeric)
- markah_jawi (numeric)
- ujian_bertulis (numeric)
- bacaan_quran (text)
- hafazan (text)
- tahap_rulaf (text) - Nilai: 'RuLaF Alif', 'RuLaF Ba', 'RuLaF Ta', 'RuLaF Khas'
- bulan_tahun (text) - Cth: 'Ogos 2026', 'Mei 2026'

TUGASAN ANDA (WAJIB PATUH):
1. HANYA pulangkan kod SQL SELECT yang sah. DILARANG meletakkan penerangan, ulasan, atau blok markdown (\`\`\`sql).
2. JANGAN letak tanda koma bertitik (;) di hujung arahan SQL.
3. SENTIASA gunakan 'ILIKE' dengan wildcard (%) untuk carian teks seperti kelas_id, nama_murid, dan bulan_tahun (contoh: bulan_tahun ILIKE '%Mei%').
4. Jika diminta mengira jumlah atau pecahan, gunakan COUNT(*) dan GROUP BY.
`;

    // 4. Panggilan ke OpenRouter
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // 🔑 DIBAIKI: Format OpenRouter yang sah
      messages: [
        { role: 'system', content: skema_database.trim() },
        { role: 'user', content: soalanTeks.trim() }
      ],
      temperature: 0,
    });

    let arahan_sql = response.choices?.[0]?.message?.content?.trim() || '';

    // Pembersihan kod SQL
    arahan_sql = arahan_sql
      .replace(/```sql/gi, '')
      .replace(/```/g, '')
      .replace(/;/g, '')
      .trim();

    if (!arahan_sql.toUpperCase().startsWith('SELECT')) {
      return NextResponse.json(
        { error: 'AI gagal menjana arahan kueri SQL SELECT yang selamat.' },
        { status: 400 }
      );
    }

    // 5. Jalankan SQL ke Supabase via RPC 'execute_sql'
    const { data, error } = await supabase.rpc('execute_sql', { query: arahan_sql });

    if (error) {
      return NextResponse.json(
        { sql: arahan_sql, error: `Ralat Supabase RPC: ${error.message}` },
        { status: 400 }
      );
    }

    // 🔑 DIBAIKI: Pulangkan kunci 'data' dan 'results' agar serasi dengan frontend
    return NextResponse.json({
      sql: arahan_sql,
      data: data || [],
      results: data || []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ralat pelayan memproses permintaan AI.' },
      { status: 500 }
    );
  }
}