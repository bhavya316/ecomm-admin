import React from 'react';
import AdminLayout from '../components/AdminLayout';

const Referrals = () => (
  <AdminLayout title="Referrals" subtitle="Static placeholder until referral tracking rules and schemas are confirmed.">
    <div style={styles.panel}>
      <div style={styles.label}>Tracking Pending</div>
      <h2 style={styles.title}>Referral analytics will live here</h2>
      <p style={styles.text}>Once referral codes, attribution rules, and payout logic are defined, this page can show invite performance, successful conversions, and source-wise referral tracking.</p>
      <div style={styles.placeholderRow}>
        <div style={styles.metricBox}>Invites Sent</div>
        <div style={styles.metricBox}>Successful Signups</div>
        <div style={styles.metricBox}>Conversion Rate</div>
      </div>
    </div>
  </AdminLayout>
);

const styles = {
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '18px', padding: '24px' },
  label: { color: '#cc0001', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  title: { color: '#1d1b20', fontSize: '24px', margin: '12px 0 10px' },
  text: { color: '#6c6c6c', fontSize: '14px', lineHeight: 1.6, maxWidth: '760px' },
  placeholderRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginTop: '22px' },
  metricBox: { padding: '18px', borderRadius: '14px', background: '#fff5f5', color: '#cc0001', fontWeight: '700', textAlign: 'center' },
};

export default Referrals;
