'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type PaymentStatus = 'processing' | 'success' | 'declined' | 'referred' | 'failed';

export default function ResultPage() {
  const params = useSearchParams();

  const result = params.get('result');
  const checkoutId = params.get('checkoutId');

  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [message, setMessage] = useState('We are confirming your payment...');
  const [chargeState, setChargeState] = useState<string | null>(null);

  useEffect(() => {
    if (result?.toLowerCase() === 'approved' && checkoutId) {
  const amount = sessionStorage.getItem('zip_amount');
  const orderReference = sessionStorage.getItem('zip_order_reference');

  fetch('/api/zip/create-charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      checkoutId,
      amount: Number(amount),
      orderReference,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('Charge response:', data);

      setChargeState(data.state);

      if (data.state === 'captured') {
        setStatus('success');
        setMessage('Your payment has been successfully completed.');
      } else {
        setStatus('failed');
        setMessage(`Payment state: ${data.state || 'Unknown'}`);
      }
    })
    .catch((error) => {
      console.error('Charge error:', error);
      setStatus('failed');
      setMessage('Something went wrong while confirming your payment.');
    });
} else if (result?.toLowerCase() === 'declined') {
      setStatus('declined');
      setMessage('Your payment was declined. Please try again.');
    } else if (result?.toLowerCase() === 'referred') {
      setStatus('referred');
      setMessage('Your payment has been referred for further review.');
    } else {
      setStatus('failed');
      setMessage('Invalid or missing payment response.');
    }
  }, [result, checkoutId]);

  const ui = getStatusUI(status);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div
          style={{
            ...styles.iconBox,
            background: ui.bg,
            color: ui.color,
          }}
        >
          {ui.icon}
        </div>

        <h1 style={styles.heading}>{ui.title}</h1>

        <p style={styles.message}>{message}</p>

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span>Checkout ID</span>
            <strong>{checkoutId || 'N/A'}</strong>
          </div>

          <div style={styles.infoRow}>
            <span>Result</span>
            <strong>{result || 'N/A'}</strong>
          </div>

          {chargeState && (
            <div style={styles.infoRow}>
              <span>Charge State</span>
              <strong>{chargeState}</strong>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => (window.location.href = '/checkout')}
          style={styles.button}
        >
          Back to Checkout
        </button>
      </div>
    </div>
  );
}

function getStatusUI(status: PaymentStatus) {
  switch (status) {
    case 'success':
      return {
        icon: '✓',
        title: 'Payment Successful',
        bg: '#dcfce7',
        color: '#16a34a',
      };

    case 'declined':
      return {
        icon: '×',
        title: 'Payment Declined',
        bg: '#fee2e2',
        color: '#dc2626',
      };

    case 'referred':
      return {
        icon: '!',
        title: 'Payment Referred',
        bg: '#fef3c7',
        color: '#d97706',
      };

    case 'failed':
      return {
        icon: '×',
        title: 'Payment Failed',
        bg: '#fee2e2',
        color: '#dc2626',
      };

    default:
      return {
        icon: '...',
        title: 'Processing Payment',
        bg: '#ede9fe',
        color: '#6d28d9',
      };
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f3ff, #ffffff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '36px',
    textAlign: 'center',
    boxShadow: '0 24px 70px rgba(0,0,0,0.10)',
  },
  iconBox: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    margin: '0 auto 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 800,
  },
  heading: {
    margin: 0,
    fontSize: '30px',
    color: '#111827',
  },
  message: {
    marginTop: '12px',
    color: '#6b7280',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  infoBox: {
    marginTop: '26px',
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '16px',
    display: 'grid',
    gap: '12px',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    color: '#4b5563',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    marginTop: '24px',
    padding: '14px 22px',
    borderRadius: '12px',
    border: 'none',
    background: '#6d28d9',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};