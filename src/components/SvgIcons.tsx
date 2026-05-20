import React from 'react';

export interface IconProps {
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
    <linearGradient id="jadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#a3f5b9" />
      <stop offset="40%" stopColor="#2ec4b6" />
      <stop offset="100%" stopColor="#0f4c43" />
    </linearGradient>
    <linearGradient id="ivoryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#ebdcb9" />
    </linearGradient>
    <filter id="carvedShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.6" />
    </filter>
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

export const BrainIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 64 64" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="32" cy="32" r="28" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
    <path
      fill="url(#goldGrad)"
      d="M32 14c-8.8 0-16 7.2-16 16 0 4.2 1.6 8 4.3 10.9.7.8.9 1.9.5 2.9l-1.3 3.3c-.3.8.3 1.7 1.2 1.5l3.5-.7c1-.2 2.1 0 2.8.7C30 50.8 33.9 52 38 52c8.8 0 16-7.2 16-16s-7.2-16-16-16zm-3 8c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1zm-6 4c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1s-1-.4-1-1v-4c0-.6.4-1 1-1zm18 12c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"
      opacity="0.95"
    />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"
    />
  </svg>
);

export const TileIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Miniature 3D Tiles stack */}
    {/* Back tile */}
    <rect x="8" y="2" width="10" height="13" rx="2" fill="url(#jadeGrad)" stroke="url(#goldGrad)" strokeWidth="1" />
    <rect x="9" y="3" width="8" height="11" rx="1" fill="url(#ivoryGrad)" />
    <circle cx="13" cy="8" r="2" fill="#c9184a" />
    {/* Front tile offset */}
    <rect x="3" y="7" width="10" height="13" rx="2" fill="url(#jadeGrad)" stroke="url(#goldGrad)" strokeWidth="1.2" />
    <rect x="4" y="8" width="8" height="11" rx="1" fill="url(#ivoryGrad)" />
    <path d="M 6 13 L 6 15 M 10 13 L 10 15" stroke="#2ec4b6" strokeWidth="1.2" />
    <circle cx="8" cy="11" r="1.5" fill="#c9184a" />
  </svg>
);

export const MatchIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Interlocking infinity knot design representing harmony & match */}
    <path
      fill="none"
      stroke="url(#goldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      d="M7 9c-2.33 0-3 1.67-3 3s.67 3 3 3 3-1.67 3-3V9c0-1.33.67-3 3-3s3 1.67 3 3v6c0 1.33-.67 3-3 3s-3-1.67-3-3"
    />
    <circle cx="7" cy="12" r="1.5" fill="url(#goldGrad)" />
    <circle cx="17" cy="12" r="1.5" fill="url(#goldGrad)" />
  </svg>
);

export const TimerIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6v6h12v-6h-.01L18 16l-4-4 4-4-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM8 8V4h8v4l-4 4-4-4z"
    />
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

export const EmptyStampIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 36 36" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(201, 168, 76, 0.3)" strokeWidth="1.5" strokeDasharray="4,3" />
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

export const ClassicTileStyleIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Red classic character '中' */}
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#fffef5" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <path d="M 7 8 L 17 8 L 17 14 L 7 14 Z M 12 4 L 12 20" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const LargePrintStyleIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Western High Contrast Letter 'A' */}
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#fffef5" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="900" fill="#1565c0" fontFamily="sans-serif">A</text>
  </svg>
);

export const NatureStyleIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Relaxing Nature Bamboo sprig */}
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#fffef5" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <path d="M 8 18 L 16 6 M 12 12 Q 17 11 15 8 M 12 12 Q 7 13 9 16" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

