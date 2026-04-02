import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Button from './Button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(13,17,23,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme.subtleBorder}` : 'none',
        fontFamily: fonts.family,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: theme.text,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔐 SecureHire
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="#features" style={{ color: theme.muted, textDecoration: 'none', fontSize: '0.95rem' }}>
          Features
        </a>
        <a href="#how-it-works" style={{ color: theme.muted, textDecoration: 'none', fontSize: '0.95rem' }}>
          How it Works
        </a>
        <a href="#pricing" style={{ color: theme.muted, textDecoration: 'none', fontSize: '0.95rem' }}>
          Pricing
        </a>
        <a href="#docs" style={{ color: theme.muted, textDecoration: 'none', fontSize: '0.95rem' }}>
          Docs
        </a>
      </div>

      {/* CTA Button */}
      <Button onClick={() => navigate('/register')}>Get Started Free</Button>
    </nav>
  );
}
