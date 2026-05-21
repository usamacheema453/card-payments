import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderReference, amount, customer } = body;

  const payload = {
    shopper: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      billing_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        line1: customer.address,
        city: customer.city,
        state: customer.state,
        postal_code: customer.postcode,
        country: 'AU',                    // or 'NZ'
      },
    },
    order: {
      reference: orderReference,
      amount: amount,                     // in dollars e.g. 99.95
      currency: 'AUD',                    // or 'NZD'
      items: body.items,                  // cart items array
      shipping: {
        pickup: false,
        address: {
          line1: customer.address,
          city: customer.city,
          state: customer.state,
          postal_code: customer.postcode,
          country: 'AU',
        },
      },
    },
    config: {
      // Zip redirects here after customer approves/declines
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/result`,
    },
  };

  const response = await fetch(`${process.env.ZIP_BASE_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZIP_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'idempotency-key': orderReference,   // unique per request
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  // Return the checkout id and redirect uri to the frontend
  return NextResponse.json({
    checkoutId: data.id,
    redirectUri: data.uri,
  });
}