export const ModernPopStyleIcon: React.FC<IconProps> = ({ size = 24, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    {/* Glossy neon pop diamond */}
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#12131a" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <path d="M 12 4 L 19 11 L 12 18 L 5 11 Z" fill="none" stroke="#00e5ff" strokeWidth="1.8" />
    <circle cx="12" cy="11" r="2.5" fill="#ff007f" />
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

export const ZenGardenIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M10 21V15c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1zm0-9V5c0-.55-.45-1-1-1s-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1zm6 9V12c0-.55-.45-1-1-1s-1 .45-1 1v9c0 .55.45 1 1 1s1-.45 1-1zm0-12V3c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1zm-9.3-5.7c.36.42.4.98.1 1.4L4.2 11c-.3.42-.9.5-1.32.2-.42-.3-.5-.9-.2-1.32l2.6-3.7c.3-.42.9-.5 1.32-.2zm1.6 7c.36.42.4.98.1 1.4l-2.6 3.7c-.3.42-.9.5-1.32.2-.42-.3-.5-.9-.2-1.32l2.6-3.7c.3-.42.9-.5 1.32-.2zm9-3.7c.42-.3.5-.9.2-1.32L15.6 2.6c-.3-.42-.9-.5-1.32-.2-.42.3-.5.9-.2 1.32l2.6 3.7c.3.42.9.5 1.32.2zm1.6 7c.42-.3.5-.9.2-1.32l-2.6-3.7c-.3-.42-.9-.5-1.32-.2-.42.3-.5.9-.2 1.32l2.6 3.7c.3.42.9.5 1.32.2z"
    />
  </svg>
);

export const OceanIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M21 16.5c-1.3 0-2.4-.6-3.2-1.5c-.8.9-1.9 1.5-3.2 1.5s-2.4-.6-3.2-1.5c-.8.9-1.9 1.5-3.2 1.5s-2.4-.6-3.2-1.5c-.2-.2-.2-.5 0-.7s.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0s.2.5 0 .7c-.8.9-1.9 1.5-3.2 1.5zm0-4.5c-1.3 0-2.4-.6-3.2-1.5c-.8.9-1.9 1.5-3.2 1.5s-2.4-.6-3.2-1.5c-.8.9-1.9 1.5-3.2 1.5s-2.4-.6-3.2-1.5c-.2-.2-.2-.5 0-.7s.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0c.6.7 1.6 1.2 2.5 1.2s1.9-.5 2.5-1.2c.2-.2.5-.2.7 0s.2.5 0 .7c-.8.9-1.9 1.5-3.2 1.5z"
    />
  </svg>
);

export const AmberWoodIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M19 15.5l-6-3.5l6-3.5c.48-.28.64-.9.36-1.38c-.28-.48-.9-.64-1.38-.36L12 10.3L6.02 6.8c-.48-.28-1.1-.12-1.38.36c-.28.48-.12 1.1.36 1.38l6 3.5l-6 3.5c-.48.28-.64.9-.36 1.38c.2.34.56.52.92.52c.16 0 .32-.04.46-.12L12 13.8l5.98 3.5c.14.08.3.12.46.12c.36 0 .72-.18.92-.52c.28-.48.12-1.1-.36-1.38z M12 6c0 2 2 3.5 2 5.5s-2 3-2 3s-2-1-2-3s2-3.5 2-5.5z"
    />
  </svg>
);

export const HealingDarkIcon: React.FC<IconProps> = ({ size = 20, className, inline }) => (
  <svg viewBox="0 0 24 24" className={className} style={inlineStyle(size, inline)}>
    <GoldGradient />
    <path
      fill="url(#goldGrad)"
      d="M12.3 22c-5.5 0-10-4.5-10-10C2.3 6.7 6.6 2.4 12 2.3c.3 0 .6.2.7.5c.1.3 0 .7-.3.9c-3.1 2.3-4.6 6.3-3.7 10.2c.9 3.8 4.1 6.7 8 7.2c.3 0 .6.3.6.6c0 .3-.2.6-.5.7c-1.5.5-3 .8-4.5.8zm-1-17.7c-3.7.8-6.3 4.1-6.3 7.9c0 4.4 3.6 8 8 8c1 0 2-.2 2.9-.6c-3.3-1.5-5.3-5-4.9-8.7c.3-3.1 2.3-5.7 5.3-6.6z M19 4.5l.5.9.9.5l-.9.5l-.5.9l-.5-.9l-.9-.5l.9-.5z M21.5 9.5l.3.6l.6.3l-.6.3l-.3.6l-.3-.6l-.6-.3l.6-.3z"
    />
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

