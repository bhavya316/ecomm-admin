export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
export const ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;

export const toAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/uploads/')) return `${API_BASE_URL}${value}`;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
};
