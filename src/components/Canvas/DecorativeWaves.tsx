import React from 'react';
import { StandConfig } from '../../types/stand';

interface DecorativeWavesProps {
  config: StandConfig;
  sheetHeight?: number;
}

export const DecorativeWaves: React.FC<DecorativeWavesProps> = ({ config, sheetHeight }) => {
  if (!config.showWaveRibbons) return null;

  const {
    primaryColor = '#BD1818',
    secondaryColor = '#9E1010',
    darkColor = '#6E0808',
    accentColor = '#E02626',
    showDotMatrices = true,
    showCenterRibbons = true,
    patternIntensity = 'vibrant',
  } = config;

  // Proportional height scaling for adapted multi-page sheets
  const heightRatio = Math.min(1, (sheetHeight || 1131) / 1131);
  const topWaveHeight = Math.max(90, Math.round(220 * heightRatio));
  const bottomWaveHeight = Math.max(70, Math.round(155 * heightRatio));

  // Multiplier for opacities based on pattern intensity
  const opacityMult = patternIntensity === 'vibrant' ? 1.0 : patternIntensity === 'subtle' ? 0.55 : 0.8;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* =========================================================================
          1. FULL-CANVAS MID-SECTION FLOWING RIBBONS (Passes directly behind teacher cards)
         ========================================================================= */}
      {showCenterRibbons && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1600 1131"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Mid canvas soft flowing gradients */}
            <linearGradient id="midRibbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.22 * opacityMult} />
              <stop offset="50%" stopColor={primaryColor} stopOpacity={0.16 * opacityMult} />
              <stop offset="100%" stopColor={darkColor} stopOpacity={0.06 * opacityMult} />
            </linearGradient>

            <linearGradient id="midRibbonGrad2" x1="100%" y1="20%" x2="0%" y2="80%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.2 * opacityMult} />
              <stop offset="60%" stopColor={secondaryColor} stopOpacity={0.12 * opacityMult} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
            </linearGradient>

            <linearGradient id="sideSwooshGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.28 * opacityMult} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>

            <linearGradient id="rightSwooshGrad" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor={darkColor} stopOpacity={0.3 * opacityMult} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Large diagonal sweeping ribbon from top-right crossing behind cards to bottom-left */}
          <path
            d="M1600,180 C1350,260 1100,220 850,380 C600,540 450,750 0,820 L0,960 C480,900 680,680 950,520 C1220,360 1420,380 1600,290 Z"
            fill="url(#midRibbonGrad1)"
          />

          {/* Secondary counter-wave sweeping across the lower-center */}
          <path
            d="M0,320 C320,360 550,500 820,490 C1120,480 1360,620 1600,710 L1600,840 C1320,740 1080,590 780,610 C480,630 280,480 0,440 Z"
            fill="url(#midRibbonGrad2)"
          />

          {/* Left side arc entering the cards area */}
          <path
            d="M0,380 C180,420 260,560 210,720 C160,860 70,910 0,940 Z"
            fill="url(#sideSwooshGrad)"
          />

          {/* Right side arc entering the cards area */}
          <path
            d="M1600,420 C1420,460 1340,600 1390,750 C1430,860 1520,910 1600,940 Z"
            fill="url(#rightSwooshGrad)"
          />

          {/* Dynamic white accent contour curves passing behind the cards */}
          <path
            d="M0,440 C320,480 620,680 920,520 C1220,360 1440,420 1600,310"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeOpacity={0.7 * opacityMult}
            fill="none"
          />
          <path
            d="M0,820 C420,760 680,540 980,380 C1260,220 1450,280 1600,200"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeOpacity={0.45 * opacityMult}
            fill="none"
          />
          <path
            d="M1600,740 C1340,650 1100,510 800,530 C500,550 250,420 0,360"
            stroke={accentColor}
            strokeWidth="2"
            strokeOpacity={0.35 * opacityMult}
            strokeDasharray="8 6"
            fill="none"
          />
        </svg>
      )}

      {/* =========================================================================
          2. TOP HEADER WAVES (Screenshot 2 Style with exact IEM #BD1818 depth)
         ========================================================================= */}
      <svg
        style={{ height: `${topWaveHeight}px` }}
        className="absolute top-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1600 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topWaveGrad1" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset="40%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
          <linearGradient id="topWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="55%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>
          <filter id="waveShadow" x="-5%" y="-5%" width="110%" height="135%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Deep back wave layer dipping lower into content */}
        <path
          d="M0,0 L1600,0 L1600,135 C1410,180 1240,95 1040,125 C790,160 590,205 350,165 C170,135 70,175 0,150 Z"
          fill={darkColor}
          opacity="0.45"
        />

        {/* Middle sweeping wave */}
        <path
          d="M0,0 L1600,0 L1600,105 C1360,155 1170,80 940,110 C700,138 490,185 250,150 C120,130 40,150 0,125 Z"
          fill="url(#topWaveGrad2)"
          filter="url(#waveShadow)"
        />

        {/* Front accent ribbon wave with highlights */}
        <path
          d="M0,0 L1600,0 L1600,75 C1430,120 1240,60 1050,90 C850,120 650,160 420,128 C250,105 100,125 0,95 Z"
          fill="url(#topWaveGrad1)"
        />

        {/* Dynamic bright white crest curve */}
        <path
          d="M0,97 C100,127 250,107 420,130 C650,162 850,122 1050,92 C1240,62 1430,122 1600,77"
          stroke="#ffffff"
          strokeWidth="4"
          strokeOpacity="0.9"
          fill="none"
        />

        {/* Secondary vibrant ruby crest line */}
        <path
          d="M0,127 C40,152 120,132 250,152 C490,187 700,140 940,112 C1170,82 1360,157 1600,107"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeOpacity="0.75"
          fill="none"
        />
      </svg>

      {/* =========================================================================
          3. BOTTOM CORNER WAVES (Rising dynamic crests)
         ========================================================================= */}
      <svg
        style={{ height: `${bottomWaveHeight}px` }}
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1600 155"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset="45%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
          <linearGradient id="bottomWaveGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="55%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>
        </defs>

        {/* Deep background wave */}
        <path
          d="M0,155 L1600,155 L1600,70 C1440,40 1250,105 1050,68 C800,40 570,90 350,68 C180,52 70,95 0,75 Z"
          fill={darkColor}
          opacity="0.4"
        />

        {/* Middle bottom flowing ribbon */}
        <path
          d="M0,155 L1600,155 L1600,85 C1400,55 1190,110 950,80 C710,52 520,95 280,75 C130,60 50,90 0,80 Z"
          fill="url(#bottomWaveGrad2)"
          filter="url(#waveShadow)"
        />

        {/* Front bottom wave */}
        <path
          d="M0,155 L1600,155 L1600,105 C1380,75 1220,125 990,95 C780,72 580,110 370,88 C210,72 90,110 0,95 Z"
          fill="url(#bottomWaveGrad1)"
        />

        {/* Dynamic bright white contour curve */}
        <path
          d="M0,94 C90,109 210,71 370,87 C580,109 780,71 990,94 C1220,124 1380,74 1600,104"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeOpacity="0.9"
          fill="none"
        />
        <path
          d="M0,79 C50,89 130,59 280,74 C520,94 710,51 950,79 C1190,109 1400,54 1600,84"
          stroke={accentColor}
          strokeWidth="2"
          strokeOpacity="0.65"
          fill="none"
        />
      </svg>

      {/* =========================================================================
          4. CIRCULAR ORBS & CONCENTRIC RINGS (Exact Screenshot 2 Style)
         ========================================================================= */}
      {/* Top right circular rings */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border-[4px] border-white/25 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-60 h-60 rounded-full border-[2.5px] border-rose-300/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-[1.5px] border-white/20 pointer-events-none" />

      {/* Bottom right circular rings */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border-[5px] border-white/30 pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full border-[3px] border-rose-300/45 pointer-events-none" />
      <div className="absolute -bottom-2 -right-2 w-48 h-48 rounded-full border-[2px] border-white/25 pointer-events-none" />

      {/* Bottom left circular accent */}
      <div className="absolute -bottom-14 -left-14 w-72 h-72 rounded-full border-[4px] border-white/25 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-52 h-52 rounded-full border-[2px] border-rose-300/35 pointer-events-none" />

      {/* Mid-canvas subtle circular ring passing behind cards */}
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full border-[2px] pointer-events-none"
        style={{ borderColor: primaryColor, opacity: 0.12 * opacityMult }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full border-[2px] pointer-events-none"
        style={{ borderColor: accentColor, opacity: 0.1 * opacityMult }}
      />

      {/* Soft blurred circular ruby orbs in background */}
      <div
        className="absolute top-1/4 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: primaryColor, opacity: 0.08 * opacityMult }}
      />
      <div
        className="absolute bottom-1/4 right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: secondaryColor, opacity: 0.09 * opacityMult }}
      />

      {/* =========================================================================
          5. PROMINENT DOT GRID MATRICES (Exact Screenshot 2 style, weaves across canvas)
         ========================================================================= */}
      {showDotMatrices && (
        <>
          {/* Top-right dot matrix (6 columns x 4 rows) */}
          <div className="absolute top-10 right-28 w-44 h-24 bg-dot-matrix-crimson opacity-90" />

          {/* Top-left dot matrix */}
          <div className="absolute top-14 left-10 w-36 h-20 bg-dot-matrix-crimson opacity-80" />

          {/* Center-top dot accent */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-16 bg-dot-matrix-light opacity-75" />

          {/* Mid-left dot matrix (peeking behind first columns) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-32 h-44 bg-dot-matrix-crimson opacity-70" />

          {/* Mid-right dot matrix (peeking behind right columns) */}
          <div className="absolute top-1/2 -translate-y-1/2 right-6 w-36 h-48 bg-dot-matrix-crimson opacity-75" />

          {/* Bottom-left dot matrix */}
          <div className="absolute bottom-10 left-10 w-44 h-24 bg-dot-matrix-crimson opacity-85" />

          {/* Bottom-right dot matrix */}
          <div className="absolute bottom-12 right-20 w-44 h-24 bg-dot-matrix-crimson opacity-90" />
        </>
      )}
    </div>
  );
};
