import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import VideoTile from '../components/VideoTile';
import api from '../api/axios';
import { Users } from 'lucide-react';

function formatDuration(startedAt) {
  if (!startedAt) return '00:00';
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Monitor() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [duration, setDuration] = useState('00:00');
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const fetchData = async () => {
    try {
      const [sessionRes, alertsRes] = await Promise.all([
        api.get(`/sessions/${code}/`),
        api.get(`/alerts/${code}/`),
      ]);
      setSession(sessionRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Failed to fetch monitor data:', err);
      if (err.response?.status === 404) {
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    fetchData();

    // Poll every 5 seconds for real-time updates
    pollRef.current = setInterval(fetchData, 5000);

    // Duration timer
    timerRef.current = setInterval(() => {
      setSession(prev => {
        if (prev?.startedAt) setDuration(formatDuration(prev.startedAt));
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [code]);

  // Update duration when session loads
  useEffect(() => {
    if (session?.startedAt) {
      setDuration(formatDuration(session.startedAt));
    }
  }, [session?.startedAt]);

  const handleEndSession = async () => {
    try {
      await api.post(`/sessions/${code}/end/`);
      setSession(prev => ({ ...prev, status: 'ended' }));
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const overallRisk = alerts.length === 0 ? 'Low'
    : alerts.length < 3 ? 'Medium' : 'High';

  const riskColor = overallRisk === 'Low' ? theme.accent
    : overallRisk === 'Medium' ? '#febc2e' : '#ff5f57';

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.text,
        fontFamily: fonts.family,
      }}>
        Loading...
      </div>
    );
  }

  const participants = session.participants || [];

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: fonts.family, padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
              Monitoring Dashboard
            </h1>
            <p style={{ fontSize: '0.95rem', color: theme.muted }}>
              Session: {code} • {session.mode} Mode •{' '}
              <span style={{
                padding: '2px 10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: session.status === 'active' ? theme.accentMutedBg : 'rgba(139,148,158,0.1)',
                color: session.status === 'active' ? theme.accent : theme.muted,
              }}>
                {session.status}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {session.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleEndSession}
                style={{ background: '#ff5f57', color: '#fff', border: 'none' }}
              >
                End Session
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Participants', value: participants.length },
            { label: 'Total Alerts', value: alerts.length },
            { label: 'Duration', value: duration },
            { label: 'Overall Risk', value: overallRisk, color: riskColor },
          ].map((stat, i) => (
            <Card key={i} hoverable={false} style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color || theme.text, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: theme.muted }}>{stat.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Participants */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
              Participants
            </h2>

            {participants.length === 0 ? (
              <Card hoverable={false} style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <Users size={48} color={theme.muted} />
                </div>
                <p style={{ color: theme.muted }}>No participants have joined yet</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {participants.map((p, i) => (
                  <Card key={i} hoverable={false} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: theme.accentMutedBg,
                      border: `1px solid ${theme.accentMutedBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.accent,
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.text }}>{p.name}</div>
                      <div style={{ fontSize: '0.85rem', color: theme.muted, textTransform: 'capitalize' }}>{p.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: theme.accentMutedBg,
                        color: theme.accent,
                      }}>
                        Active
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Alert Feed */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
              Alert Feed
            </h2>

            <Card hoverable={false} style={{ padding: '20px' }}>
              <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: theme.muted }}>
                    No alerts yet
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div key={i} style={{
                      padding: '12px',
                      background: 'rgba(255,95,87,0.08)',
                      border: '1px solid rgba(255,95,87,0.25)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ff5f57', marginBottom: '4px' }}>
                        {alert.alertType?.replace(/_/g, ' ')}
                      </div>
                      {alert.participantId && (
                        <div style={{ fontSize: '0.8rem', color: theme.muted, marginBottom: '2px' }}>
                          {alert.participantId}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: theme.muted }}>
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
