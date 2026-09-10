import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Ambil kunci secara eksklusif daripada Environment Variables pelayan
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rulaf-web.vercel.app';

    // 2. Sekatan Keselamatan: Halang proses jika konfigurasi pelayan tidak lengkap
    if (!secretKey || !categoryCode) {
      console.error('❌ [KESELAMATAN] Kunci TOYYIBPAY_SECRET_KEY atau TOYYIBPAY_CATEGORY_CODE tiada dalam Environment Variables!');
      return NextResponse.json(
        { error: 'Gerbang pembayaran sedang diselenggara. Sila hubungi pihak pentadbir.' },
        { status: 500 }
      );
    }

    const { nama, emel, telefon, jumlah, doa } = await request.json();

    // 3. Pengesahan Had Sumbangan
    const jumlahNum = parseFloat(jumlah);
    if (isNaN(jumlahNum) || jumlahNum < 2) {
      return NextResponse.json(
        { error: 'Jumlah minimum sumbangan adalah RM 2.00' },
        { status: 400 }
      );
    }

    // ToyyibPay memerlukan nilai dalam unit SEN (Contoh: RM 10.00 = 1000 sen)
    const amountInCents = Math.round(jumlahNum * 100);

    // 4. Sediakan Payload Rasmi ke ToyyibPay
    const formData = new URLSearchParams();
    formData.append('userSecretKey', secretKey.trim());
    formData.append('categoryCode', categoryCode.trim());
    formData.append('billName', 'Dana Inovasi RuLaFHub');
    formData.append('billDescription', doa ? String(doa).slice(0, 100) : 'Tajaan Kad NFC & Operasi RuLaFHub');
    formData.append('billPriceSetting', '1'); // 1 = Nilai Bil Tetap
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', amountInCents.toString());
    formData.append('billReturnUrl', `${baseUrl}/dana?status=success`);
    formData.append('billCallbackUrl', `${baseUrl}/api/derma/callback`);
    formData.append('billExternalReferenceNo', `RULAF-${Date.now()}`);
    formData.append('billTo', nama ? String(nama).trim() : 'Hamba Allah');
    formData.append('billEmail', emel ? String(emel).trim() : 'penyumbang@rulafhub.com');
    formData.append('billPhone', telefon ? String(telefon).trim() : '0123456789');

    // 5. Panggilan API ke Pelayan ToyyibPay
    const toyyibRes = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await toyyibRes.json();

    // 6. Pengesahan Kod Bil Berjaya
    if (Array.isArray(data) && data[0]?.BillCode) {
      const billCode = data[0].BillCode;
      return NextResponse.json({ url: `https://toyyibpay.com/${billCode}` });
    } else {
      const ralatToyyib = Array.isArray(data) && data[0]?.msg ? data[0].msg : 'Gagal menjana bil pembayaran.';
      console.error('❌ [ToyyibPay Error]:', data);
      return NextResponse.json({ error: ralatToyyib }, { status: 502 });
    }
  } catch (error: any) {
    console.error('❌ [Server Error]:', error);
    return NextResponse.json({ error: 'Ralat dalaman pelayan: ' + error.message }, { status: 500 });
  }
}