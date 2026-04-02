import { useRef, useEffect } from 'react';
import { theme } from '../theme';

export default function VideoTile({ stream, name, muted = false, riskScore = 0, style = {} }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getRiskColor = () => {
    if (riskScore < 40) return theme.accent;
    if (riskScore < 70) return '#febc2e';
    return '#ff5f57';
  };

  return (
    <div style={{
      position: 'relative',
      background: theme.bg,
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${theme.border}`,
      ...style,
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Name overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        padding: '6px 12px',
        background: 'rgba(13,17,23,0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: theme.text,
      }}>
        {name}
      </div>

      {/* Risk badge */}
      {riskScore > 0 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 12px',
          background: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: getRiskColor(),
          border: `1px solid ${getRiskColor()}`,
        }}>
          Risk: {riskScore}
        </div>
      )}
    </div>
  );
}
