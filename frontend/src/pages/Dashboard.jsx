import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user's sessions
    api.get('/sessions/')
      .then(res => setSessions(res.data))
      .catch(err => console.error('Failed to fetch sessions:', err));
  }, [user, navigate]);

  const handleJoinSession = () => {
    if (joinCode.trim()) {
      navigate(`/join/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, fontFamily: fonts.family }}>
      <StarfieldCanvas />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          background: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '32px', color: theme.text }}>
            🔐 SecureHire
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: theme.accentMutedBg,
              color: theme.accent,
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}>
              📊 Dashboard
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              color: theme.muted,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}>
              📹 My Sessions
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              color: theme.muted,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}>
              📈 Analytics
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              color: theme.muted,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}>
              ⚙️ Settings
            </div>
          </nav>

          <div style={{
            padding: '16px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: theme.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.muted,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '48px' }}>
          <div style={{ maxWidth: '1200px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '1rem', color: theme.muted, marginBottom: '48px' }}>
              What do you want to do today?
            </p>

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '64px' }}>
              <Card onClick={() => navigate('/create')} style={{ padding: '32px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: theme.accentMutedBg,
                  border: `1px solid ${theme.accentMutedBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '16px',
                }}>
                  ➕
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
                  Create Session
                </h3>
                <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6, marginBottom: '16px' }}>
                  Start a new interview or meeting with AI-powered proctoring
                </p>
                <Button>Create</Button>
              </Card>

              <Card hoverable={false} style={{ padding: '32px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(121,192,255,0.1)',
                  border: '1px solid rgba(121,192,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '16px',
                }}>
                  🔗
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
                  Join Session
                </h3>
                <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6, marginBottom: '16px' }}>
                  Enter a 6-character code to join an existing session
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text,
                      fontSize: '0.95rem',
                      fontFamily: fonts.family,
                      textTransform: 'uppercase',
                    }}
                  />
                  <Button onClick={handleJoinSession} disabled={joinCode.length !== 6}>
                    Join
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Sessions */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, marginBottom: '24px' }}>
                Recent Sessions
              </h2>

              {sessions.length === 0 ? (
                <Card hoverable={false} style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📹</div>
                  <p style={{ fontSize: '1rem', color: theme.muted }}>
                    No sessions yet. Create your first session to get started!
                  </p>
                </Card>
              ) : (
                <Card hoverable={false} style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session.code} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '16px', color: theme.text, fontFamily: 'monospace' }}>{session.code}</td>
                          <td style={{ padding: '16px', color: theme.text }}>{session.mode}</td>
                          <td style={{ padding: '16px', color: theme.muted }}>{new Date(session.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: session.status === 'active' ? theme.accentMutedBg : 'rgba(139,148,158,0.1)',
                              color: session.status === 'active' ? theme.accent : theme.muted,
                            }}>
                              {session.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Button variant="outline" onClick={() => navigate(`/monitor/${session.code}`)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
