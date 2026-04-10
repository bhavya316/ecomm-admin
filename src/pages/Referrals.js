import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { ADMIN_API_URL } from '../utils/api';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tree', label: 'Referral Tree' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'ids', label: 'IDs' },
  { id: 'rewards', label: 'Rewards' },
];

const Referrals = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    idsThisWeek: 0,
    totalRewards: 0,
    weeklyRevenue: 0,
  });
  const [treeData, setTreeData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [ids, setIds] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/referrals/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchTree = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/referrals/tree?search=${searchTerm}&page=${currentPage}`);
      setTreeData(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tree:', error);
    }
  }, [searchTerm, currentPage]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/referrals/subscriptions?page=${currentPage}`);
      setSubscriptions(response.data.payments || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  }, [currentPage]);

  const fetchIds = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/referrals/ids?page=${currentPage}`);
      setIds(response.data.ids || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching IDs:', error);
    }
  }, [currentPage]);

  const fetchRewards = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/referrals/rewards?page=${currentPage}`);
      setRewards(response.data.rewards || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    fetchData();
  }, [activeTab, currentPage, searchTerm]);

  const fetchData = () => {
    setLoading(true);
    switch (activeTab) {
      case 'overview':
        fetchStats().finally(() => setLoading(false));
        break;
      case 'tree':
        fetchTree().finally(() => setLoading(false));
        break;
      case 'subscriptions':
        fetchSubscriptions().finally(() => setLoading(false));
        break;
      case 'ids':
        fetchIds().finally(() => setLoading(false));
        break;
      case 'rewards':
        fetchRewards().finally(() => setLoading(false));
        break;
      default:
        setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTree();
  };

  const renderOverview = () => (
    <div>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Users in Tree</div>
          <div style={styles.statValue}>{stats.totalUsers}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>IDs This Week</div>
          <div style={styles.statValue}>{stats.idsThisWeek}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Rewards</div>
          <div style={styles.statValue}>₹{Number(stats.totalRewards || 0).toFixed(2)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Weekly Revenue</div>
          <div style={styles.statValue}>₹{Number(stats.weeklyRevenue || 0).toFixed(2)}</div>
        </div>
      </div>
      <div style={styles.infoPanel}>
        <h3 style={styles.infoTitle}>How Referrals Work</h3>
        <ul style={styles.infoList}>
          <li><strong>Weekly Subscription:</strong> Users pay weekly, amount converted to IDs using formula: IDs = floor((amount + carry_forward) / 3.54)</li>
          <li><strong>Carry-forward:</strong> Leftover amount (mod 3.54) carries to next week</li>
          <li><strong>Tree Placement:</strong> New users placed via BFS (Breadth First Search)</li>
          <li><strong>Rewards:</strong> Each ancestor gets ₹0.0002 per ID generated</li>
          <li><strong>Vendor Commission:</strong> Same ID logic but no rewards to ancestors</li>
          <li><strong>Withdrawal:</strong> Min ₹100, 25% platform deduction</li>
        </ul>
      </div>
    </div>
  );

  const renderTree = () => (
    <div>
      <form onSubmit={handleSearch} style={styles.searchRow}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by phone or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button style={styles.searchBtn} type="submit">Search</button>
      </form>
      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : treeData.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Referrer</th>
                <th style={styles.th}>Level</th>
                <th style={styles.th}>Total IDs</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {treeData.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>{user.name || '-'}</td>
                  <td style={styles.td}>{user.phone || '-'}</td>
                  <td style={styles.td}>{user.referrerName || '-'}</td>
                  <td style={styles.td}>{user.level || 0}</td>
                  <td style={styles.td}>{user.totalIds || 0}</td>
                  <td style={styles.td}>{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.empty}>No referral data yet. Backend API not implemented.</div>
      )}
      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderSubscriptions = () => (
    <div>
      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : subscriptions.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Week</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Amount Paid</th>
                <th style={styles.th}>IDs Generated</th>
                <th style={styles.th}>Carry-forward</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{sub.weekNumber || '-'}</td>
                  <td style={styles.td}>{sub.userName || '-'}</td>
                  <td style={styles.td}>{sub.phone || '-'}</td>
                  <td style={styles.td}>₹{Number(sub.amount || 0).toFixed(2)}</td>
                  <td style={styles.td}>{sub.idsGenerated || 0}</td>
                  <td style={styles.td}>₹{Number(sub.carryForward || 0).toFixed(2)}</td>
                  <td style={styles.td}>{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.empty}>No subscription data yet. Backend API not implemented.</div>
      )}
      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderIds = () => (
    <div>
      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : ids.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Week</th>
                <th style={styles.th}>IDs Generated</th>
                <th style={styles.th}>Carry-forward Amount</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{id.userName || '-'}</td>
                  <td style={styles.td}>{id.phone || '-'}</td>
                  <td style={styles.td}>{id.weekNumber || '-'}</td>
                  <td style={styles.td}>{id.idsGenerated || 0}</td>
                  <td style={styles.td}>₹{Number(id.carryForwardAmount || 0).toFixed(2)}</td>
                  <td style={styles.td}>{id.createdAt ? new Date(id.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.empty}>No ID data yet. Backend API not implemented.</div>
      )}
      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderRewards = () => (
    <div>
      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : rewards.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Source User</th>
                <th style={styles.th}>IDs</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{reward.recipientName || '-'}</td>
                  <td style={styles.td}>{reward.recipientPhone || '-'}</td>
                  <td style={styles.td}>₹{Number(reward.amount || 0).toFixed(4)}</td>
                  <td style={styles.td}>{reward.sourceUserName || '-'}</td>
                  <td style={styles.td}>{reward.idsGenerated || 0}</td>
                  <td style={styles.td}>{reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.empty}>No reward data yet. Backend API not implemented.</div>
      )}
      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderPagination = () => (
    <div style={styles.pagination}>
      <button style={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
      <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
      <button style={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tree': return renderTree();
      case 'subscriptions': return renderSubscriptions();
      case 'ids': return renderIds();
      case 'rewards': return renderRewards();
      default: return null;
    }
  };

  return (
    <AdminLayout title="Referrals" subtitle="Referral tree, subscriptions, ID generation, and reward distribution.">
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            style={activeTab === tab.id ? styles.activeTab : styles.tab}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <section style={styles.panel}>
        {renderContent()}
      </section>
    </AdminLayout>
  );
};

const styles = {
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f5f5f5', color: '#6c6c6c', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  activeTab: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1e293b' },
  infoPanel: { padding: '20px', borderRadius: '14px', background: '#f0f9ff', border: '1px solid #bae6fd', marginTop: '20px' },
  infoTitle: { fontSize: '16px', fontWeight: '700', color: '#0369a1', marginBottom: '12px' },
  infoList: { fontSize: '14px', color: '#0c4a6e', lineHeight: 1.8, paddingLeft: '20px', margin: 0 },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px' },
  searchBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', color: '#6c6c6c', padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: '600' },
  td: { fontSize: '14px', color: '#1d1b20', padding: '12px', borderBottom: '1px solid #f2f2f2' },
  empty: { padding: '40px', border: '1px dashed #e0e0e0', borderRadius: '16px', textAlign: 'center', color: '#6c6c6c' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' },
  pageBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', color: '#1d1b20', fontSize: '14px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', color: '#6c6c6c' },
};

export default Referrals;
