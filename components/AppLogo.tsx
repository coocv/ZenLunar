
import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 40, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="120" height="120" rx="28" fill="url(#paint0_linear)" />
    {/* Minimalist Calendar Lines */}
    <path d="M32 42H88" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <path d="M32 68H88" stroke="white" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.5"/>
    <path d="M32 94H58" stroke="white" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.5"/>
    
    {/* Stylized Moon/Dot */}
    <circle cx="84" cy="90" r="10" fill="white" fillOpacity="0.9"/>
    
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--color-primary, #e60012)"/>
        <stop offset="1" stopColor="var(--color-accent, #ff8e93)"/>
      </linearGradient>
    </defs>
  </svg>
);
