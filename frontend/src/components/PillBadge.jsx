import { theme } from '../theme';

export default function PillBadge({ children, showDot = true }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(46,160,67,0.1)',
        border: '1px solid rgba(46,160,67,0.3)',
        color: '#3fb950',
        borderRadius: '20px',
        padding: '4px 14px',
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 600,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: theme.accent,
            animation: 'pulse 2s infinite',
          }}
        />
      )}
      {children}
    </div>
  );
}
