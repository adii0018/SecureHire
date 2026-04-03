import { useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Navbar from '../components/Navbar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import PillBadge from '../components/PillBadge';
import Button from '../components/Button';
import Card from '../components/Card';
import CodeBlock from '../components/CodeBlock';
import useScrollReveal from '../hooks/useScrollReveal';
import { Eye, Users, Mic, Monitor, Clipboard, BarChart2, Lock, Video } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const howItWorksRef = useScrollReveal();
  const codeRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const features = [
    { icon: Eye, title: 'Eye Tracking', desc: 'Flags gaze deviation from screen in real time' },
    { icon: Users, title: 'Multi-Face Detection', desc: 'Instantly alerts when extra faces appear' },
    { icon: Mic, title: 'Voice Analysis', desc: 'Detects background speech or coaching audio' },
    { icon: Monitor, title: 'Tab Switch Detection', desc: 'Monitors if candidate leaves the session' },
    { icon: Clipboard, title: 'Copy-Paste Guard', desc: 'Tracks clipboard activity during the session' },
    { icon: BarChart2, title: 'Behavior Analytics', desc: 'Aggregated risk score with full timeline' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: fonts.family }}>
      <StarfieldCanvas />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        {/* Hero Section */}
        <section ref={heroRef} style={{ padding: '120px 48px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <PillBadge>AI-Powered Interview Security</PillBadge>
          
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-1px',
            margin: '24px 0',
            lineHeight: 1.1,
            color: theme.text,
          }}>
            Secure Interviews.<br />Intelligent Proctoring.
          </h1>

          <p style={{ fontSize: '1.15rem', color: theme.muted, lineHeight: 1.75, maxWidth: '600px', margin: '0 auto 32px' }}>
            Real-time AI detection for cheating behavior during online interviews. WebRTC-powered video with intelligent monitoring.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
            <Button onClick={() => navigate('/register')}>Start Interview</Button>
            <Button variant="outline">Watch Demo</Button>
          </div>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '0.85rem', color: theme.muted }}>
            <span>✓ No setup required</span>
            <span>✓ WebRTC encrypted</span>
            <span>✓ 99.8% uptime</span>
          </div>

          {/* Mock Dashboard */}
          <Card style={{ marginTop: '64px', padding: '32px', maxWidth: '900px', margin: '64px auto 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: theme.bg, padding: '16px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <div style={{ width: '100%', height: '180px', background: theme.subtleBorder, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, gap: '8px' }}>
                  <Video size={18} /> Candidate Video
                </div>
              </div>
              <div style={{ background: theme.bg, padding: '16px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: theme.muted }}>Risk Score</div>
                <div style={{ height: '12px', background: theme.subtleBorder, borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', background: theme.accent }} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.85rem' }}>
                  <div style={{ padding: '8px', background: 'rgba(46,160,67,0.1)', borderRadius: '4px', marginBottom: '8px' }}>
                    ✓ No violations detected
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(255,95,87,0.1)', borderRadius: '4px', color: '#ff5f57' }}>
                    ⚠ Tab switch detected - 14:23
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Stats Strip */}
        <section ref={statsRef} style={{
          borderTop: `1px solid ${theme.subtleBorder}`,
          borderBottom: `1px solid ${theme.subtleBorder}`,
          padding: '48px 0',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '1200px', margin: '0 auto' }}>
            {[
              { num: '10,000+', label: 'Interviews Conducted' },
              { num: '99.8%', label: 'Uptime' },
              { num: '<100ms', label: 'Latency' },
              { num: '6', label: 'Proctoring Modules' },
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center',
                borderRight: i < 3 ? `1px solid ${theme.subtleBorder}` : 'none',
                padding: '0 24px',
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>{stat.num}</div>
                <div style={{ fontSize: '0.9rem', color: theme.muted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <PillBadge>What SecureHire Detects</PillBadge>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginTop: '16px' }}>
              Comprehensive AI Monitoring
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {features.map((feature, i) => (
              <Card key={i}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: theme.accentMutedBg,
                  border: `1px solid ${theme.accentMutedBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <feature.icon size={22} color={theme.accent} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: theme.text }}>{feature.title}</h3>
                <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6 }}>{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" ref={howItWorksRef} style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <PillBadge>Simple 3-Step Process</PillBadge>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginTop: '16px' }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { num: '1', title: 'Create Session', desc: 'Generate a unique 6-character session code' },
              { num: '2', title: 'Candidate Joins', desc: 'Share the code or link with your candidate' },
              { num: '3', title: 'Monitor Live', desc: 'View real-time alerts and risk analytics' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: theme.accentMutedBg,
                  border: `2px solid ${theme.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: theme.accent,
                  margin: '0 auto 24px',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: theme.text }}>{step.title}</h3>
                <p style={{ fontSize: '0.95rem', color: theme.muted, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Code Block Section */}
        <section ref={codeRef} style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <PillBadge>Session Joining</PillBadge>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', margin: '16px 0 24px' }}>
                Simple Join Links
              </h2>
              <p style={{ fontSize: '1rem', color: theme.muted, lineHeight: 1.75, marginBottom: '16px' }}>
                Every session gets a unique 6-character code. Share the link with candidates and they can join instantly—no account required.
              </p>
              <p style={{ fontSize: '1rem', color: theme.muted, lineHeight: 1.75 }}>
                WebRTC ensures peer-to-peer encrypted connections with sub-100ms latency.
              </p>
            </div>
            <CodeBlock 
              title="join-link.txt"
              code="https://securehire.app/join/A1B2C3"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} style={{ padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
          <Card style={{
            padding: '64px',
            textAlign: 'center',
            border: `2px solid ${theme.accent}`,
            background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.bg} 100%)`,
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>
              Ready to run secure interviews?
            </h2>
            <p style={{ fontSize: '1.1rem', color: theme.muted, marginBottom: '32px' }}>
              Start monitoring candidates with AI-powered proctoring in minutes.
            </p>
            <Button onClick={() => navigate('/register')}>Create Your First Session</Button>
          </Card>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: `1px solid ${theme.subtleBorder}`,
          padding: '64px 48px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color={theme.accent} /> SecureHire
              </div>
              <p style={{ fontSize: '0.9rem', color: theme.muted, lineHeight: 1.6 }}>
                AI-powered interview security platform with real-time proctoring and WebRTC video.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', color: theme.text }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: theme.muted }}>
                <a href="#features" style={{ color: theme.muted, textDecoration: 'none' }}>Features</a>
                <a href="#pricing" style={{ color: theme.muted, textDecoration: 'none' }}>Pricing</a>
                <a href="#docs" style={{ color: theme.muted, textDecoration: 'none' }}>Documentation</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', color: theme.text }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: theme.muted }}>
                <a href="#about" style={{ color: theme.muted, textDecoration: 'none' }}>About</a>
                <a href="#blog" style={{ color: theme.muted, textDecoration: 'none' }}>Blog</a>
                <a href="#careers" style={{ color: theme.muted, textDecoration: 'none' }}>Careers</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', color: theme.text }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: theme.muted }}>
                <a href="#privacy" style={{ color: theme.muted, textDecoration: 'none' }}>Privacy</a>
                <a href="#terms" style={{ color: theme.muted, textDecoration: 'none' }}>Terms</a>
                <a href="#security" style={{ color: theme.muted, textDecoration: 'none' }}>Security</a>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: `1px solid ${theme.subtleBorder}`,
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: theme.muted,
          }}>
            <div>© 2024 SecureHire. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#twitter" style={{ color: theme.muted }}>Twitter</a>
              <a href="#github" style={{ color: theme.muted }}>GitHub</a>
              <a href="#linkedin" style={{ color: theme.muted }}>LinkedIn</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Inject pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46,160,67,0.5); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
      `}</style>
    </div>
  );
}