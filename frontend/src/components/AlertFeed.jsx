import { theme } from '../theme';
import { Eye, Users, Mic, Monitor, Clipboard, AlertTriangle, CheckCircle } from 'lucide-react';

const alertIcons = {
  eye_deviation: Eye,
  extra_face: Users,
  voice_detected: Mic,
  tab_switch: Monitor,
  copy_paste: Clipboard,
};

const DefaultIcon = AlertTriangle;

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <CheckCircle size={14} /> No violations detected
          </div>
        ) : (
          alerts.map((alert, index) => {
            const Icon = alertIcons[alert.type] || DefaultIcon;
            return (
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
                  <Icon size={14} />
                  <span style={{ fontWeight: 600 }}>{alert.message}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.muted }}>
                  {alert.timestamp}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
