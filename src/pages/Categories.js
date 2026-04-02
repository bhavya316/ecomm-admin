import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { ADMIN_API_URL, toAssetUrl } from '../utils/api';

const API_URL = ADMIN_API_URL;

const COLORS = {
  primary: '#cc0001',
  surface: '#ffffff',
  textPrimary: '#1d1b20',
  textSecondary: '#6c6c6c',
  divider: '#e0e0e0',
  success: '#2e7d32',
  soft: '#fff5f5',
  grocery: '#2e7d32',
  pharmacy: '#1565c0',
};

const createEditorState = ({ mode, level, id = null, name = '', imageUrl = '', mainCategoryId = '', parentCategoryId = '', isPharmacy = false }) => ({
  mode,
  level,
  id,
  name,
  imageUrl,
  mainCategoryId,
  parentCategoryId,
  isPharmacy,
});

const Categories = () => {
  const { token } = useContext(AuthContext);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [editor, setEditor] = useState(null);
  const [activeTab, setActiveTab] = useState('grocery');
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/tree`);
      setAllCategories(response.data.categories || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Accept = 'application/json';
    fetchCategories();
  }, [fetchCategories, token]);

  const categories = useMemo(() => {
    const isPharmacyValue = activeTab === 'pharmacy';
    return allCategories.filter(cat => cat.isPharmacy === isPharmacyValue);
  }, [allCategories, activeTab]);

  // Default state is collapsed - no automatic expansion

  const flattenedCategories = useMemo(() => {
    const items = [];

    const walk = (nodes, depth = 0, rootMainId = '', rootParentId = '') => {
      nodes.forEach((node) => {
        const level = depth === 0 ? 'main' : depth === 1 ? 'parent' : 'sub';
        const mainCategoryId = depth === 0 ? String(node.id) : rootMainId;
        const parentCategoryId = depth === 1 ? String(node.id) : rootParentId;

        items.push({
          ...node,
          level,
          depth,
          mainCategoryId,
          parentCategoryId,
        });

        walk(
          node.children || [],
          depth + 1,
          mainCategoryId,
          depth === 1 ? String(node.id) : parentCategoryId
        );
      });
    };

    walk(categories);
    return items;
  }, [categories]);

  const findCategoryMeta = useCallback((id) => flattenedCategories.find((item) => Number(item.id) === Number(id)), [flattenedCategories]);

  const parentOptions = useMemo(() => {
    if (!editor || editor.level !== 'sub') return [];
    return categories.find((category) => String(category.id) === String(editor.mainCategoryId))?.children || [];
  }, [categories, editor]);

  const startCreateMain = () => {
    setEditor(createEditorState({ 
      mode: 'create', 
      level: 'main',
      isPharmacy: activeTab === 'pharmacy'
    }));
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const startEdit = (category) => {
    const meta = findCategoryMeta(category.id) || category;
    setEditor(createEditorState({
      mode: 'edit',
      level: meta.level,
      id: meta.id,
      name: meta.name,
      imageUrl: meta.imageUrl || '',
      mainCategoryId: meta.level === 'main' ? '' : meta.mainCategoryId,
      parentCategoryId: meta.level === 'sub' ? meta.parentCategoryId : '',
      isPharmacy: activeTab === 'pharmacy',
    }));
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const startCreateChild = (category) => {
    const meta = findCategoryMeta(category.id) || category;
    if (meta.level === 'sub') return;

    setExpandedCategoryIds((prev) => (prev.includes(meta.id) ? prev : [...prev, meta.id]));
    setEditor(createEditorState({
      mode: 'create',
      level: meta.level === 'main' ? 'parent' : 'sub',
      mainCategoryId: meta.level === 'main' ? String(meta.id) : meta.mainCategoryId,
      parentCategoryId: meta.level === 'parent' ? String(meta.id) : '',
      isPharmacy: activeTab === 'pharmacy',
    }));
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const closeModal = () => {
    setEditor(null);
    setShowModal(false);
    setMessage('');
    setError('');
  };

  const updateEditor = (field, value) => {
    setEditor((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (field === 'mainCategoryId' && next.level === 'sub') {
        next.parentCategoryId = '';
      }
      return next;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateEditor('imageUrl', reader.result);
    reader.readAsDataURL(file);
  };

  const submitEditor = async (event) => {
    event.preventDefault();
    if (!editor) return;

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      let parentId = null;
      if (editor.level === 'parent') parentId = editor.mainCategoryId || null;
      if (editor.level === 'sub') parentId = editor.parentCategoryId || null;

      const payload = {
        name: editor.name,
        parentId,
        imageUrl: editor.imageUrl || null,
        isPharmacy: activeTab === 'pharmacy',
      };

      if (editor.mode === 'edit') {
        await axios.patch(`${API_URL}/categories/${editor.id}`, payload);
      } else {
        await axios.post(`${API_URL}/categories`, payload);
      }

      setMessage(editor.mode === 'edit' ? 'Category updated successfully.' : 'Category created successfully.');
      closeModal();
      await fetchCategories();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId, e) => {
    e.stopPropagation();
    setExpandedCategoryIds((prev) => (
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    ));
  };

  const handleDeleteCategory = async (category, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.delete(`${API_URL}/categories/${category.id}`);
      await fetchCategories();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const renderModalContent = () => {
    if (!editor) return null;
    const tabColor = activeTab === 'pharmacy' ? COLORS.pharmacy : COLORS.grocery;

    return (
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={{ ...styles.modalTitle, color: tabColor }}>
            {editor.mode === 'edit' ? 'Edit Category' : `Add ${editor.level} Category`}
          </h2>
          <button type="button" style={styles.closeButton} onClick={closeModal}>✕</button>
        </div>

        <form onSubmit={submitEditor}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category Name</label>
              <input
                type="text"
                value={editor.name}
                onChange={(event) => updateEditor('name', event.target.value)}
                placeholder="Enter category name"
                style={{ ...styles.input, borderColor: tabColor }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Image</label>
              <div style={styles.imageUploadRow}>
                <label style={{ ...styles.clickableImageBox, borderColor: tabColor }}>
                  {editor.imageUrl ? (
                    <img src={toAssetUrl(editor.imageUrl)} alt="Preview" style={styles.modalPreviewImage} />
                  ) : (
                    <div style={styles.modalPreviewPlaceholder}>Click to upload</div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={styles.hiddenInput} />
                </label>
                <input
                  type="text"
                  value={editor.imageUrl}
                  onChange={(event) => updateEditor('imageUrl', event.target.value)}
                  placeholder="Or paste image URL"
                  style={styles.input}
                />
              </div>
            </div>

            {editor.level !== 'main' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Main Category</label>
                <select
                  value={editor.mainCategoryId}
                  onChange={(event) => updateEditor('mainCategoryId', event.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Select main category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            )}

            {editor.level === 'sub' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Parent Category</label>
                <select
                  value={editor.parentCategoryId}
                  onChange={(event) => updateEditor('parentCategoryId', event.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Select parent category</option>
                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.typeBadgeContainer}>
              <span style={{ 
                ...styles.typeBadge, 
                background: activeTab === 'pharmacy' ? '#e3f2fd' : '#e8f5e9',
                color: activeTab === 'pharmacy' ? COLORS.pharmacy : COLORS.grocery
              }}>
                {activeTab === 'pharmacy' ? 'Pharmacy Category' : 'Grocery Category'}
              </span>
            </div>
          </div>

          {message ? <div style={styles.successBox}>{message}</div> : null}
          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <div style={styles.modalFooter}>
            <button 
              type="submit" 
              style={{ ...styles.primaryButton, background: tabColor }} 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editor.mode === 'edit' ? 'Save Changes' : `Add ${editor.level}`}
            </button>
            <button type="button" style={styles.secondaryButton} onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderCategoryNode = (category, depth = 0) => {
    const meta = findCategoryMeta(category.id) || category;
    const canAddChild = meta.level !== 'sub';
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategoryIds.includes(category.id);
    const tabColor = activeTab === 'pharmacy' ? COLORS.pharmacy : COLORS.grocery;

    return (
      <div key={category.id} style={{ ...styles.treeNode, marginLeft: depth * 24 }}>
        <div style={styles.treeCard}>
          <div style={styles.treeContent} onClick={(e) => toggleCategory(category.id, e)}>
            {hasChildren ? (
              <button
                type="button"
                style={{ ...styles.expandButton, borderColor: tabColor, color: tabColor }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            ) : <div style={styles.expandSpacer} />}

            {category.imageUrl ? (
              <img src={toAssetUrl(category.imageUrl)} alt={category.name} style={styles.treeImage} />
            ) : (
              <div style={{ ...styles.treeImagePlaceholder, color: tabColor, borderColor: tabColor }}>
                {activeTab === 'pharmacy' ? 'RX' : 'GR'}
              </div>
            )}

            <div style={styles.treeTextBlock}>
              <div style={styles.treeName}>{category.name}</div>
              <div style={styles.treeMeta}>Slug: {category.slug}</div>
            </div>
          </div>

          <div style={styles.treeActions}>
            <span style={{ ...styles.levelTag, background: activeTab === 'pharmacy' ? '#e3f2fd' : '#e8f5e9', color: tabColor }}>
              {meta.level}
            </span>
            <button
              type="button"
              style={{ ...styles.editButton, borderColor: tabColor, color: tabColor }}
              onClick={(e) => {
                e.stopPropagation();
                startEdit(category);
              }}
            >
              Edit
            </button>
            {canAddChild && (
              <button
                type="button"
                style={{ ...styles.addChildButton, borderColor: tabColor, color: tabColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  startCreateChild(category);
                }}
              >
                + Add
              </button>
            )}
            <button
              type="button"
              style={{ ...styles.deleteButton, borderColor: COLORS.primary, color: COLORS.primary }}
              onClick={(e) => handleDeleteCategory(category, e)}
              disabled={submitting}
            >
              Delete
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div style={styles.childrenContainer}>
            {category.children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout 
      title="Category Manager" 
      subtitle="Manage categories for Grocery and Pharmacy vendors. Categories are isolated by type."
    >
      <div style={styles.tabContainer}>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === 'grocery' ? styles.tabButtonActive : {}),
            background: activeTab === 'grocery' ? COLORS.grocery : '#fff',
            color: activeTab === 'grocery' ? '#fff' : COLORS.textSecondary,
            borderColor: COLORS.grocery,
          }}
          onClick={() => {
            setActiveTab('grocery');
            setEditor(null);
            setShowModal(false);
            setMessage('');
            setError('');
          }}
        >
          Grocery Categories
        </button>
        <button
          type="button"
          style={{
            ...styles.tabButton,
            ...(activeTab === 'pharmacy' ? styles.tabButtonActive : {}),
            background: activeTab === 'pharmacy' ? COLORS.pharmacy : '#fff',
            color: activeTab === 'pharmacy' ? '#fff' : COLORS.textSecondary,
            borderColor: COLORS.pharmacy,
          }}
          onClick={() => {
            setActiveTab('pharmacy');
            setEditor(null);
            setShowModal(false);
            setMessage('');
            setError('');
          }}
        >
          Pharmacy Categories
        </button>
      </div>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              {activeTab === 'grocery' ? 'Grocery Categories' : 'Pharmacy Categories'}
            </h2>
            <p style={styles.panelSubtitle}>
              {activeTab === 'grocery' 
                ? 'These categories will only be visible to grocery vendors.'
                : 'These categories will only be visible to pharmacy vendors.'}
            </p>
          </div>

          <button 
            type="button" 
            style={{ ...styles.primaryButton, background: activeTab === 'pharmacy' ? COLORS.pharmacy : COLORS.grocery }} 
            onClick={startCreateMain}
          >
            + Add Category
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyState}>
            No {activeTab} categories created yet. Start by adding a main category.
          </div>
        ) : (
          <>
            {error ? <div style={styles.errorBox}>{error}</div> : null}
            <div style={styles.treeWrapper}>
              {categories.map((category) => renderCategoryNode(category))}
            </div>
          </>
        )}
      </section>

      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            {renderModalContent()}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const styles = {
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  tabButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: '2px solid',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  panel: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.divider}`,
    borderRadius: '18px',
    padding: '22px',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '18px',
  },
  panelTitle: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: '20px',
    fontWeight: '700',
  },
  panelSubtitle: {
    margin: '6px 0 0',
    color: COLORS.textSecondary,
    fontSize: '14px',
    lineHeight: 1.5,
  },
  treeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  treeNode: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  treeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${COLORS.divider}`,
    background: '#fff',
    transition: 'all 0.2s ease',
  },
  treeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
    flex: 1,
    cursor: 'pointer',
  },
  childrenContainer: {
    marginLeft: '20px',
    borderLeft: `2px dashed ${COLORS.divider}`,
    paddingLeft: '12px',
  },
  treeTextBlock: {
    minWidth: 0,
    flex: 1,
  },
  expandButton: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid',
    background: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandSpacer: {
    width: '28px',
    height: '28px',
    flexShrink: 0,
  },
  treeImage: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: `1px solid ${COLORS.divider}`,
    flexShrink: 0,
  },
  treeImagePlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: COLORS.soft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    border: '1px dashed',
    flexShrink: 0,
  },
  treeName: {
    color: COLORS.textPrimary,
    fontSize: '15px',
    fontWeight: '600',
  },
  treeMeta: {
    color: COLORS.textSecondary,
    fontSize: '12px',
    marginTop: '2px',
    wordBreak: 'break-word',
  },
  treeActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  levelTag: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  editButton: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid',
    background: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  addChildButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    background: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid',
    background: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  primaryButton: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: `1px solid ${COLORS.divider}`,
    background: '#fff',
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successBox: {
    background: '#edf7ed',
    border: '1px solid #c8e6c9',
    color: COLORS.success,
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  errorBox: {
    background: '#fff5f5',
    border: '1px solid #ffe0e0',
    color: COLORS.primary,
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  emptyState: {
    padding: '28px',
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: '14px',
    background: '#fcfcfc',
    borderRadius: '14px',
    border: `1px dashed ${COLORS.divider}`,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    background: '#fff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalContent: {
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: COLORS.textSecondary,
    padding: '4px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: '13px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${COLORS.divider}`,
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#fff',
  },
  imageUploadRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  clickableImageBox: {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    border: '2px dashed',
    background: '#fafafa',
  },
  hiddenInput: {
    display: 'none',
  },
  modalPreviewImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  modalPreviewPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    border: `1px dashed ${COLORS.divider}`,
    color: COLORS.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  },
  typeBadgeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px',
  },
  typeBadge: {
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: `1px solid ${COLORS.divider}`,
  },
};

export default Categories;