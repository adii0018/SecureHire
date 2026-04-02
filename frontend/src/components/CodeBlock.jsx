import { theme } from '../theme';

export default function CodeBlock({ code, title = 'code' }) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Header bar with macOS dots */}
      <div
        style={{
          background: theme.subtleBorder,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: theme.muted }}>{title}</span>
      </div>
      
      {/* Code body */}
      <div
        style={{
          padding: '20px',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          fontSize: '14px',
          color: '#a5d6ff',
          lineHeight: '1.6',
          overflowX: 'auto',
        }}
      >
        <pre style={{ margin: 0 }}>{code}</pre>
      </div>
    </div>
  );
}
