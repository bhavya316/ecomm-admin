import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'https://broadcast.rivoratech.com/api/v1/admin';

const COLORS = {
  primary: '#cc0001',
  background: '#fafafa',
  surface: '#fff',
  textPrimary: '#1d1b20',
  textSecondary: '#6c6c6c',
  success: '#4caf50',
  error: '#b00020',
  divider: '#e0e0e0',
};

const DOCUMENT_FIELDS = [
  { key: 'aadhar', label: 'Aadhar Card' },
  { key: 'pan', label: 'PAN Card' },
  { key: 'gst', label: 'GST Certificate' },
  { key: 'fssai', label: 'FSSAI License' },
  { key: 'bankProof', label: 'Bank Proof' },
  { key: 'profile', label: 'Profile Photo' },
];

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [imageModal, setImageModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFields, setRejectFields] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const { logout, token } = useContext(AuthContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Accept'] = 'application/json';
      fetchVendors();
    }
  }, [filter, token]);

  const fetchVendors = async () => {
    try {
      const endpoint = filter === 'pending' 
        ? `${API_URL}/vendors/pending` 
        : `${API_URL}/vendors?status=${filter}`;
      const response = await axios.get(endpoint);
      setVendors(response.data.vendors || response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/vendors/${id}`);
      setSelectedVendor(response.data.vendor);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  const approveVendor = async (id) => {
    try {
      await axios.patch(`${API_URL}/vendors/${id}/approve`);
      setSelectedVendor(null);
      fetchVendors();
    } catch (error) {
      console.error('Error approving vendor:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error approving vendor');
    }
  };

  const openRejectModal = () => {
    setRejectFields([]);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (!selectedVendor) return;
    
    try {
      await axios.patch(`${API_URL}/vendors/${selectedVendor.id}/reject`, {
        reason: rejectReason,
        fields: rejectFields,
      });
      setShowRejectModal(false);
      setSelectedVendor(null);
      fetchVendors();
    } catch (error) {
      console.error('Error rejecting vendor:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error rejecting vendor');
    }
  };

  const toggleField = (fieldKey) => {
    setRejectFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#fff5f5', color: '#cc0001', border: '#ffe5e5' },
      approved: { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9' },
      rejected: { bg: '#ffebee', color: '#c62828', border: '#ffcdd2' },
    };
    const c = colors[status] || colors.pending;
    return (
      <span style={{ 
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
      }}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const renderImage = (src, label) => {
    if (!src || typeof src !== 'string') return null;
    
    const isBase64 = src.startsWith('data:image') || src.startsWith('http') || src.length > 200;
    const srcToUse = isBase64 ? src : null;
    
    if (!srcToUse) return null;
    
    return (
      <div style={styles.imageItem}>
        <span style={styles.imageLabel}>{label}</span>
        <div 
          style={styles.imageThumbnail}
          onClick={() => setImageModal({ src: srcToUse, label })}
        >
          <img 
            src={srcToUse} 
            alt={label}
            style={styles.thumbnailImg}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: COLORS.textSecondary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoIcon}>EC</div>
          <span style={styles.logoText}>Admin</span>
        </div>
        
        <nav style={styles.nav}>
          <button 
            style={filter === 'pending' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setFilter('pending')}
          >
            Pending Approvals
            {vendors.length > 0 && filter === 'pending' && (
              <span style={styles.badge}>{vendors.length}</span>
            )}
          </button>
          <button 
            style={filter === 'approved' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setFilter('approved')}
          >
            Approved Vendors
          </button>
          <button 
            style={filter === 'rejected' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setFilter('rejected')}
          >
            Rejected Vendors
          </button>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {filter === 'pending' ? 'Pending Approvals' : filter === 'approved' ? 'Approved Vendors' : 'Rejected Vendors'}
            </h1>
            <p style={styles.headerSubtitle}>{vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</p>
          </div>
        </header>

        {vendors.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              {filter === 'pending' ? 'No pending vendor applications.' : `No ${filter} vendors.`}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                style={styles.card}
                onClick={() => fetchVendorDetails(vendor.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.vendorType}>{vendor.vendorType}</span>
                  {getStatusBadge(vendor.status)}
                </div>
                <h3 style={styles.storeName}>{vendor.storeName || 'Unnamed Store'}</h3>
                <p style={styles.vendorName}>{vendor.fullName}</p>
                <div style={styles.cardMeta}>
                  <span>{vendor.mobileNumber}</span>
                  <span>{new Date(vendor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedVendor && !showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setSelectedVendor(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Vendor Details</h2>
              <button style={styles.modalClose} onClick={() => setSelectedVendor(null)}>✕</button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Store Information</h4>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Store Name</span>
                    <span style={styles.infoValue}>{selectedVendor.storeName || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Vendor Type</span>
                    <span style={styles.infoValue}>{selectedVendor.vendorType}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Sub Category</span>
                    <span style={styles.infoValue}>{selectedVendor.subCategory || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Status</span>
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Personal Information</h4>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Full Name</span>
                    <span style={styles.infoValue}>{selectedVendor.fullName || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Mobile</span>
                    <span style={styles.infoValue}>{selectedVendor.mobileNumber || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Phone</span>
                    <span style={styles.infoValue}>{selectedVendor.phoneNumber || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Address</span>
                    <span style={styles.infoValue}>{selectedVendor.storeAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Documents</h4>
                <div style={styles.imagesGrid}>
                  {renderImage(selectedVendor.profilePictureUrl, 'Profile Photo')}
                  {renderImage(selectedVendor.aadharImageUrl, 'Aadhar Card')}
                  {renderImage(selectedVendor.panImageUrl, 'PAN Card')}
                  {renderImage(selectedVendor.gstCertificate, 'GST Certificate')}
                  {renderImage(selectedVendor.fssaiLicense, 'FSSAI License')}
                  {renderImage(selectedVendor.bankProofUrl, 'Bank Proof')}
                </div>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Aadhar Number</span>
                    <span style={styles.infoValue}>{selectedVendor.aadharNumber || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>PAN Number</span>
                    <span style={styles.infoValue}>{selectedVendor.panNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Bank Details</h4>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Account Name</span>
                    <span style={styles.infoValue}>{selectedVendor.bankAccountName || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Account Number</span>
                    <span style={styles.infoValue}>{selectedVendor.bankAccountNumber || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>IFSC</span>
                    <span style={styles.infoValue}>{selectedVendor.bankIfscCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedVendor.status === 'rejected' && (
                <div style={styles.section}>
                  <h4 style={{ ...styles.sectionTitle, color: COLORS.error }}>Rejection Details</h4>
                  <div style={styles.rejectionBox}>
                    <p style={styles.rejectionReason}><strong>Reason:</strong> {selectedVendor.rejectionReason || 'No reason provided'}</p>
                    {selectedVendor.rejectionFields && selectedVendor.rejectionFields.length > 0 && (
                      <div style={styles.rejectionFields}>
                        <p><strong>Faulty Documents:</strong></p>
                        <div style={styles.fieldTags}>
                          {(() => {
                            try {
                              const fields = typeof selectedVendor.rejectionFields === 'string' 
                                ? JSON.parse(selectedVendor.rejectionFields) 
                                : selectedVendor.rejectionFields;
                              return Array.isArray(fields) ? fields.map(field => (
                                <span key={field} style={styles.fieldTag}>{field}</span>
                              )) : null;
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>

              {selectedVendor.status === 'rejected' && (
                <div style={styles.section}>
                  <h4 style={{ ...styles.sectionTitle, color: COLORS.error }}>Rejection Details</h4>
                  <div style={styles.rejectionBox}>
                    <p style={styles.rejectionReason}>
                      <strong>Reason:</strong> {selectedVendor.rejectionReason || 'No reason provided'}
                    </p>
                    {selectedVendor.rejectionFields && (
                      <div style={styles.rejectionFields}>
                        <p><strong>Faulty Documents:</strong></p>
                        <div style={styles.fieldTags}>
                          {(() => {
                            let fields = [];
                            try {
                              if (typeof selectedVendor.rejectionFields === 'string') {
                                fields = JSON.parse(selectedVendor.rejectionFields);
                              } else if (Array.isArray(selectedVendor.rejectionFields)) {
                                fields = selectedVendor.rejectionFields;
                              }
                            } catch (e) {
                              fields = [];
                            }
                            return fields.map(field => (
                              <span key={field} style={styles.fieldTag}>{field}</span>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedVendor.status === 'pending' && (
              <div style={styles.modalActions}>
                <button style={styles.approveBtn} onClick={() => approveVendor(selectedVendor.id)}>
                  Approve
                </button>
                <button style={styles.rejectBtn} onClick={openRejectModal}>
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={styles.rejectModal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Reject Vendor</h2>
              <button style={styles.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            
            <div style={styles.modalContent}>
              <p style={styles.rejectInfo}>Select the documents that are faulty or incorrect:</p>
              
              <div style={styles.fieldsGrid}>
                {DOCUMENT_FIELDS.map(field => (
                  <label key={field.key} style={styles.fieldCheckbox}>
                    <input
                      type="checkbox"
                      checked={rejectFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                      style={styles.checkbox}
                    />
                    <span style={styles.fieldLabel}>{field.label}</span>
                  </label>
                ))}
              </div>

              <div style={styles.rejectReasonGroup}>
                <label style={styles.rejectLabel}>Reason for rejection (optional):</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Documents are unclear, information doesn't match..."
                  style={styles.rejectTextarea}
                  rows={4}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button style={styles.confirmRejectBtn} onClick={submitReject}>
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div style={styles.imageModalOverlay} onClick={() => setImageModal(null)}>
          <div style={styles.imageModalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.imageModalClose} onClick={() => setImageModal(null)}>✕</button>
            <h3 style={styles.imageModalTitle}>{imageModal.label}</h3>
            <img 
              src={imageModal.src} 
              alt={imageModal.label}
              style={styles.imageModalImg}
            />
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: COLORS.background,
  },
  sidebar: {
    width: '240px',
    background: COLORS.surface,
    borderRight: `1px solid ${COLORS.divider}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
  },
  sidebarHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: `1px solid ${COLORS.divider}`,
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: '18px',
    fontWeight: '600',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: COLORS.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '4px',
  },
  navItemActive: {
    background: '#fff5f5',
    color: COLORS.primary,
  },
  badge: {
    background: COLORS.primary,
    color: '#fff',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  logoutBtn: {
    margin: '16px',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#fafafa',
    color: COLORS.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    padding: '24px 32px',
  },
  header: {
    marginBottom: '24px',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: COLORS.surface,
    borderRadius: '12px',
    padding: '18px',
    border: `1px solid ${COLORS.divider}`,
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  vendorType: {
    color: COLORS.textSecondary,
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  storeName: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  vendorName: {
    color: COLORS.textSecondary,
    fontSize: '13px',
    marginBottom: '12px',
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    color: '#9e9e9e',
    fontSize: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: COLORS.surface,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  rejectModal: {
    background: COLORS.surface,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: `1px solid ${COLORS.divider}`,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: '18px',
    fontWeight: '600',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: COLORS.textSecondary,
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    color: '#9e9e9e',
    fontSize: '12px',
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: '14px',
  },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  imageItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  imageLabel: {
    color: '#9e9e9e',
    fontSize: '11px',
  },
  imageThumbnail: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${COLORS.divider}`,
    cursor: 'pointer',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  rejectionBox: {
    background: '#fff5f5',
    border: '1px solid #ffe5e5',
    borderRadius: '8px',
    padding: '14px',
  },
  rejectionReason: {
    color: COLORS.textPrimary,
    fontSize: '14px',
    marginBottom: '8px',
  },
  rejectionFields: {
    marginTop: '8px',
  },
  fieldTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px',
  },
  fieldTag: {
    background: COLORS.error,
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  modalActions: {
    padding: '16px 20px',
    borderTop: `1px solid ${COLORS.divider}`,
    display: 'flex',
    gap: '12px',
  },
  approveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: COLORS.success,
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  rejectBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: COLORS.error,
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.divider}`,
    background: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmRejectBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: COLORS.error,
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  rejectInfo: {
    color: COLORS.textSecondary,
    fontSize: '14px',
    marginBottom: '16px',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  fieldCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: COLORS.primary,
  },
  fieldLabel: {
    color: COLORS.textPrimary,
    fontSize: '14px',
  },
  rejectReasonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rejectLabel: {
    color: COLORS.textSecondary,
    fontSize: '13px',
    fontWeight: '500',
  },
  rejectTextarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.divider}`,
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  imageModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  imageModalContent: {
    background: COLORS.surface,
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    position: 'relative',
  },
  imageModalClose: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
  },
  imageModalTitle: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
  },
  imageModalImg: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '8px',
  },
};

export default Vendors;
