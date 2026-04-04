import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import GoogleAuthButton from '../components/GoogleAuthButton';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithTokens } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (data) => {
    loginWithTokens(data.access, data.refresh, data.user);
    navigate('/dashboard');
  };

  const handleGoogleError = (err) => {
    setError(err?.response?.data?.message || err?.message || 'Google login failed. Please try again.');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, fontFamily: fonts.family }}>
      <StarfieldCanvas />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}>
        <Card style={{ maxWidth: '440px', width: '100%', padding: '48px' }} hoverable={false}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔐</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p style={{ color: theme.muted, fontSize: '0.95rem' }}>
              Sign in to your SecureHire account
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,95,87,0.1)',
              border: '1px solid rgba(255,95,87,0.3)',
              borderRadius: '8px',
              color: '#ff5f57',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme.text }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '0.95rem',
                  fontFamily: fonts.family,
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme.text }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text,
                  fontSize: '0.95rem',
                  fontFamily: fonts.family,
                }}
              />
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <a href="#forgot" style={{ fontSize: '0.85rem', color: theme.accent, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
            </div>

            <Button type="submit" disabled={loading} style={{ width: '100%', marginBottom: '16px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: theme.border }} />
            <span style={{ color: theme.muted, fontSize: '0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: theme.border }} />
          </div>

          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="Continue with Google"
            disabled={loading}
          />

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: theme.muted }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
