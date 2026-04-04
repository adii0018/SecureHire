import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../api/axios';
import { Lock } from 'lucide-react';

export default function Join() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    // Fetch session info
    api.get(`/sessions/${code}/`)
      .then(res => setSessionInfo(res.data))
      .catch(err => {
        console.error('Session not found:', err);
        alert('Session not found or has ended');
        navigate('/');
      });
  }, [code, navigate]);

  const handleJoin = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      // Join the session
      navigate(`/room/${code}`, { state: { name, role: 'candidate' } });
    } catch (err) {
      console.error('Failed to join session:', err);
      alert('Failed to join session. Please try again.');
      setLoading(false);
    }
  };

  if (!sessionInfo) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, fontFamily: fonts.family, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StarfieldCanvas />
        <div style={{ position: 'relative', zIndex: 1, color: theme.text }}>Loading...</div>
      </div>
    );
  }

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
        <Card style={{ maxWidth: '500px', width: '100%', padding: '48px', textAlign: 'center' }} hoverable={false}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Lock size={48} color={theme.accent} />
          </div>
          
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
            You're invited to join
          </h1>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: theme.accentMutedBg,
            border: `1px solid ${theme.accentMutedBorder}`,
            borderRadius: '20px',
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            color: theme.accent,
            letterSpacing: '0.1em',
            marginBottom: '32px',
          }}>
            {code}
          </div>

          <p style={{ fontSize: '0.95rem', color: theme.muted, marginBottom: '32px', lineHeight: 1.6 }}>
            {sessionInfo.title || `${sessionInfo.mode} Session`}
          </p>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: theme.text, textAlign: 'left' }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
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
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <Button onClick={handleJoin} disabled={loading || !name.trim()} style={{ width: '100%', marginBottom: '16px' }}>
            {loading ? 'Joining...' : 'Join Session'}
          </Button>

          <p style={{ fontSize: '0.85rem', color: theme.muted, lineHeight: 1.5 }}>
            Make sure your camera and microphone are enabled
          </p>
        </Card>
      </div>
    </div>
  );
}
