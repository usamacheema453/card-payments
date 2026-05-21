'use client';

export default function CheckoutPage() {
  
  const handleZipPay = async () => {
    const res = await fetch('/api/zip/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderReference: `ORD-${Date.now()}`,
        amount: 99.95,
        customer: {
          firstName: 'Hello',
          lastName:  'Smith',
          email:     'johntest@test.com',
          phone:     '0400000000',
          address:   '10 Spring St',
          city:      'Sydney',
          state:     'NSW',
          postcode:  '2000',
        },
        items: [
          {
            name:      'Mentor Session 1',
            amount:    99.95,
            quantity:  1,
            type:      'sku',
            reference: 'SKU-001',
          },
        ],
      }),
    });

    const { checkoutId, redirectUri, error } = await res.json();

    if (error) {
      console.error('Zip error:', error);
      return;
    }

    // Save checkoutId in session/localStorage to use after redirect
    sessionStorage.setItem('zip_checkout_id', checkoutId);

    // ✅ Full page redirect to Zip's hosted checkout — no popup needed
    window.location.href = redirectUri;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Checkout — $99.95 AUD</h1>
      <button onClick={handleZipPay} style={{ padding: '12px 24px', fontSize: '16px' }}>
        Pay with Zip
      </button>
    </div>
  );
}