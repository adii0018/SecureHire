import { theme } from '../theme';

export default function RiskGauge({ score = 0 }) {
  const getColor = () => {
    if (score < 40) return theme.accent;
    if (score < 70) return '#febc2e';
    return '#ff5f57';
  };

  const getLabel = () => {
    if (score < 40) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>
          Risk Score
        </span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: getColor() }}>
          {score}
        </span>
      </div>

      <div style={{
        height: '12px',
        background: theme.subtleBorder,
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          background: getColor(),
          transition: 'all 0.3s ease',
        }} />
      </div>

      <div style={{
        fontSize: '0.85rem',
        color: theme.muted,
        textAlign: 'center',
      }}>
        {getLabel()}
      </div>
    </div>
  );
}
