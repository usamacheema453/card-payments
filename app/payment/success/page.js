import Link from 'next/link';
import styles from './success.module.css';

export default function SuccessPage() {
  return (
    <main className={styles.main}>
      <div className={styles.ring}>
        <div className={styles.icon}>✓</div>
      </div>
      <h2 className={styles.title}>Payment <span>Successful!</span></h2>
      <p className={styles.desc}>Your payment has been processed successfully. Thank you!</p>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Status</span>
          <span className={`${styles.value} ${styles.green}`}>✓ Approved</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Card Type</span>
          <span className={styles.value}>Credit Card</span>
        </div>
      </div>
      <Link href="/" className={styles.homeBtn}>← Back to Home</Link>
    </main>
  );
}