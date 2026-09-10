import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const refno = (formData.get('refno') as string) || '';
    const status = (formData.get('status') as string) || ''; // '1' = Berjaya
    const billcode = (formData.get('billcode') as string) || '';
    const amount = (formData.get('amount') as string) || '0';

    console.log('🔔 [TOYYIBPAY CALLBACK DITERIMA]:', { refno, status, billcode, amount });

    if (status === '1') {
      // Semak jika transaksi ini telah sedia direkodkan
      const { data: sediaAda } = await supabaseAdmin
        .from('rulaf_kewangan')
        .select('id')
        .eq('ref_no', refno)
        .maybeSingle();

      if (!sediaAda) {
        const { error: ralatInsert } = await supabaseAdmin.from('rulaf_kewangan').insert([
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

        if (ralatInsert) {
          console.error('❌ Gagal simpan ke Supabase:', ralatInsert.message);
        } else {
          console.log('✅ Sumbangan berjaya direkodkan ke Supabase!');
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    console.error('❌ Ralat Callback:', err.message);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}