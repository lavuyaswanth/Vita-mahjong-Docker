import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  inline?: boolean;
}

// Gold gradient definition to reuse across icons
const GoldGradient: React.FC = () => (
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fff2a3" />
      <stop offset="30%" stopColor="#ffd700" />
      <stop offset="70%" stopColor="#c59f27" />
      <stop offset="100%" stopColor="#8c6a07" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#ff4d6d" />
      <stop offset="50%" stopColor="#c9184a" />
      <stop offset="100%" stopColor="#800f2f" />
    </linearGradient>
  </defs>
);

const inlineStyle = (size: number, inline?: boolean): React.CSSProperties => {
  if (inline) {
    return {
      display: 'inline-block',
      verticalAlign: 'middle',
      width: size,
      height: size,
      marginRight: '6px',
    };
  }
  return {
    width: size,
    height: size,
    display: 'block',
  };
};

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
    />
  </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"
    />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      stroke="url(#goldGrad)"
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
    />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="12" cy="12" r="10" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
    <path fill="url(#goldGrad)" d="M10 8.5v7l6-3.5-6-3.5z" />
  </svg>
);

export const UndoIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="none"
      stroke="url(#goldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.5 8H5.25L9 4.25 M12.5 8C16.5 8 19.5 10 19.5 14C19.5 18 15.5 19.5 12.5 19.5c-3 0-6.5-1.5-6.5-4"
    />
  </svg>
);

export const MagnetIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Horseshoe magnet that pulls tiles back out of the tray */}
    <path
      fill="none"
      stroke="url(#goldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 4v7a6 6 0 0 0 12 0V4 M6 4H3.2v7 M18 4h2.8v7"
    />
    <path stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" d="M3.2 13.5H6 M18 13.5h2.8" />
  </svg>
);

export const HintIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 32 32" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Chinese Paper Lantern - Super Premium hint icon */}
    <rect x="15" y="2" width="2" height="4" fill="url(#goldGrad)" />
    <ellipse cx="16" cy="16" rx="9" ry="8" fill="url(#redGrad)" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <line x1="16" y1="8" x2="16" y2="24" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="2,2" />
    <path d="M12 9 C15 11, 15 21, 12 23" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" opacity="0.6" />
    <path d="M20 9 C17 11, 17 21, 20 23" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" opacity="0.6" />
    {/* Lantern Top & Bottom caps */}
    <rect x="12" y="6" width="8" height="2.5" rx="1" fill="url(#goldGrad)" />
    <rect x="12" y="23.5" width="8" height="2.5" rx="1" fill="url(#goldGrad)" />
    {/* Tassel */}
    <path d="M16 26 L16 30 M15 29 L15 30.5 M17 29 L17 30.5" stroke="url(#goldGrad)" strokeWidth="1.2" />
  </svg>
);

export const ShuffleIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="none"
      stroke="url(#goldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 3h5v5 M4 20l7-7 M21 3L4 20 M13 11l8 8 M16 21h5v-5"
    />
  </svg>
);

export const RestartIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="none"
      stroke="url(#goldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-1.19"
    />
  </svg>
);

export const EarnedStampIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 36 36" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Gorgeous Imperial Wax Seal with double flower outline */}
    <circle cx="18" cy="18" r="16" fill="url(#redGrad)" stroke="#ff4d6d" strokeWidth="1.2" />
    <circle cx="18" cy="18" r="13" fill="none" stroke="#ff85a1" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Carved Cherry blossom center */}
    <g transform="translate(18, 18)" fill="none" stroke="#ffe5ec" strokeWidth="1.5">
      {Array.from({ length: 5 }).map((_, idx) => (
        <path
          key={idx}
          d="M 0 0 C -4 -7, -2 -11, 0 -11 C 2 -11, 4 -7, 0 0"
          transform={`rotate(${idx * 72})`}
        />
      ))}
      <circle cx="0" cy="0" r="2" fill="#ffe5ec" />
    </g>
  </svg>
);

export const LayoutIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Geometric tiles layout shape */}
    <rect x="3" y="3" width="6" height="8" rx="1.5" fill="none" stroke="url(#goldGrad)" strokeWidth="1.8" />
    <rect x="15" y="3" width="6" height="8" rx="1.5" fill="none" stroke="url(#goldGrad)" strokeWidth="1.8" />
    <rect x="9" y="13" width="6" height="8" rx="1.5" fill="none" stroke="url(#goldGrad)" strokeWidth="1.8" />
    <rect x="9" y="6" width="6" height="8" rx="1.5" fill="url(#goldGrad)" opacity="0.4" />
  </svg>
);

export const AccessibilityIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="12" cy="12" r="10" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
    <path
      fill="url(#goldGrad)"
      d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 5h-6v8h-2v-6h-2v6H9v-8H3V9h18v2z"
    />
  </svg>
);

export const AudioIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
    />
  </svg>
);

export const ResetZoomIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="12" cy="12" r="8" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="url(#goldGrad)" />
    <line x1="12" y1="1" x2="12" y2="4" stroke="url(#goldGrad)" strokeWidth="2" />
    <line x1="12" y1="20" x2="12" y2="23" stroke="url(#goldGrad)" strokeWidth="2" />
    <line x1="1" y1="12" x2="4" y2="12" stroke="url(#goldGrad)" strokeWidth="2" />
    <line x1="20" y1="12" x2="23" y2="12" stroke="url(#goldGrad)" strokeWidth="2" />
  </svg>
);

export const ZoomInIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="11" cy="11" r="7" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
    <line x1="21" y1="21" x2="16" y2="16" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="11" y1="8" x2="11" y2="14" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="11" x2="14" y2="11" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ZoomOutIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="11" cy="11" r="7" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
    <line x1="21" y1="21" x2="16" y2="16" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="8" y1="11" x2="14" y2="11" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

