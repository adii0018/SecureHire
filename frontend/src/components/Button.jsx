import { theme } from '../theme';
import { useState } from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  disabled = false,
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const variants = {
    primary: {
      background: theme.accent,
      color: '#fff',
      ...(isHovered && !disabled && {
        background: theme.accentHover,
        boxShadow: '0 0 0 3px rgba(46,160,67,0.2)',
        transform: 'translateY(-1px)',
      }),
    },
    outline: {
      background: 'transparent',
      border: `1px solid ${theme.border}`,
      color: theme.text,
      ...(isHovered && !disabled && {
        background: theme.surface,
      }),
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
}
