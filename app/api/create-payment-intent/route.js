import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGES = {
  basic: { name: 'Basic Plan', price: 14.00 },
  pro:   { name: 'Pro Plan',   price: 17.00 },
};

const DISCOUNT_CODES = {
  'SAVE10': 10,
  'SAVE20': 20,
};

export async function POST(req) {
  const { packageId, couponCode, email, name } = await req.json();

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  let finalPrice = pkg.price;
  let discountPercent = 0;

  if (couponCode) {
    const discount = DISCOUNT_CODES[couponCode.toUpperCase()];
    if (discount) {
      discountPercent = discount;
      finalPrice = finalPrice - (finalPrice * discount) / 100;
    }
  }

  const amountInCents = Math.round(finalPrice * 100);

  try {
    // ✅ Step 1: Pehle Customer banao — exactly Laravel jaisa
    const customer = await stripe.customers.create({
      email: email ?? null,
      name: name ?? null,
    });

    // ✅ Step 2: Payment Intent banao customer ke saath — exactly Laravel jaisa
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      customer: customer.id,                // ✅ customer link
      setup_future_usage: 'off_session',    // ✅ card future use k liye save
      metadata: {
        packageId,
        packageName: pkg.name,
        originalPrice: pkg.price,
        discountPercent,
        finalPrice: finalPrice.toFixed(2),
        customerId: customer.id,
      },
    });
    console.log("customer:", customer);

    // ✅ Step 3: Customer details bhi return karo
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}