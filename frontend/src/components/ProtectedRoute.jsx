import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { theme, fonts } from '../theme';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.muted,
        fontFamily: fonts.family,
        fontSize: '0.95rem',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
