import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { ADMIN_API_URL } from '../utils/api';

const metricCards = [
  { key: 'totalUsers', label: 'Users' },
  { key: 'totalVendors', label: 'Vendors' },
  { key: 'totalOrders', label: 'Orders' },
  { key: 'totalCategories', label: 'Categories' },
];

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({ metrics: {}, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/dashboard`);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    fetchDashboard();
  }, [fetchDashboard, token]);

  return (
    <AdminLayout title="Dashboard" subtitle="Basic analytics and the latest order flow across the platform.">
      {loading ? <div style={styles.empty}>Loading dashboard...</div> : (
        <>
          <div style={styles.metricsGrid}>
            {metricCards.map((card) => (
              <div key={card.key} style={styles.metricCard}>
                <div style={styles.metricLabel}>{card.label}</div>
                <div style={styles.metricValue}>{data.metrics?.[card.key] || 0}</div>
              </div>
            ))}
            <div style={{ ...styles.metricCard, ...styles.metricCardAccent }}>
              <div style={styles.metricLabel}>Total Revenue</div>
              <div style={styles.metricValue}>Rs {Number(data.metrics?.monthlyRevenue || 0).toFixed(2)}</div>
            </div>
          </div>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Orders</h2>
              <span style={styles.panelMeta}>{data.recentOrders?.length || 0} items</span>
            </div>
            {data.recentOrders?.length ? (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Vendor</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={styles.td}>#{order.id}</td>
                        <td style={styles.td}>{order.userName}</td>
                        <td style={styles.td}>{order.vendorName}</td>
                        <td style={styles.td}>{order.status}</td>
                        <td style={styles.td}>Rs {Number(order.totalAmount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div style={styles.empty}>No recent orders available.</div>}
          </section>
        </>
      )}
    </AdminLayout>
  );
};

const styles = {
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  metricCard: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '18px' },
  metricCardAccent: { background: '#fff5f5', borderColor: '#ffd9d9' },
  metricLabel: { color: '#6c6c6c', fontSize: '13px', fontWeight: '600' },
  metricValue: { color: '#1d1b20', fontSize: '28px', fontWeight: '700', marginTop: '12px' },
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  panelTitle: { margin: 0, fontSize: '18px', color: '#1d1b20' },
  panelMeta: { color: '#6c6c6c', fontSize: '12px', fontWeight: '700' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', color: '#6c6c6c', padding: '12px', borderBottom: '1px solid #e0e0e0' },
  td: { fontSize: '14px', color: '#1d1b20', padding: '12px', borderBottom: '1px solid #f2f2f2' },
  empty: { background: '#fff', border: '1px dashed #e0e0e0', borderRadius: '16px', padding: '28px', color: '#6c6c6c', textAlign: 'center' },
};

export default Dashboard;
