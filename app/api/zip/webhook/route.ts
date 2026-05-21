import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log('📦 Zip AU Webhook received:', data);

  if (data.state === 'Approved') {
    console.log(`✅ Order ${data.merchantReference} approved! Checkout ID: ${data.id}`);
    // TODO: Update order status in your DB to 'paid'
  }

  return NextResponse.json({ received: true }, { status: 200 });
}