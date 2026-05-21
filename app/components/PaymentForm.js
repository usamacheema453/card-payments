'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import styles from './PaymentForm.module.css';

export default function PaymentForm({ finalPrice, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // Step 1: Submit elements first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    // Step 2: Create Payment Method manually
    // ✅ paymentMethodCreation: 'manual' set hone ki wajah se ab yeh kaam karega
    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
      elements,
    });
    if (pmError) {
      setError(pmError.message);
      setLoading(false);
      return;
    }

    // Step 3: Credit card check
    if (paymentMethod.card.funding !== 'credit') {
      setError('❌ Only Credit Cards are allowed. Please use a Credit Card.');
      setLoading(false);
      return;
    }

    // Step 4: Confirm payment with paymentMethod.id directly
    const { error: confirmError } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/payment/success',
        payment_method: paymentMethod.id,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }

    // ✅ Success
    router.push('/payment/success');
  }

  return (
    <div>
      <PaymentElement
        options={{ wallets: { applePay: 'never', googlePay: 'never' } }}
      />

      <button
        className={styles.payBtn}
        onClick={handleSubmit}
        disabled={loading || !stripe}
      >
        {loading ? (
          <span className={styles.spinner} />
        ) : (
          `Pay $${finalPrice?.toFixed(2)} →`
        )}
      </button>

      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  );
}