import { NextResponse } from 'next/server';

const PACKAGES = {
  basic: { name: 'Basic Plan', price: 14.00 },
  pro:   { name: 'Pro Plan',   price: 17.00 },
};

const DISCOUNT_CODES = {
  'SAVE10': 10,
  'SAVE20': 20,
};

export async function POST(req) {
  const { code, packageId } = await req.json();

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  const discount = DISCOUNT_CODES[code?.toUpperCase()];
  if (!discount) {
    return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 });
  }

  const discountAmount = (pkg.price * discount) / 100;
  const finalPrice = pkg.price - discountAmount;

  return NextResponse.json({
    valid: true,
    discountPercent: discount,
    originalPrice: pkg.price,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
  });
}