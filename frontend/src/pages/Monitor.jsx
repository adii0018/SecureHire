import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import VideoTile from '../components/VideoTile';
import api from '../api/axios';

export default function Monitor() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Fetch session details
    api.get(`/sessions/${code}/`)
      .then(res => setSession(res.data))
      .catch(err => {
        console.error('Failed to fetch session:', err);
        navigate('/dashboard');
      });

    // Fetch alerts
    api.get(`/alerts/${code}/`)
      .then(res => setAlerts(res.data))
      .catch(err => console.error('Failed to fetch alerts:', err));
  }, [code, navigate]);

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

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: fonts.family,
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
              Monitoring Dashboard
            </h1>
            <p style={{ fontSize: '0.95rem', color: theme.muted }}>
              Session: {code} • {session.mode} Mode
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Participants', value: participants.length || 0 },
            { label: 'Active Alerts', value: alerts.filter(a => a.active).length || 0 },
            { label: 'Duration', value: '00:00' },
            { label: 'Overall Risk', value: 'Low' },
          ].map((stat, i) => (
            <Card key={i} hoverable={false} style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: theme.muted }}>
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Video Grid */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
              Participants
            </h2>
            
            {participants.length === 0 ? (
              <Card hoverable={false} style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                <p style={{ color: theme.muted }}>No participants have joined yet</p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {participants.map((participant, i) => (
                  <VideoTile
                    key={i}
                    stream={null}
                    name={participant.name}
                    riskScore={participant.riskScore || 0}
                    style={{ height: '280px' }}
                  />
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
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: theme.muted,
                  }}>
                    No alerts yet
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: theme.text,
                        marginBottom: '4px',
                      }}>
                        {alert.alertType}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme.muted }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
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
