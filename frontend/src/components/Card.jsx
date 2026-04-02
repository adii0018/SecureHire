import { theme } from '../theme';
import { useState } from 'react';

export default function Card({ children, hoverable = true, style = {}, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverable && isHovered && {
          borderColor: '#484f58',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
