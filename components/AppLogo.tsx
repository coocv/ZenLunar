
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
    
    {/* Modern Abstract Calendar Lines - Thicker & Bolder */}
    <path d="M30 40H90" stroke="white" strokeWidth="11" strokeLinecap="round"/>
    <path d="M30 65H90" stroke="white" strokeWidth="11" strokeLinecap="round" strokeOpacity="0.6"/>
    <path d="M30 90H60" stroke="white" strokeWidth="11" strokeLinecap="round" strokeOpacity="0.6"/>
    
    {/* Accent Dot (Sun/Moon/Focus) */}
    <circle cx="82" cy="90" r="8" fill="white"/>
    
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--color-primary, #e60012)"/>
        <stop offset="1" stopColor="var(--color-accent, #fbbf24)"/>
      </linearGradient>
    </defs>
  </svg>
);
