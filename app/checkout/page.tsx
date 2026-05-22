'use client';

import { useState } from 'react';

const packages = [
  {
    id: 'basic',
    name: 'Basic Package',
    price: 20,
    description: 'Perfect for a quick mentor session.',
    itemName: 'Mentor Session Basic',
    reference: 'SKU-BASIC',
  },
  {
    id: 'premium',
    name: 'Premium Package',
    price: 50,
    description: 'Best for detailed career guidance.',
    itemName: 'Mentor Session Premium',
    reference: 'SKU-PREMIUM',
  },
];

type Package = (typeof packages)[number];

export default function CheckoutPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPopup(true);
  };

const handleZipPay = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!selectedPackage) return;

  try {
    setLoading(true);

    const orderReference = `ORD-${Date.now()}`;

    const res = await fetch('/api/zip/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderReference,
        amount: selectedPackage.price,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
        items: [
          {
            name: selectedPackage.itemName,
            amount: selectedPackage.price,
            quantity: 1,
            type: 'sku',
            reference: selectedPackage.reference,
          },
        ],
      }),
    });

    const { checkoutId, redirectUri, error } = await res.json();

    if (error) {
      console.error('Zip error:', error);
      return;
    }

    sessionStorage.setItem('zip_checkout_id', checkoutId);
    sessionStorage.setItem('zip_amount', String(selectedPackage.price));
    sessionStorage.setItem('zip_order_reference', orderReference);

    window.location.href = redirectUri;
  } catch (error) {
    console.error('Checkout error:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Choose Your Package</h1>

        <p style={styles.subheading}>
          Select a package first, then enter your details to continue with Zip.
        </p>

        <div style={styles.packageWrapper}>
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg)}
              style={styles.packageCard}
            >
              <h2 style={styles.packageTitle}>{pkg.name}</h2>
              <p style={styles.packageDescription}>{pkg.description}</p>
              <strong style={styles.price}>${pkg.price} AUD</strong>
            </button>
          ))}
        </div>
      </div>

      {showPopup && selectedPackage && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              style={styles.closeButton}
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>Enter Your Details</h2>

            <p style={styles.modalText}>
              Selected: <strong>{selectedPackage.name}</strong> — $
              {selectedPackage.price} AUD
            </p>

            <form onSubmit={handleZipPay} style={styles.form}>
              <input
                required
                type="text"
                placeholder="First name"
                value={customer.firstName}
                onChange={(e) =>
                  setCustomer({ ...customer, firstName: e.target.value })
                }
                style={styles.input}
              />

              <input
                required
                type="text"
                placeholder="Last name"
                value={customer.lastName}
                onChange={(e) =>
                  setCustomer({ ...customer, lastName: e.target.value })
                }
                style={styles.input}
              />

              <input
                required
                type="email"
                placeholder="Email address"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                style={styles.input}
              />

              <input
                required
                type="tel"
                placeholder="Phone number"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                style={styles.input}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.payButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? 'Processing...'
                  : `Continue to Zip — $${selectedPackage.price}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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
    maxWidth: '720px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
  },
  heading: {
    margin: 0,
    fontSize: '32px',
    color: '#111827',
  },
  subheading: {
    marginTop: '10px',
    color: '#6b7280',
    fontSize: '16px',
  },
  packageWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '28px',
  },
  packageCard: {
    textAlign: 'left',
    padding: '22px',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    background: '#ffffff',
    cursor: 'pointer',
  },
  packageTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#111827',
  },
  packageDescription: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  price: {
    display: 'block',
    marginTop: '18px',
    fontSize: '24px',
    color: '#6d28d9',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 50,
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    position: 'relative',
    boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
  },
  closeButton: {
    position: 'absolute',
    top: '14px',
    right: '18px',
    border: 'none',
    background: 'transparent',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#111827',
  },
  modalText: {
    marginTop: '10px',
    color: '#6b7280',
  },
  form: {
    marginTop: '22px',
    display: 'grid',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
  },
  payButton: {
    width: '100%',
    marginTop: '10px',
    padding: '15px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#6d28d9',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
  },
};