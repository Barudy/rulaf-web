import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Menggunakan Service Role Key untuk akses tulis automatik dari webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const refno = formData.get('refno') as string;
    const status = formData.get('status') as string; // '1' bermaksud Berjaya
    const billcode = formData.get('billcode') as string;
    const amount = formData.get('amount') as string; // Dalam nilai RM

    if (status === '1') {
      // Semak jika rekod ini sudah didaftarkan (elak rekod berganda)
      const { data: existing } = await supabaseAdmin
        .from('rulaf_kewangan')
        .select('id')
        .eq('ref_no', refno)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from('rulaf_kewangan').insert([
          {
            tarikh: new Date().toISOString().split('T')[0],
            jenis: 'masuk',
            kategori: 'Sumbangan Komuniti (FPX)',
            butiran: `Sumbangan FPX melalui ToyyibPay (Bil: ${billcode})`,
            jumlah: parseFloat(amount),
            penyumbang_atau_penerima: 'Hamba Allah',
            ref_no: refno,
            status: 'selesai'
          }
        ]);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}