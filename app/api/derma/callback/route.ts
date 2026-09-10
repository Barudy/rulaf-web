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

    if (status === '1') {
      const { data: sediaAda } = await supabaseAdmin
        .from('rulaf_kewangan')
        .select('id')
        .eq('ref_no', refno)
        .maybeSingle();

      if (!sediaAda) {
        const tarikhKini = new Date().toISOString().split('T')[0];

        // 💥 Suntik Rekod Sumbangan & Potongan RM1.00 Serentak
        const { error: ralatInsert } = await supabaseAdmin.from('rulaf_kewangan').insert([
          // Rekod 1: Duit Masuk (Gross)
          {
            tarikh: tarikhKini,
            jenis: 'masuk',
            kategori: 'Sumbangan Komuniti (FPX)',
            butiran: `Sumbangan FPX melalui ToyyibPay (Bil: ${billcode})`,
            jumlah: parseFloat(amount),
            penyumbang_atau_penerima: 'Hamba Allah',
            ref_no: refno,
            status: 'selesai'
          },
          // Rekod 2: Duit Keluar Automatik (Caj Gerbang FPX ToyyibPay)
          {
            tarikh: tarikhKini,
            jenis: 'keluar',
            kategori: 'Caj Gerbang Pembayaran',
            butiran: `Caj transaksi gerbang pembayaran FPX ToyyibPay (Ref: ${refno})`,
            jumlah: 1.00,
            penyumbang_atau_penerima: 'ToyyibPay / PayNet',
            ref_no: `FEE-${refno}`,
            status: 'selesai'
          }
        ]);

        if (ralatInsert) {
          console.error('❌ Gagal simpan lejar:', ralatInsert.message);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}