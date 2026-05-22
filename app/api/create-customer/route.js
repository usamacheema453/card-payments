import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { paymentIntentId, paymentMethodId, email, name } = await req.json();

  try {
    // Step 1: Customer banao
    const customer = await stripe.customers.create({
      email,
      name,
      payment_method: paymentMethodId,   // ✅ card customer se attach
      invoice_settings: {
        default_payment_method: paymentMethodId,  // ✅ default card set
      },
    });

    // Step 2: PaymentIntent ko customer se link karo
    await stripe.paymentIntents.update(paymentIntentId, {
      customer: customer.id,
    });

    return NextResponse.json({
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      paymentMethodId: paymentMethodId,
      created: customer.created,
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}