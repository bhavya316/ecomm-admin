import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { API_BASE_URL } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || `${API_BASE_URL}/api/v1`;

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'blockquote', 'code-block'
];

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', audience: 'both' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFaqItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchFaqItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/faq-items?audience=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem('adminToken');
      
      if (editingItem) {
        await axios.patch(`${API_URL}/admin/faq-items/${editingItem.id}`, 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'FAQ item updated!' });
      } else {
        await axios.post(`${API_URL}/admin/faq-items`, 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'FAQ item created!' });
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ question: '', answer: '', audience: 'both' });
      fetchFaqItems();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving FAQ item:', error);
      setMessage({ type: 'error', text: 'Failed to save FAQ item' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/admin/faq-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFaqItems();
      setMessage({ type: 'success', text: 'FAQ item deleted!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      question: item.question, 
      answer: item.answer, 
      audience: item.audience 
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ question: '', answer: '', audience: activeTab === 'user' ? 'user' : 'vendor' });
    setShowModal(true);
  };

  return (
    <AdminLayout title="FAQ" subtitle="Manage Frequently Asked Questions">
      <div style={styles.container}>
        {message && (
          <div style={{
            ...styles.message,
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.header}>
          <div style={styles.tabContainer}>
            <button
              type="button"
              style={activeTab === 'user' ? {...styles.tab, ...styles.tabActive} : styles.tab}
              onClick={() => setActiveTab('user')}
            >
              User FAQs
            </button>
            <button
              type="button"
              style={activeTab === 'vendor' ? {...styles.tab, ...styles.tabActive} : styles.tab}
              onClick={() => setActiveTab('vendor')}
            >
              Vendor FAQs
            </button>
          </div>

          <button type="button" style={styles.addButton} onClick={openAddModal}>
            + Add FAQ
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : faqItems.length === 0 ? (
          <div style={styles.empty}>
            No FAQs found for {activeTab}. Click "Add FAQ" to create one.
          </div>
        ) : (
          <div style={styles.list}>
            {faqItems.map((item, index) => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemNumber}>#{index + 1}</div>
                <div style={styles.itemContent}>
                  <div 
                    style={styles.question}
                    dangerouslySetInnerHTML={{ __html: item.question }}
                  />
                  <div 
                    style={styles.answer}
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                  <div style={styles.itemMeta}>
                    <span style={{
                      ...styles.badge,
                      background: item.audience === 'both' ? '#e3f2fd' : item.audience === 'user' ? '#e8f5e9' : '#fff3e0',
                      color: item.audience === 'both' ? '#1565c0' : item.audience === 'user' ? '#2e7d32' : '#e65100',
                    }}>
                      {item.audience === 'both' ? 'Both' : item.audience === 'user' ? 'User' : 'Vendor'}
                    </span>
                  </div>
                </div>
                <div style={styles.itemActions}>
                  <button 
                    type="button" 
                    style={styles.editButton}
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button 
                    type="button" 
                    style={styles.deleteButton}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>
                {editingItem ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Question:</label>
                <div style={styles.quillWrapper}>
                  <ReactQuill
                    theme="snow"
                    value={formData.question}
                    onChange={(content) => setFormData({...formData, question: content})}
                    modules={modules}
                    formats={formats}
                    style={styles.quill}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Answer:</label>
                <div style={styles.quillWrapper}>
                  <ReactQuill
                    theme="snow"
                    value={formData.answer}
                    onChange={(content) => setFormData({...formData, answer: content})}
                    modules={modules}
                    formats={formats}
                    style={styles.quill}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Visible To:</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                  style={styles.select}
                >
                  <option value="user">Users Only</option>
                  <option value="vendor">Vendors Only</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  style={styles.saveButton}
                  onClick={handleSave}
                  disabled={saving || !formData.question || !formData.answer}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  tabContainer: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #e0e0e0',
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6c6c6c',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#cc0001',
    borderBottom: '2px solid #cc0001',
  },
  addButton: {
    padding: '10px 20px',
    background: '#cc0001',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6c6c6c',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#6c6c6c',
    background: '#fafafa',
    borderRadius: '4px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    alignItems: 'flex-start',
  },
  itemNumber: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c6c6c',
  },
  itemContent: {
    flex: 1,
  },
  question: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#1d1b20',
    marginBottom: '8px',
  },
  answer: {
    fontSize: '14px',
    color: '#6c6c6c',
    marginBottom: '8px',
  },
  itemMeta: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  itemActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#c62828',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#1d1b20',
  },
  quillWrapper: {
    borderRadius: '4px',
    overflow: 'hidden',
  },
  quill: {
    height: '120px',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    background: '#cc0001',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default FAQ;
