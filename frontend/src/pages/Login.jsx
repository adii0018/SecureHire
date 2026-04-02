import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const handleGoogleLogin = () => {
    // Google OAuth implementation
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/`;
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

          <Button variant="outline" onClick={handleGoogleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </Button>

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
