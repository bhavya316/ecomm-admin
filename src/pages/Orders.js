import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { ADMIN_API_URL } from '../utils/api';

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'Order Confirmed' },
  { value: 'complete', label: 'Order Prepared' },
  { value: 'handover_for_delivery', label: 'Handed Over for Delivery' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUSES = [
  { value: 'all', label: 'All Payment Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];

const Orders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    vendorId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const fetchVendors = useCallback(async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/vendors?status=approved`);
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  }, []);

  const fetchOrders = useCallback(async (filterParams, page = currentPage, limitVal = limit) => {
    try {
      const params = new URLSearchParams();
      const filtersToUse = filterParams || filters;
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.append(key, value);
        }
      });
      params.append('limit', limitVal);
      params.append('page', page);
      const response = await axios.get(`${ADMIN_API_URL}/orders?${params.toString()}`);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setLoading(true);
    fetchOrders(filters, 1, limit);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      vendorId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setCurrentPage(1);
    setLoading(true);
    fetchOrders({
      status: 'all',
      paymentStatus: 'all',
      vendorId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    }, 1, limit);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setLoading(true);
      fetchOrders(filters, page, limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
    setLoading(true);
    fetchOrders(filters, 1, newLimit);
  };

  useEffect(() => {
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    fetchVendors();
    fetchOrders();
  }, [fetchOrders, fetchVendors, token]);

  return (
    <AdminLayout title="Orders" subtitle="Platform-wide order activity across all stores.">
      <section style={styles.panel}>
        <div style={styles.filterContainer}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Order Status</label>
              <select style={styles.filterSelect} name="status" value={filters.status} onChange={handleFilterChange}>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Payment Status</label>
              <select style={styles.filterSelect} name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Vendor</label>
              <select style={styles.filterSelect} name="vendorId" value={filters.vendorId} onChange={handleFilterChange}>
                <option value="">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.storeName}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>From Date</label>
              <input style={styles.filterInput} type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>To Date</label>
              <input style={styles.filterInput} type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Min Amount</label>
              <input style={styles.filterInput} type="number" name="minAmount" placeholder="Min" value={filters.minAmount} onChange={handleFilterChange} />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Max Amount</label>
              <input style={styles.filterInput} type="number" name="maxAmount" placeholder="Max" value={filters.maxAmount} onChange={handleFilterChange} />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>&nbsp;</label>
              <div style={styles.filterButtons}>
                <button style={styles.applyBtn} onClick={applyFilters}>Apply</button>
                <button style={styles.resetBtn} onClick={resetFilters}>Reset</button>
              </div>
            </div>
          </div>
        </div>
        {loading ? <div style={styles.empty}>Loading orders...</div> : orders.length ? (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Vendor</th>
                  <th style={styles.th}>Items</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>#{order.id}</td>
                    <td style={styles.td}>{order.userName}</td>
                    <td style={styles.td}>{order.vendorName}</td>
                    <td style={styles.td}>{order.orderItemsCount}</td>
                    <td style={styles.td}>{order.payment?.method || '-'}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(order.status)}>{order.status}</span>
                    </td>
                    <td style={styles.td}>Rs {Number(order.totalAmount || 0).toFixed(2)}</td>
                    <td style={styles.td}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div style={styles.empty}>No orders found.</div>}
        <div style={styles.tableFooter}>
          <div style={styles.limitSelect}>
            <span style={styles.limitLabel}>Show</span>
            <select style={styles.limitDropdown} value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={styles.limitLabel}>entries</span>
          </div>
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button style={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button style={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

const getStatusStyle = (status) => {
  const statusColors = {
    pending: { background: '#fff3e0', color: '#e65100' },
    in_progress: { background: '#e3f2fd', color: '#1565c0' },
    complete: { background: '#e8f5e9', color: '#2e7d32' },
    handover_for_delivery: { background: '#f3e5f5', color: '#7b1fa2' },
    out_for_delivery: { background: '#fff8e1', color: '#f9a825' },
    delivered: { background: '#e8f5e9', color: '#1b5e20' },
    cancelled: { background: '#ffebee', color: '#c62828' },
  };
  const colors = statusColors[status] || { background: '#f5f5f5', color: '#616161' };
  return { ...styles.statusBadge, background: colors.background, color: colors.color };
};

const styles = {
  panel: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px' },
  filterContainer: { marginBottom: '20px' },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' },
  filterGroup: { display: 'flex', flexDirection: 'column', minWidth: '150px', flex: 1 },
  filterLabel: { fontSize: '12px', color: '#6c6c6c', fontWeight: '600', marginBottom: '4px' },
  filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#1d1b20', cursor: 'pointer', background: '#fff' },
  filterInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#1d1b20' },
  filterButtons: { display: 'flex', gap: '8px', marginTop: 'auto' },
  applyBtn: { padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600' },
  resetBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', color: '#6c6c6c', fontSize: '14px', cursor: 'pointer', fontWeight: '600' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', color: '#6c6c6c', padding: '12px', borderBottom: '1px solid #e0e0e0' },
  td: { fontSize: '14px', color: '#1d1b20', padding: '12px', borderBottom: '1px solid #f2f2f2' },
  statusBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  empty: { padding: '28px', border: '1px dashed #e0e0e0', borderRadius: '16px', textAlign: 'center', color: '#6c6c6c' },
  tableFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' },
  limitSelect: { display: 'flex', alignItems: 'center', gap: '8px' },
  limitLabel: { fontSize: '14px', color: '#6c6c6c' },
  limitDropdown: { padding: '6px 10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#1d1b20', cursor: 'pointer', background: '#fff' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' },
  pageBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', color: '#1d1b20', fontSize: '14px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', color: '#6c6c6c' },
};

export default Orders;
