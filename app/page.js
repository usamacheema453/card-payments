'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './components/PaymentForm';
import styles from './page.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PACKAGES = [
  { id: 'basic', label: 'Starter', name: 'Basic Plan', price: 14 },
  { id: 'pro',   label: 'Popular', name: 'Pro Plan',   price: 17 },
];

export default function Home() {
  // ✅ FIX: Single state object to prevent double re-render (removeChild error)
  const [paymentState, setPaymentState] = useState({ step: 'landing', clientSecret: null });
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const { step, clientSecret } = paymentState;
  const finalPrice = discount ? discount.finalPrice : selectedPkg?.price ?? null;

  // ---- Package Select ----
  function selectPackage(pkg) {
    setSelectedPkg(pkg);
    setDiscount(null);
    setCouponInput('');
    setCouponMsg(null);
  }

  // ---- Apply Coupon ----
  async function applyCoupon() {
    if (!couponInput.trim() || !selectedPkg) return;
    setApplyLoading(true);
    setCouponMsg(null);

    const res = await fetch('/api/verify-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponInput, packageId: selectedPkg.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      setCouponMsg({ text: '❌ ' + data.error, type: 'error' });
      setDiscount(null);
    } else {
      setCouponMsg({ text: `✅ ${data.discountPercent}% discount applied!`, type: 'success' });
      setDiscount(data);
    }

    setApplyLoading(false);
  }

  // ---- Go To Payment ----
  async function goToPayment() {
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: selectedPkg.id,
        couponCode: discount ? couponInput : null,
      }),
    });

    const data = await res.json();
    console.log("data", data.clientSecret);
    if (data.clientSecret) {
      // ✅ FIX: Both values set in ONE update — no double re-render
      setPaymentState({ step: 'payment', clientSecret: data.clientSecret });
    }
  }

  // ---- LANDING ----
  if (step === 'landing') {
    return (
      <main className={styles.landing}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Secure Checkout · Stripe Powered
        </div>

        <h1 className={styles.title}>Choose Your <em>Plan</em></h1>
        <p className={styles.sub}>Select a package, apply a discount, and pay securely with your credit card.</p>

        {/* Packages */}
        <div className={styles.packages}>
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`${styles.pkgCard} ${selectedPkg?.id === pkg.id ? styles.selected : ''}`}
              onClick={() => selectPackage(pkg)}
            >
              {selectedPkg?.id === pkg.id && <div className={styles.checkMark}>✓</div>}
              <div className={styles.pkgBadge}>{pkg.label}</div>
              <div className={styles.pkgName}>{pkg.name}</div>
              <div className={styles.pkgPrice}>${pkg.prie}</div>
              <div className={styles.pkgDesc}>
                {pkg.id === 'basic' ? 'Great for individuals just getting started.' : 'Best for professionals and power users.'}
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className={styles.couponWrap}>
          <input
            className={styles.couponInput}
            type="text"
            placeholder="Discount code (optional)"
            value={couponInput}
            onChange={e => setCouponInput(e.target.value)}
          />
          <button
            className={styles.applyBtn}
            onClick={applyCoupon}
            disabled={!selectedPkg || applyLoading}
          >
            {applyLoading ? '...' : 'Apply'}
          </button>
        </div>

        {couponMsg && (
          <p className={`${styles.couponMsg} ${couponMsg.type === 'error' ? styles.error : styles.successText}`}>
            {couponMsg.text}
          </p>
        )}

        {/* Price Summary */}
        {selectedPkg && (
          <div className={styles.priceSummary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Package</span>
              <span className={styles.summaryValue}>{selectedPkg.name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Original Price</span>
              <span className={styles.summaryValue}>${selectedPkg.price.toFixed(2)}</span>
            </div>
            {discount && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Discount</span>
                <span className={`${styles.summaryValue} ${styles.discountVal}`}>
                  -${discount.discountAmount.toFixed(2)} ({discount.discountPercent}% off)
                </span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={`${styles.summaryValue} ${styles.totalVal}`}>${finalPrice?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          className={styles.ctaBtn}
          disabled={!selectedPkg}
          onClick={goToPayment}
        >
          {selectedPkg ? `Proceed to Pay $${finalPrice?.toFixed(2)}` : 'Select a Package'}{' '}
          <span className={styles.arrow}>→</span>
        </button>

        <p className={styles.trustNote}>🛡️ Payments are secure and encrypted</p>
      </main>
    );
  }

  // ---- PAYMENT ----
  return (
    <main className={styles.paymentPage}>
      <div className={styles.paymentCard}>
        <div className={styles.paymentHeader}>
          {/* ✅ FIX: Back button also uses single state update */}
          <button className={styles.backBtn} onClick={() => setPaymentState({ step: 'landing', clientSecret: null })}>←</button>
          <div>
            <div className={styles.paymentTitle}>Complete Payment</div>
            <div className={styles.paymentSubtitle}>Credit Card only · Secured by Stripe</div>
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Package</span>
            <span className={styles.orderValue}>{selectedPkg?.name}</span>
          </div>
          {discount && (
            <div className={styles.orderRow}>
              <span className={styles.orderLabel}>Discount</span>
              <span className={`${styles.orderValue} ${styles.green}`}>-${discount.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Total</span>
            <span className={styles.orderTotal}>${finalPrice?.toFixed(2)}</span>
          </div>
        </div>

        {/* Stripe Form */}
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              paymentMethodCreation: 'manual',  // ✅ yeh add karo
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#7c6aff',
                  colorBackground: '#1c1c27',
                  colorText: '#f0f0f8',
                  colorDanger: '#ff7b7b',
                  fontFamily: 'DM Sans, sans-serif',
                  borderRadius: '10px',
                },
              },
            }}
          >
            <PaymentForm finalPrice={finalPrice} clientSecret={clientSecret} />
          </Elements>
        )}
      </div>
    </main>
  );
}