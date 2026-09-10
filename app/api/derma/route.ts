import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rulaf-web.vercel.app';

    if (!secretKey || !categoryCode) {
      return NextResponse.json(
        { error: 'Kunci ToyyibPay belum ditetapkan atau Vercel belum di-Redeploy!' },
        { status: 500 }
      );
    }

    const { nama, emel, telefon, jumlah, doa } = await request.json();

    const jumlahNum = parseFloat(jumlah);
    if (isNaN(jumlahNum) || jumlahNum < 2) {
      return NextResponse.json(
        { error: 'Jumlah minimum sumbangan adalah RM 2.00' },
        { status: 400 }
      );
    }

    // ToyyibPay memerlukan nilai dalam unit SEN (RM 10 = 1000)
    const amountInCents = Math.round(jumlahNum * 100);

    // 🧹 PEMBERSIHAN KHAS TOYYIBPAY (Hapus simbol khas seperti &, @, #, etc)
    const sanitizeText = (txt: string, maxLen: number) => {
      return txt
        .replace(/&/g, 'dan') // Tukar & kepada dan
        .replace(/[^a-zA-Z0-9 ]/g, '') // Buang semua simbol pelik
        .trim()
        .slice(0, maxLen);
    };

    const tajukBil = 'Dana Inovasi RuLaFHub';
    const huraianBil = doa 
      ? sanitizeText(doa, 100) 
      : 'Tajaan Kad NFC dan Operasi RuLaFHub';
    const namaBersih = nama ? sanitizeText(nama, 50) : 'Hamba Allah';

    const formData = new URLSearchParams();
    formData.append('userSecretKey', secretKey.trim());
    formData.append('categoryCode', categoryCode.trim());
    formData.append('billName', tajukBil);
    formData.append('billDescription', huraianBil || 'Tajaan Dana RuLaFHub');
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', amountInCents.toString());
    formData.append('billReturnUrl', `${baseUrl}/dana?status=success`);
    formData.append('billCallbackUrl', `${baseUrl}/api/derma/callback`);
    formData.append('billExternalReferenceNo', `RULAF-${Date.now()}`);
    formData.append('billTo', namaBersih || 'Penyumbang');
    formData.append('billEmail', emel ? String(emel).trim() : 'penyumbang@rulafhub.com');
    formData.append('billPhone', telefon ? String(telefon).trim() : '0123456789');

    // Hantar ke ToyyibPay Production
    const toyyibRes = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await toyyibRes.json();

    if (Array.isArray(data) && data[0]?.BillCode) {
      const billCode = data[0].BillCode;
      return NextResponse.json({ url: `https://toyyibpay.com/${billCode}` });
    } else {
      const ralatToyyib = Array.isArray(data) && data[0]?.msg ? data[0].msg : 'Gagal menjana bil ToyyibPay.';
      console.error('❌ Ralat ToyyibPay:', data);
      return NextResponse.json({ error: ralatToyyib }, { status: 502 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Ralat pelayan: ' + error.message }, { status: 500 });
  }
}