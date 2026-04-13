import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { API_BASE_URL } from '../utils/api';

const API_URL = `${API_BASE_URL}/api/v1` || 'http://localhost:5000/api/v1'; // Fallback for local development

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

const PolicyPage = ({ policyType, title, subtitle }) => {
  const [activeTab, setActiveTab] = useState('user');
  const [userContent, setUserContent] = useState('');
  const [vendorContent, setVendorContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyType]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/policies/${policyType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.data) {
        setUserContent(response.data.data.userContent || '');
        setVendorContent(response.data.data.vendorContent || '');
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/admin/policies/${policyType}`, 
        { userContent, vendorContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Policy saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving policy:', error);
      setMessage({ type: 'error', text: 'Failed to save policy' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={title} subtitle={subtitle}>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    );
  }

  const currentContent = activeTab === 'user' ? userContent : vendorContent;
  const setCurrentContent = activeTab === 'user' ? setUserContent : setVendorContent;

  return (
    <AdminLayout title={title} subtitle={subtitle}>
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

        <div style={styles.tabContainer}>
          <button
            type="button"
            style={activeTab === 'user' ? {...styles.tab, ...styles.tabActive} : styles.tab}
            onClick={() => setActiveTab('user')}
          >
            User Content
          </button>
          <button
            type="button"
            style={activeTab === 'vendor' ? {...styles.tab, ...styles.tabActive} : styles.tab}
            onClick={() => setActiveTab('vendor')}
          >
            Vendor Content
          </button>
        </div>

        <div style={styles.editorSection}>
          <label style={styles.label}>
            {activeTab === 'user' ? 'Content for Users:' : 'Content for Vendors:'}
          </label>
          <div style={styles.quillWrapper}>
            <ReactQuill
              theme="snow"
              value={currentContent}
              onChange={setCurrentContent}
              modules={modules}
              formats={formats}
              style={styles.quill}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{
              ...styles.saveButton,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
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
  tabContainer: {
    display: 'flex',
    gap: '0',
    marginBottom: '20px',
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
  editorSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#1d1b20',
  },
  quillWrapper: {
    borderRadius: '4px',
    overflow: 'hidden',
  },
  quill: {
    height: '300px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  saveButton: {
    padding: '12px 24px',
    background: '#cc0001',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default PolicyPage;
