import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.loginCard}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>EC</div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Vendor Management System</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="admin@example.com"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #fff5f5 0%, #fafafa 50%, #ffffff 100%)',
  },
  loginCard: {
    position: 'relative',
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f0f0f0',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#cc0001',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
  },
  title: {
    color: '#1d1b20',
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
  },
  subtitle: {
    color: '#6c6c6c',
    fontSize: '14px',
    margin: '4px 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#6c6c6c',
    fontSize: '13px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    background: '#fafafa',
    color: '#1d1b20',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#cc0001',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    background: '#fff5f5',
    border: '1px solid #ffe5e5',
    color: '#cc0001',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
};

export default Login;
