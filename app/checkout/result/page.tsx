'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResultPage() {
  const params       = useSearchParams();
  const result       = params.get('result');       // Approved | Declined | Referred
  const checkoutId   = params.get('checkoutId');   // co_xxxxxxxx
  const [status, setStatus] = useState('Processing...');

  console.log("checkout result", result);

useEffect(() => {
  if (result?.toLowerCase() === 'approved' && checkoutId) {
    fetch('/api/zip/create-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId, amount: 99.95 }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Charge response:', data);
        if (data.state === 'captured') {
          setStatus('✅ Payment Successful!');
        } else {
          setStatus(`Payment state: ${data.state}`);
        }
      });

  } else if (result?.toLowerCase() === 'declined') {
    setStatus('❌ Payment Declined.');
  } else if (result?.toLowerCase() === 'referred') {
    setStatus('⏳ Payment Referred.');
  }
}, [result, checkoutId]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{status}</h1>
      <p>Checkout ID: {checkoutId}</p>
    </div>
  );
}