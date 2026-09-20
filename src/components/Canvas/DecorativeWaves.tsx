import React from 'react';
import { StandConfig } from '../../types/stand';

interface DecorativeWavesProps {
  config: StandConfig;
}

export const DecorativeWaves: React.FC<DecorativeWavesProps> = ({ config }) => {
  if (!config.showWaveRibbons) return null;

  const { primaryColor, secondaryColor, darkColor, accentColor, showDotMatrices } = config;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* --- TOP HEADER WAVES (Screenshot 2 Style) --- */}
      <svg
        className="absolute top-0 left-0 w-full h-[180px]"
        viewBox="0 0 1600 180"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topWaveGrad1" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset="45%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="topWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="60%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>
          <filter id="waveShadow" x="-5%" y="-5%" width="110%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Back wave shadow layer */}
        <path
          d="M0,0 L1600,0 L1600,105 C1420,135 1250,75 1060,95 C820,120 620,155 380,125 C190,100 80,135 0,115 Z"
          fill={darkColor}
          opacity="0.35"
        />

        {/* Middle sweeping wave */}
        <path
          d="M0,0 L1600,0 L1600,85 C1380,125 1190,65 960,85 C730,105 520,140 280,115 C140,100 50,115 0,95 Z"
          fill="url(#topWaveGrad2)"
          filter="url(#waveShadow)"
        />

        {/* Front accent ribbon wave with highlights */}
        <path
          d="M0,0 L1600,0 L1600,55 C1440,95 1260,45 1080,68 C880,92 680,122 450,98 C280,80 120,95 0,72 Z"
          fill="url(#topWaveGrad1)"
        />

        {/* Dynamic thin white/accent accent crest curves */}
        <path
          d="M0,74 C120,97 280,82 450,100 C680,124 880,94 1080,70 C1260,47 1440,97 1600,57"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeOpacity="0.85"
          fill="none"
        />
        <path
          d="M0,97 C50,117 140,102 280,117 C520,142 730,107 960,87 C1190,67 1380,127 1600,87"
          stroke={accentColor}
          strokeWidth="2"
          strokeOpacity="0.6"
          fill="none"
        />
      </svg>

      {/* --- BOTTOM CORNER WAVES --- */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[105px] pointer-events-none"
        viewBox="0 0 1600 105"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="bottomWaveGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="60%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>
        </defs>

        {/* Deep background wave */}
        <path
          d="M0,105 L1600,105 L1600,45 C1460,25 1280,70 1080,45 C840,25 610,60 390,45 C210,35 90,65 0,50 Z"
          fill={darkColor}
          opacity="0.3"
        />

        {/* Middle bottom flowing ribbon */}
        <path
          d="M0,105 L1600,105 L1600,55 C1420,35 1220,75 980,55 C750,35 560,65 320,50 C160,40 70,60 0,55 Z"
          fill="url(#bottomWaveGrad2)"
          filter="url(#waveShadow)"
        />

        {/* Front bottom wave */}
        <path
          d="M0,105 L1600,105 L1600,70 C1400,50 1250,85 1020,65 C810,50 620,75 410,60 C240,50 110,75 0,65 Z"
          fill="url(#bottomWaveGrad1)"
        />

        {/* Dynamic thin white contour curve */}
        <path
          d="M0,64 C110,74 240,49 410,59 C620,74 810,49 1020,64 C1250,84 1400,49 1600,69"
          stroke="#ffffff"
          strokeWidth="3"
          strokeOpacity="0.85"
          fill="none"
        />
        <path
          d="M0,52 C70,62 160,39 320,49 C560,64 750,39 980,54 C1220,74 1420,34 1600,54"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeOpacity="0.5"
          fill="none"
        />
      </svg>

      {/* --- CIRCULAR & ARC ORNAMENTS (From Screenshot 2) --- */}
      {/* Top right circular rings */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border-[3px] border-white/20 pointer-events-none" />
      <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full border-[2px] border-rose-400/30 pointer-events-none" />

      {/* Bottom right circular accent */}
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full border-[4px] border-white/25 pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-52 h-52 rounded-full border-[2px] border-rose-300/35 pointer-events-none" />

      {/* Bottom left subtle ring */}
      <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border-[3px] border-white/20 pointer-events-none" />

      {/* --- DOT GRID MATRICES (Exact Screenshot 2 style) --- */}
      {showDotMatrices && (
        <>
          {/* Top-right dot matrix (6 columns x 4 rows) */}
          <div className="absolute top-8 right-24 w-36 h-20 bg-dot-matrix-crimson opacity-85" />

          {/* Top-left dot matrix (near university header) */}
          <div className="absolute top-12 left-8 w-32 h-16 bg-dot-matrix-crimson opacity-70" />

          {/* Center-top dot accent */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-14 bg-dot-matrix-light opacity-60" />

          {/* Bottom-left dot matrix */}
          <div className="absolute bottom-8 left-8 w-36 h-20 bg-dot-matrix-crimson opacity-80" />

          {/* Bottom-right dot matrix (near contacts/schedule) */}
          <div className="absolute bottom-10 right-16 w-36 h-20 bg-dot-matrix-crimson opacity-85" />
        </>
      )}
    </div>
  );
};
