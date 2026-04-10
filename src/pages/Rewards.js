import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ credited: 0, skipped: 0, pending: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRewards();
  }, [currentPage]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/referrals/rewards?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRewards(response.data.rewards || []);
      
      const credited = (response.data.rewards || []).filter(r => r.status === 'credited').length;
      const skipped = (response.data.rewards || []).filter(r => r.status === 'skipped').length;
      const pending = (response.data.rewards || []).filter(r => r.status === 'pending').length;
      setStats({ credited, skipped, pending });
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPending = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_URL}/admin/rewards/process-pending`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRewards();
      alert('Pending rewards processed successfully!');
    } catch (error) {
      console.error('Error processing rewards:', error);
      alert('Failed to process rewards');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout title="Rewards" subtitle="Referral reward distribution">
      <div style={styles.container}>
        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderLeft: '4px solid #22c55e'}}>
            <div style={styles.statLabel}>Credited</div>
            <div style={styles.statValue}>{stats.credited}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #ef4444'}}>
            <div style={styles.statLabel}>Skipped</div>
            <div style={styles.statValue}>{stats.skipped}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
            <div style={styles.statLabel}>Pending</div>
            <div style={styles.statValue}>{stats.pending}</div>
          </div>
        </div>

        {/* Action Button */}
        <div style={styles.actionRow}>
          <button 
            style={processPendingBtn} 
            onClick={handleProcessPending}
            disabled={processing || stats.pending === 0}
          >
            {processing ? 'Processing...' : 'Process Pending Rewards'}
          </button>
        </div>

        {/* Rewards Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Loading rewards...</div>
          ) : rewards.length === 0 ? (
            <div style={styles.empty}>No rewards found</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Recipient</th>
                  <th style={styles.th}>Source User</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>IDs</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Week</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => (
                  <tr key={reward.id} style={styles.tr}>
                    <td style={styles.td}>{reward.id}</td>
                    <td style={styles.td}>{reward.recipientName || '-'}</td>
                    <td style={styles.td}>{reward.sourceName || '-'}</td>
                    <td style={styles.td}>₹{Number(reward.amount || 0).toFixed(4)}</td>
                    <td style={styles.td}>{reward.idsCount}</td>
                    <td style={styles.td}>{reward.type}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: reward.status === 'credited' ? '#dcfce7' : 
                                        reward.status === 'skipped' ? '#fee2e2' : '#fef3c7',
                        color: reward.status === 'credited' ? '#166534' : 
                               reward.status === 'skipped' ? '#991b1b' : '#92400e'
                      }}>
                        {reward.status}
                      </span>
                    </td>
                    <td style={styles.td}>{reward.weekNumber}</td>
                    <td style={styles.td}>{reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {stats.totalPages > 1 && (
          <div style={styles.pagination}>
            <button 
              style={pageBtn} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>Page {currentPage} of {stats.totalPages || 1}</span>
            <button 
              style={pageBtn} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  actionRow: {
    marginBottom: '20px',
    textAlign: 'right',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    background: '#f9fafb',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#374151',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
    padding: '20px',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

const processPendingBtn = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const pageBtn = {
  background: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
};

export default Rewards;
