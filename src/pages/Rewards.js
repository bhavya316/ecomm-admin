import React from 'react';
import AdminLayout from '../components/AdminLayout';

const Rewards = () => (
  <AdminLayout title="Rewards" subtitle="Static placeholder until reward rules and backend integration are finalized.">
    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.label}>Status</div>
        <div style={styles.title}>Pending Integration</div>
        <p style={styles.text}>Reward ledger, redemption rules, and campaign controls will be added once product requirements are finalized.</p>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Planned</div>
        <div style={styles.title}>Points, tiers, redemptions</div>
        <p style={styles.text}>This space is reserved for points summary cards, claim queues, and reward usage reports.</p>
      </div>
    </div>
  </AdminLayout>
);

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '22px' },
  label: { color: '#cc0001', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  title: { color: '#1d1b20', fontSize: '22px', fontWeight: '700', marginTop: '12px' },
  text: { color: '#6c6c6c', fontSize: '14px', lineHeight: 1.6, margin: '10px 0 0' },
};

export default Rewards;
