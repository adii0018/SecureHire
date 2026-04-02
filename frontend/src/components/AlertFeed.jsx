import { theme } from '../theme';

const alertIcons = {
  eye_deviation: '👁️',
  extra_face: '🧑‍🤝‍🧑',
  voice_detected: '🎤',
  tab_switch: '🖥️',
  copy_paste: '📋',
};

export default function AlertFeed({ alerts = [] }) {
  return (
    <div>
      <h3 style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        color: theme.text,
        marginBottom: '12px',
      }}>
        Active Alerts
      </h3>

      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {alerts.length === 0 ? (
          <div style={{
            padding: '16px',
            background: theme.accentMutedBg,
            border: `1px solid ${theme.accentMutedBorder}`,
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: theme.accent,
            textAlign: 'center',
          }}>
            ✓ No violations detected
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'rgba(255,95,87,0.1)',
                border: '1px solid rgba(255,95,87,0.3)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#ff5f57',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>{alertIcons[alert.type] || '⚠️'}</span>
                <span style={{ fontWeight: 600 }}>{alert.message}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.muted }}>
                {alert.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
