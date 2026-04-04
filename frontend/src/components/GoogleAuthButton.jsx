import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

/**
 * GoogleAuthButton uses the implicit flow:
 * 1. Opens Google popup
 * 2. Gets access_token from Google
 * 3. Sends it to our backend /auth/google/ which verifies & returns JWT
 */
export default function GoogleAuthButton({ onSuccess, onError, text = 'Continue with Google', disabled, style }) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // tokenResponse.access_token is a Google OAuth2 access token
        const res = await api.post('/auth/google/', {
          token: tokenResponse.access_token,
        });
        onSuccess(res.data);
      } catch (err) {
        onError(err);
      }
    },
    onError: (err) => {
      console.error('Google OAuth error:', err);
      onError(new Error('Google sign-in was cancelled or failed'));
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 0.2s, background 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
        if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <GoogleIcon />
      {text}
    </button>
  );
}
