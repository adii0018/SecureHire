import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { Lock, LayoutDashboard, Video, BarChart2, Settings, Plus, Link, AlertCircle, Trash2, Eye } from 'lucide-react';

// ─── Sessions Panel ───────────────────────────────────────────────────────────
function SessionsPanel({ sessions, user, navigate, onDelete }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>My Sessions</h1>
      <p style={{ color: theme.muted, marginBottom: '32px' }}>All sessions you have created</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'waiting', 'active', 'ended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? theme.accent : theme.border}`,
            background: filter === f ? theme.accentMutedBg : 'transparent',
            color: filter === f ? theme.accent : theme.muted,
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: fonts.family, textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card hoverable={false} style={{ padding: '48px', textAlign: 'center' }}>
          <Video size={48} color={theme.muted} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: theme.muted }}>No sessions found.</p>
        </Card>
      ) : (
        <Card hoverable={false} style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                {['Code', 'Title', 'Mode', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(session => (
                <tr key={session.code} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '14px 16px', color: theme.text, fontFamily: 'monospace', fontWeight: 600 }}>{session.code}</td>
                  <td style={{ padding: '14px 16px', color: theme.text }}>{session.title || '—'}</td>
                  <td style={{ padding: '14px 16px', color: theme.muted, textTransform: 'capitalize' }}>{session.mode}</td>
                  <td style={{ padding: '14px 16px', color: theme.muted }}>{new Date(session.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                      background: session.status === 'active' ? theme.accentMutedBg : session.status === 'waiting' ? 'rgba(121,192,255,0.1)' : 'rgba(139,148,158,0.1)',
                      color: session.status === 'active' ? theme.accent : session.status === 'waiting' ? '#79c0ff' : theme.muted,
                    }}>{session.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(session.status === 'waiting' || session.status === 'active') && (
                        <Button variant="primary" onClick={() => navigate(`/room/${session.code}`, { state: { name: user?.first_name || 'Host', role: 'host' } })}>
                          Join
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => navigate(`/monitor/${session.code}`)}>
                        <Eye size={14} />
                      </Button>
                      <button onClick={() => onDelete(session.code)} style={{
                        padding: '6px 10px', borderRadius: '6px', border: `1px solid rgba(248,81,73,0.3)`,
                        background: 'rgba(248,81,73,0.08)', color: '#f85149', cursor: 'pointer',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ sessions }) {
  const total = sessions.length;
  const active = sessions.filter(s => s.status === 'active').length;
  const ended = sessions.filter(s => s.status === 'ended').length;
  const waiting = sessions.filter(s => s.status === 'waiting').length;

  const modeCount = sessions.reduce((acc, s) => {
    acc[s.mode] = (acc[s.mode] || 0) + 1;
    return acc;
  }, {});

  const statCard = (label, value, color) => (
    <Card hoverable={false} style={{ padding: '28px' }} key={label}>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: color || theme.accent, marginBottom: '8px' }}>{value}</div>
      <div style={{ fontSize: '0.95rem', color: theme.muted }}>{label}</div>
    </Card>
  );

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Analytics</h1>
      <p style={{ color: theme.muted, marginBottom: '32px' }}>Overview of your session activity</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {statCard('Total Sessions', total, theme.text)}
        {statCard('Active', active, theme.accent)}
        {statCard('Waiting', waiting, '#79c0ff')}
        {statCard('Ended', ended, theme.muted)}
      </div>

      {total > 0 && (
        <Card hoverable={false} style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '20px' }}>Sessions by Mode</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(modeCount).map(([mode, count]) => (
              <div key={mode}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: theme.text, textTransform: 'capitalize', fontSize: '0.9rem' }}>{mode}</span>
                  <span style={{ color: theme.muted, fontSize: '0.9rem' }}>{count} / {total}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: theme.border, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: theme.accent, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {total === 0 && (
        <Card hoverable={false} style={{ padding: '48px', textAlign: 'center' }}>
          <BarChart2 size={48} color={theme.muted} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: theme.muted }}>No data yet. Create sessions to see analytics.</p>
        </Card>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ user, logout }) {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: theme.bg,
    border: `1px solid ${theme.border}`, borderRadius: '8px',
    color: theme.text, fontSize: '0.95rem', fontFamily: fonts.family,
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: '0.85rem', color: theme.muted, marginBottom: '6px', display: 'block' };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: theme.muted, marginBottom: '32px' }}>Manage your account preferences</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px' }}>
        <Card hoverable={false} style={{ padding: '28px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '20px' }}>Profile</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} defaultValue={user?.first_name || ''} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} defaultValue={user?.last_name || ''} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, color: theme.muted, cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button type="submit">Save Changes</Button>
              {saved && <span style={{ color: theme.accent, fontSize: '0.9rem' }}>✓ Saved</span>}
            </div>
          </form>
        </Card>

        <Card hoverable={false} style={{ padding: '28px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '20px' }}>Danger Zone</h3>
          <p style={{ color: theme.muted, fontSize: '0.9rem', marginBottom: '16px' }}>
            Once you log out, you will need to sign in again to access your sessions.
          </p>
          <button onClick={logout} style={{
            padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(248,81,73,0.4)',
            background: 'rgba(248,81,73,0.08)', color: '#f85149', cursor: 'pointer',
            fontSize: '0.9rem', fontFamily: fonts.family,
          }}>
            Logout
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/sessions/').then(res => setSessions(res.data)).catch(err => console.error(err));
  }, [user, navigate]);

  const handleJoinSession = () => {
    if (joinCode.trim()) navigate(`/join/${joinCode.toUpperCase()}`);
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/sessions/${code}/delete/`);
      setSessions(prev => prev.filter(s => s.code !== code));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { id: 'sessions',  icon: <Video size={16} />,           label: 'My Sessions' },
    { id: 'analytics', icon: <BarChart2 size={16} />,       label: 'Analytics' },
    { id: 'settings',  icon: <Settings size={16} />,        label: 'Settings' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, fontFamily: fonts.family }}>
      <StarfieldCanvas />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <aside style={{ width: '240px', background: theme.surface, borderRight: `1px solid ${theme.border}`, padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '32px', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color={theme.accent} /> SecureHire
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => (
              <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
                padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.95rem', fontWeight: activeTab === item.id ? 600 : 400,
                background: activeTab === item.id ? theme.accentMutedBg : 'transparent',
                color: activeTab === item.id ? theme.accent : theme.muted,
                transition: 'all 0.15s ease',
              }}>
                {item.icon} {item.label}
              </div>
            ))}
          </nav>

          <div style={{ padding: '16px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px' }}>

            {activeTab === 'dashboard' && (
              <>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
                  Welcome back, {user?.first_name || user?.email?.split('@')[0]} 👋
                </h1>
                <p style={{ fontSize: '1rem', color: theme.muted, marginBottom: '48px' }}>What do you want to do today?</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '64px' }}>
                  <Card onClick={() => navigate('/create')} style={{ padding: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: theme.accentMutedBg, border: `1px solid ${theme.accentMutedBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Plus size={28} color={theme.accent} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>Create Session</h3>
                    <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6, marginBottom: '16px' }}>Start a new interview or meeting with AI-powered proctoring</p>
                    <Button>Create</Button>
                  </Card>

                  <Card hoverable={false} style={{ padding: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(121,192,255,0.1)', border: '1px solid rgba(121,192,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Link size={28} color="#79c0ff" />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>Join Session</h3>
                    <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6, marginBottom: '16px' }}>Enter a 6-character code to join an existing session</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" placeholder="ABC123" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6}
                        style={{ flex: 1, padding: '12px 16px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text, fontSize: '0.95rem', fontFamily: fonts.family, textTransform: 'uppercase' }} />
                      <Button onClick={handleJoinSession} disabled={joinCode.length !== 6}>Join</Button>
                    </div>
                  </Card>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>Recent Sessions</h2>
                    {sessions.length > 0 && (
                      <button onClick={() => setActiveTab('sessions')} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '0.9rem', fontFamily: fonts.family }}>
                        View all →
                      </button>
                    )}
                  </div>

                  {sessions.length === 0 ? (
                    <Card hoverable={false} style={{ padding: '48px', textAlign: 'center' }}>
                      <Video size={48} color={theme.muted} style={{ margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '1rem', color: theme.muted }}>No sessions yet. Create your first session to get started!</p>
                    </Card>
                  ) : (
                    <Card hoverable={false} style={{ padding: 0, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                            {['Session ID', 'Mode', 'Date', 'Status', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.slice(0, 5).map(session => (
                            <tr key={session.code} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: '16px', color: theme.text, fontFamily: 'monospace' }}>{session.code}</td>
                              <td style={{ padding: '16px', color: theme.text }}>{session.mode}</td>
                              <td style={{ padding: '16px', color: theme.muted }}>{new Date(session.createdAt).toLocaleDateString()}</td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, background: session.status === 'active' ? theme.accentMutedBg : 'rgba(139,148,158,0.1)', color: session.status === 'active' ? theme.accent : theme.muted }}>
                                  {session.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {(session.status === 'waiting' || session.status === 'active') && (
                                    <Button variant="primary" onClick={() => navigate(`/room/${session.code}`, { state: { name: user?.first_name || 'Host', role: 'host' } })}>Join</Button>
                                  )}
                                  <Button variant="outline" onClick={() => navigate(`/monitor/${session.code}`)}>View</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  )}
                </div>
              </>
            )}

            {activeTab === 'sessions' && (
              <SessionsPanel sessions={sessions} user={user} navigate={navigate} onDelete={handleDelete} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPanel sessions={sessions} />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel user={user} logout={logout} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
