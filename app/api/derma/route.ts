import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nama, emel, telefon, jumlah, doa } = await request.json();

    if (!jumlah || jumlah < 2) {
      return NextResponse.json({ error: 'Jumlah minimum sumbangan adalah RM 2.00' }, { status: 400 });
    }

    // Tukar RM kepada sen (ToyyibPay menggunakan unit SEN: RM 10 = 1000)
    const amountInCents = Math.round(Number(jumlah) * 100);

    // Dapatkan pemboleh ubah persekitaran
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY || 'MASUKKAN_SECRET_KEY_ANDA';
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE || 'MASUKKAN_CATEGORY_CODE_ANDA';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rulaf-web.vercel.app';

    const formData = new URLSearchParams();
    formData.append('userSecretKey', secretKey);
    formData.append('categoryCode', categoryCode);
    formData.append('billName', 'Dana Inovasi RuLaFHub');
    formData.append('billDescription', doa || 'Tajaan Kad NFC & Penyelenggaraan Pelayan RuLaFHub');
    formData.append('billPriceSetting', '1'); // Tetapan harga tetap
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', amountInCents.toString());
    formData.append('billReturnUrl', `${baseUrl}/dana?status=success`);
    formData.append('billCallbackUrl', `${baseUrl}/api/derma/callback`);
    formData.append('billExternalReferenceNo', `RULAF-${Date.now()}`);
    formData.append('billTo', nama || 'Hamba Allah');
    formData.append('billEmail', emel || 'penyumbang@rulafhub.com');
    formData.append('billPhone', telefon || '0123456789');

    // Hantar permohonan bil ke ToyyibPay
    const toyyibRes = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await toyyibRes.json();

    if (data && data[0] && data[0].BillCode) {
      const billCode = data[0].BillCode;
      return NextResponse.json({ url: `https://toyyibpay.com/${billCode}` });
    } else {
      return NextResponse.json({ error: 'Gagal menjana bil ToyyibPay.' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}