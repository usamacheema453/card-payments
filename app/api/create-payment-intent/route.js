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
  const { packageId, couponCode } = await req.json();

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        packageId,
        packageName: pkg.name,
        originalPrice: pkg.price,
        discountPercent,
        finalPrice: finalPrice.toFixed(2),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}