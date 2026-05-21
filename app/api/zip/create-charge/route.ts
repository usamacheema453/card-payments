import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { checkoutId, amount, orderReference } = await req.json();

  const payload = {
    authority: {
      type:  'checkout_id',
      value: checkoutId,              // the co_xxx from the redirect
    },
    reference: orderReference || `CHG-${Date.now()}`,
    amount:    amount,
    currency:  'AUD',
    capture:   true,                  // false = delayed capture (auth only)
  };

  const response = await fetch(`${process.env.ZIP_BASE_URL}/charges`, {
    method: 'POST',
    headers: {
      'Authorization':   `Bearer ${process.env.ZIP_SECRET_KEY}`,
      'Content-Type':    'application/json',
      'idempotency-key': checkoutId,  // safe to retry with same key
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  // data.state will be 'captured' on success
  return NextResponse.json(data);
}