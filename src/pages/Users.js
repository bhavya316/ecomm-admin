import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { ADMIN_API_URL, toAssetUrl } from '../utils/api';

const Users = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/users`);
      setUsers(response.data.users || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    fetchUsers();
  }, [fetchUsers, token]);

  return (
    <AdminLayout title="Users" subtitle="Entries from the UserProfiles table only.">
      <section style={styles.panel}>
        {loading ? <div style={styles.empty}>Loading users...</div> : users.length ? (
          <div style={styles.grid}>
            {users.map((user) => (
              <article key={user.phoneNumber || user.email || Math.random()} style={styles.card}>
                <div style={styles.cardTop}>
                  {toAssetUrl(user.profileImageUrl) ? (
                    <img src={toAssetUrl(user.profileImageUrl)} alt={user.fullName || user.phoneNumber} style={styles.avatar} />
                  ) : <div style={styles.avatarFallback}>{(user.fullName || user.phoneNumber || 'U').charAt(0)}</div>}
                  <div>
                    <div style={styles.name}>{user.fullName || 'Unnamed User'}</div>
                    <div style={styles.phone}>{user.phoneNumber}</div>
                  </div>
                </div>
                <div style={styles.metaRow}><span>Email</span><strong>{user.email || '-'}</strong></div>
                <div style={styles.metaRow}><span>Phone</span><strong>{user.phoneNumber || '-'}</strong></div>
                <div style={styles.metaRow}><span>DOB</span><strong>{user.dob || '-'}</strong></div>
                {user.address && (
                  <>
                    <div style={styles.metaRow}><span>Address</span><strong>{user.address.fullAddress || '-'}</strong></div>
                    <div style={styles.metaRow}><span>City</span><strong>{user.address.city || '-'}</strong></div>
                    <div style={styles.metaRow}><span>State</span><strong>{user.address.state || '-'}</strong></div>
                    <div style={styles.metaRow}><span>Pincode</span><strong>{user.address.pincode || '-'}</strong></div>
                  </>
                )}
              </article>
            ))}
          </div>
        ) : <div style={styles.empty}>No users found.</div>}
      </section>
    </AdminLayout>
  );
};

const styles = {
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  card: { border: '1px solid #ececec', borderRadius: '14px', padding: '16px', background: '#fff' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  avatar: { width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e0e0e0' },
  avatarFallback: { width: '52px', height: '52px', borderRadius: '50%', background: '#fff5f5', color: '#cc0001', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  name: { fontSize: '15px', fontWeight: '700', color: '#1d1b20' },
  phone: { fontSize: '13px', color: '#6c6c6c', marginTop: '3px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderTop: '1px solid #f2f2f2', fontSize: '13px', color: '#6c6c6c' },
  empty: { padding: '28px', border: '1px dashed #e0e0e0', borderRadius: '16px', textAlign: 'center', color: '#6c6c6c' },
};

export default Users;
