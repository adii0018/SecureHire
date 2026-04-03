import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import StarfieldCanvas from '../components/StarfieldCanvas';
import Button from '../components/Button';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import api from '../api/axios';
import { Code2, Users, CheckCircle } from 'lucide-react';

export default function CreateSession() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('');
  const [config, setConfig] = useState({
    title: '',
    eyeTracking: true,
    multiFace: true,
    voiceDetection: true,
    tabSwitch: true,
    copyPaste: true,
    riskThreshold: 'medium',
  });
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'meeting') {
      // Skip config for meeting mode
      createSession(selectedMode, {});
    } else {
      setStep(2);
    }
  };

  const createSession = async (sessionMode, sessionConfig) => {
    setLoading(true);
    try {
      const response = await api.post('/sessions/create/', {
        mode: sessionMode,
        title: sessionConfig.title || `${sessionMode} Session`,
        config: sessionMode === 'interview' ? sessionConfig : {},
      });
      setSessionCode(response.data.code);
      setStep(3);
    } catch (err) {
      console.error('Failed to create session:', err);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSubmit = () => {
    createSession(mode, config);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, fontFamily: fonts.family }}>
      <StarfieldCanvas />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        padding: '48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <Button variant="outline" onClick={() => navigate('/dashboard')} style={{ marginBottom: '24px' }}>
              ← Back to Dashboard
            </Button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>
              Create New Session
            </h1>
            <p style={{ fontSize: '1rem', color: theme.muted }}>
              Step {step} of 3
            </p>
          </div>

          {/* Step 1: Choose Mode */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <PillBadge>Choose Mode</PillBadge>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: theme.text, marginTop: '16px' }}>
                  What type of session do you want to create?
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <Card onClick={() => handleModeSelect('interview')} style={{ padding: '32px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: theme.accentMutedBg,
                    border: `1px solid ${theme.accentMutedBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Code2 size={32} color={theme.accent} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
                    Interview Mode (1:1)
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6 }}>
                    Secure one-on-one interviews with AI-powered proctoring and real-time monitoring
                  </p>
                </Card>

                <Card onClick={() => handleModeSelect('meeting')} style={{ padding: '32px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: 'rgba(121,192,255,0.1)',
                    border: '1px solid rgba(121,192,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Users size={32} color="#79c0ff" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
                    Meeting Mode (1:Many)
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6 }}>
                    Scalable group video conferencing for team meetings and presentations
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Configure Session */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <PillBadge>Configure Proctoring</PillBadge>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: theme.text, marginTop: '16px' }}>
                  Customize your interview settings
                </h2>
              </div>

              <Card hoverable={false} style={{ padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="e.g., Frontend Developer Interview"
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

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
                    Proctoring Features
                  </h3>

                  {[
                    { key: 'eyeTracking', label: 'Eye Tracking', desc: 'Monitor gaze direction and screen focus' },
                    { key: 'multiFace', label: 'Multi-Face Detection', desc: 'Alert when multiple people are detected' },
                    { key: 'voiceDetection', label: 'Voice Detection', desc: 'Detect background speech or coaching' },
                    { key: 'tabSwitch', label: 'Tab Switch Detection', desc: 'Track when candidate leaves the session' },
                    { key: 'copyPaste', label: 'Copy-Paste Detection', desc: 'Monitor clipboard activity' },
                  ].map((feature) => (
                    <div key={feature.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      marginBottom: '12px',
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: theme.text, marginBottom: '4px' }}>
                          {feature.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: theme.muted }}>
                          {feature.desc}
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                        <input
                          type="checkbox"
                          checked={config[feature.key]}
                          onChange={(e) => setConfig({ ...config, [feature.key]: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: config[feature.key] ? theme.accent : theme.border,
                          borderRadius: '24px',
                          transition: '0.3s',
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: config[feature.key] ? '26px' : '3px',
                            bottom: '3px',
                            background: '#fff',
                            borderRadius: '50%',
                            transition: '0.3s',
                          }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>
                    Risk Threshold
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfig({ ...config, riskThreshold: level })}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: config.riskThreshold === level ? theme.accentMutedBg : theme.bg,
                          border: `1px solid ${config.riskThreshold === level ? theme.accent : theme.border}`,
                          borderRadius: '8px',
                          color: config.riskThreshold === level ? theme.accent : theme.text,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontFamily: fonts.family,
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleConfigSubmit} disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Creating...' : 'Create Session'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Session Created */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle size={64} color={theme.accent} />
              </div>
                <PillBadge>Session Created</PillBadge>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: theme.text, marginTop: '16px' }}>
                  Your session is ready!
                </h2>
              </div>

              <Card hoverable={false} style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600, color: theme.muted }}>
                    Session Code
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: theme.bg,
                    border: `2px solid ${theme.accent}`,
                    borderRadius: '12px',
                  }}>
                    <div style={{
                      flex: 1,
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: theme.accent,
                      letterSpacing: '0.1em',
                      textAlign: 'center',
                    }}>
                      {sessionCode}
                    </div>
                    <Button onClick={() => copyToClipboard(sessionCode)}>
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600, color: theme.muted }}>
                    Shareable Link
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      flex: 1,
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                      color: theme.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {window.location.origin}/join/{sessionCode}
                    </div>
                    <Button onClick={() => copyToClipboard(`${window.location.origin}/join/${sessionCode}`)}>
                      Copy
                    </Button>
                  </div>
                </div>
              </Card>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate(`/room/${sessionCode}`)} style={{ flex: 1 }}>
                  Start Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
