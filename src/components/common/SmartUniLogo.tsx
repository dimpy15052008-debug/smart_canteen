import React from 'react';

export interface SmartUniLogoProps {
  /**
   * 'full': Complete panoramic 3D emblem lockup with Smart + [3D U Campus] + ni.Ai + tagline (default)
   * 'compact': Scaled panoramic lockup optimized for smaller spaces
   * 'icon': Standalone 3D 'U' emblem with graduation cap & campus inside
   */
  variant?: 'full' | 'compact' | 'icon' | 'responsive';
  /**
   * Height in pixels or custom styling class
   */
  height?: number;
  /**
   * Toggle the bottom tagline "— Your Smart Digital University —"
   */
  showTagline?: boolean;
  className?: string;
}

/**
 * SmartUni.Ai Official Emblem & Brand Logo
 * High-fidelity 3D vector recreation matching the official brand identity:
 * - 3D glossy royal blue "U" with mortarboard cap & flowing golden tassel
 * - Neoclassical campus administration clock tower building & promenade inside
 * - Academic books & sprout of wisdom on left
 * - AI circuit brain tree & orbital data loop on right
 * - Distinctive typography with miniature graduation cap over "Ai"
 * - Bottom tagline "— Your Smart Digital University —"
 * - Pristine vector scaling on both mobile and desktop in Light & Dark modes
 */
export const SmartUniLogo: React.FC<SmartUniLogoProps> = ({
  variant = 'full',
  height,
  showTagline = true,
  className = '',
}) => {
  // If icon-only is explicitly requested
  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        style={height ? { height } : undefined}
        aria-label="SmartUni.Ai"
      >
        <svg
          viewBox="0 0 240 240"
          className="h-full w-auto max-w-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="icon_uFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="25%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="icon_uBevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="icon_capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="50%" stopColor="#172554" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="icon_tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <clipPath id="icon_uInteriorClip">
              <path d="M72 75 C72 75 72 135 72 148 C72 185 95 205 120 205 C145 205 168 185 168 148 C168 135 168 75 168 75 L140 75 C140 75 140 135 140 148 C140 162 132 174 120 174 C108 174 100 162 100 148 C100 135 100 75 100 75 Z" />
            </clipPath>
          </defs>
          <path
            d="M45 65 L45 145 C45 200 80 226 120 226 C160 226 195 200 195 145 L195 65 L165 65 L165 145 C165 178 145 196 120 196 C95 196 75 178 75 145 L75 65 Z"
            fill="url(#icon_uBevel)"
            transform="translate(0, 6)"
            opacity="0.85"
          />
          <path
            d="M45 65 L45 145 C45 200 80 224 120 224 C160 224 195 200 195 145 L195 65 L165 65 L165 145 C165 178 145 196 120 196 C95 196 75 178 75 145 L75 65 Z"
            fill="url(#icon_uFront)"
          />
          <g clipPath="url(#icon_uInteriorClip)">
            <rect x="70" y="65" width="100" height="150" fill="#60a5fa" />
            <ellipse cx="120" cy="85" rx="35" ry="15" fill="#f0f9ff" opacity="0.8" />
            <circle cx="85" cy="140" r="16" fill="#15803d" />
            <circle cx="155" cy="140" r="16" fill="#15803d" />
            <g transform="translate(98, 85)">
              <rect x="15" y="10" width="14" height="22" fill="#ffedd5" />
              <polygon points="12,10 22,2 32,10" fill="#0284c7" />
              <circle cx="22" cy="18" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />
              <rect x="2" y="32" width="40" height="30" fill="#fed7aa" />
              <rect x="18" y="44" width="8" height="18" rx="1" fill="#0284c7" />
            </g>
            <polygon points="112,150 128,150 145,210 95,210" fill="#e2e8f0" />
          </g>
          <g transform="translate(10, 8) rotate(-8)">
            <polygon points="45,35 85,15 125,35 85,55" fill="url(#icon_capGrad)" stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M68 46 C68 58 102 58 102 46 Z" fill="#1e3a8a" />
            <circle cx="85" cy="35" r="3" fill="#facc15" />
            <path d="M85 35 C72 38 60 50 56 65" stroke="url(#icon_tasselGrad)" strokeWidth="2.2" fill="none" />
            <polygon points="53,65 59,65 60,78 52,78" fill="#eab308" />
          </g>
        </svg>
      </div>
    );
  }

  // Complete Panoramic Logo Lockup (rendered on BOTH mobile and desktop with maximized presence)
  return (
    <div
      className={`inline-flex items-center justify-start select-none ${className}`}
      style={height ? { height } : undefined}
      aria-label="SmartUni.Ai - Your Smart Digital University"
    >
      <svg
        viewBox="10 24 736 326"
        preserveAspectRatio="xMinYMid meet"
        className="h-full w-auto max-w-full drop-shadow-sm filter transition-all duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* ── 3D Blue U Gradients ── */}
          <linearGradient id="su_uFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="25%" stopColor="#2563eb" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="90%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="su_uHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="su_uInnerRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="su_uBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* ── Graduation Cap Gradients ── */}
          <linearGradient id="su_capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#1e40af" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="su_tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>

          {/* ── Neoclassical Campus Gradients ── */}
          <linearGradient id="su_skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#93c5fd" />
            <stop offset="80%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id="su_bldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="50%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          <linearGradient id="su_roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="su_pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* ── AI Cyan Energy & Glow ── */}
          <linearGradient id="su_aiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* ── Books Gradients ── */}
          <linearGradient id="su_book1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="su_book2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="su_book3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* ── Precise Clip Path for Campus Inside the "U" ── */}
          <clipPath id="su_uInteriorClip">
            <path d="M305 125 C305 125 305 200 305 215 C305 258 335 285 375 285 C415 285 445 258 445 215 C445 200 445 125 445 125 L400 125 C400 125 400 205 400 215 C400 232 388 245 375 245 C362 245 350 232 350 215 C350 205 350 125 350 125 Z" />
          </clipPath>

          {/* ── 3D Shadow Filter ── */}
          <filter id="su_softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0284c7" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ═══════════════════════════════════════════════════════════════
            LEFT FLANK: WISDOM BOOKS & GREEN SPROUT + ENERGY ORBIT
        ═══════════════════════════════════════════════════════════════ */}
        <g transform="translate(18, 5)">
          {/* Cyan Orbital Glow Swoosh */}
          <path
            d="M72 205 C42 185 46 155 86 145 C136 132 156 170 122 195"
            stroke="url(#su_aiGlow)"
            strokeWidth="2.5"
            strokeDasharray="4 2.5"
            fill="none"
            opacity="0.85"
          />

          {/* Stack of 3 Academic Hardcover Books */}
          {/* Book 1 (Bottom - Royal Blue) */}
          <g>
            <rect x="75" y="212" width="76" height="15" rx="3.5" fill="url(#su_book1)" />
            <rect x="145" y="214" width="7" height="11" rx="1.5" fill="#f8fafc" />
            <line x1="82" y1="219.5" x2="138" y2="219.5" stroke="#93c5fd" strokeWidth="1.2" opacity="0.6" />
          </g>

          {/* Book 2 (Middle - Gold/Amber) */}
          <g>
            <rect x="78" y="196" width="72" height="14" rx="3.5" fill="url(#su_book2)" />
            <rect x="144" y="198" width="6" height="10" rx="1.5" fill="#f8fafc" />
            <line x1="85" y1="203" x2="135" y2="203" stroke="#fef08a" strokeWidth="1.2" opacity="0.6" />
          </g>

          {/* Book 3 (Top - Azure Cyan) */}
          <g>
            <rect x="82" y="181" width="68" height="13" rx="3.5" fill="url(#su_book3)" />
            <rect x="144" y="183" width="6" height="9" rx="1.5" fill="#f8fafc" />
            <line x1="88" y1="187" x2="136" y2="187" stroke="#e0f2fe" strokeWidth="1.2" opacity="0.7" />
          </g>

          {/* Green Sprout / Double Foliage of Growth */}
          <g transform="translate(102, 138)">
            {/* Stem */}
            <path d="M12 44 C13 33 15 23 17 15" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Left Leaf */}
            <path
              d="M15 26 C8 24 0 16 2 7 C11 5 17 14 15 26 Z"
              fill="#22c55e"
            />
            <path d="M5 14 C9 15 14 20 15 26" stroke="#bbf7d0" strokeWidth="1" fill="none" />
            {/* Right Leaf */}
            <path
              d="M17 17 C22 10 32 8 36 14 C34 22 25 24 17 17 Z"
              fill="#16a34a"
            />
            <path d="M22 15 C26 18 31 16 35 15" stroke="#86efac" strokeWidth="1" fill="none" />
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT FLANK: AI DIGITAL BRAIN TREE & ENERGY TRAIL
        ═══════════════════════════════════════════════════════════════ */}
        <g transform="translate(385, 18)">
          {/* Dynamic Cyber Orbital Swoosh */}
          <path
            d="M155 120 C220 100 280 140 265 190 C250 240 180 260 130 250"
            stroke="url(#su_aiGlow)"
            strokeWidth="2.5"
            fill="none"
            opacity="0.88"
          />
          {/* Energy Particles */}
          <circle cx="265" cy="188" r="3.5" fill="#38bdf8" />
          <rect x="272" y="145" width="4.5" height="4.5" fill="#38bdf8" rx="1" />
          <rect x="255" y="125" width="5" height="5" fill="#22d3ee" rx="1" />

          {/* Digital Brain Tree Traces & Glowing Nodes */}
          <g transform="translate(205, 108)">
            <path
              d="M20 70 L20 40 L10 25 L10 15 M20 40 L35 25 L35 15 M20 48 L8 36 M20 32 L32 20 M20 56 L30 46"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Node Dots */}
            <circle cx="10" cy="12" r="4.5" fill="#38bdf8" />
            <circle cx="10" cy="12" r="2" fill="#ffffff" />

            <circle cx="35" cy="12" r="4.5" fill="#06b6d4" />
            <circle cx="35" cy="12" r="2" fill="#ffffff" />

            <circle cx="8" cy="34" r="3.5" fill="#38bdf8" />
            <circle cx="32" cy="19" r="3.5" fill="#0284c7" />
            <circle cx="30" cy="45" r="3" fill="#38bdf8" />

            <circle cx="20" cy="70" r="4" fill="#0284c7" />
            <circle cx="20" cy="70" r="2" fill="#ffffff" />
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            CENTER EMBLEM: THE 3D LETTER "U"
        ═══════════════════════════════════════════════════════════════ */}
        <g filter="url(#su_softShadow)">
          {/* 3D Extrusion Depth Layer */}
          <path
            d="M260 115 L260 215 C260 290 310 325 375 325 C440 325 490 290 490 215 L490 115 L445 115 L445 215 C445 260 415 285 375 285 C335 285 305 260 305 215 L305 115 Z"
            fill="url(#su_uBevel)"
            transform="translate(0, 8)"
            opacity="0.92"
          />

          {/* Front Face of the 3D "U" */}
          <path
            d="M260 115 L260 215 C260 290 310 322 375 322 C440 322 490 290 490 215 L490 115 L445 115 L445 215 C445 260 415 285 375 285 C335 285 305 260 305 215 L305 115 Z"
            fill="url(#su_uFront)"
          />

          {/* Specular Rim Highlight along outer edge */}
          <path
            d="M260 115 L260 215 C260 290 310 322 375 322 C440 322 490 290 490 215 L490 115 L484 115 L484 215 C484 286 436 317 375 317 C314 317 266 286 266 215 L266 115 Z"
            fill="url(#su_uHighlight)"
          />

          {/* Inner Curve Accent Highlight */}
          <path
            d="M305 200 C305 250 335 280 375 280 C415 280 445 250 445 200"
            stroke="url(#su_uInnerRim)"
            strokeWidth="3.2"
            fill="none"
            opacity="0.9"
          />
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            CAMPUS SCENERY (Framed Inside the "U")
        ═══════════════════════════════════════════════════════════════ */}
        <g clipPath="url(#su_uInteriorClip)">
          {/* Radiant Sky Backdrop */}
          <rect x="300" y="110" width="150" height="180" fill="url(#su_skyGrad)" />

          {/* Soft White Clouds */}
          <g fill="#ffffff" opacity="0.88">
            <ellipse cx="330" cy="142" rx="18" ry="8" />
            <ellipse cx="342" cy="138" rx="14" ry="7" />
            <ellipse cx="420" cy="144" rx="20" ry="9" />
            <ellipse cx="408" cy="140" rx="15" ry="7" />
          </g>

          {/* Lush Green Trees Background */}
          <g fill="#15803d">
            <circle cx="325" cy="205" r="22" />
            <circle cx="340" cy="210" r="18" />
            <circle cx="425" cy="205" r="22" />
            <circle cx="410" cy="210" r="18" />
          </g>
          <g fill="#22c55e">
            <circle cx="328" cy="202" r="16" />
            <circle cx="422" cy="202" r="16" />
          </g>

          {/* Neoclassical University Administration Building */}
          <g transform="translate(335, 133)">
            {/* Clock Tower Spire & Dome */}
            <polygon points="40,2 38,18 42,18" fill="#0284c7" />
            <circle cx="40" cy="2" r="2" fill="#38bdf8" />
            <path d="M30 25 C30 18 50 18 50 25 Z" fill="url(#su_roofGrad)" />

            {/* Tower Body with Clock */}
            <rect x="32" y="25" width="16" height="26" fill="url(#su_bldgGrad)" stroke="#f97316" strokeWidth="0.5" />
            {/* Clock Face with Golden Border */}
            <circle cx="40" cy="35" r="5" fill="#ffffff" stroke="#ca8a04" strokeWidth="1" />
            <line x1="40" y1="35" x2="40" y2="32" stroke="#0f172a" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="40" y1="35" x2="42" y2="35" stroke="#0f172a" strokeWidth="0.8" strokeLinecap="round" />

            {/* Main Building Facade */}
            <rect x="10" y="51" width="60" height="42" fill="url(#su_bldgGrad)" stroke="#cbd5e1" strokeWidth="0.5" />

            {/* Classical Arched Windows */}
            <rect x="16" y="56" width="5" height="15" rx="1" fill="#38bdf8" opacity="0.8" />
            <rect x="25" y="56" width="5" height="15" rx="1" fill="#38bdf8" opacity="0.8" />
            <rect x="50" y="56" width="5" height="15" rx="1" fill="#38bdf8" opacity="0.8" />
            <rect x="59" y="56" width="5" height="15" rx="1" fill="#38bdf8" opacity="0.8" />

            {/* Main Classical Portico & Columns */}
            <rect x="34" y="53" width="12" height="30" fill="#ffffff" />
            <polygon points="32,53 40,46 48,53" fill="url(#su_roofGrad)" />
            {/* Main Double Doors */}
            <rect x="37" y="68" width="6" height="15" rx="1" fill="#0284c7" />

            {/* Architectural Entrance Steps */}
            <rect x="30" y="83" width="20" height="2.5" fill="#e2e8f0" />
            <rect x="28" y="85.5" width="24" height="2.5" fill="#cbd5e1" />
            <rect x="26" y="88" width="28" height="2.5" fill="#94a3b8" />
          </g>

          {/* Symmetrical Perspective Stone Walkway */}
          <polygon points="360,225 390,225 415,285 335,285" fill="url(#su_pathGrad)" />
          <line x1="375" y1="225" x2="375" y2="285" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />

          {/* Campus Lawns */}
          <polygon points="305,225 360,225 335,285 305,285" fill="#4ade80" />
          <polygon points="390,225 445,225 445,285 415,285" fill="#4ade80" />

          {/* Campus Lamp Posts & Benches */}
          <circle cx="340" cy="245" r="2.5" fill="#fef08a" />
          <line x1="340" y1="247" x2="340" y2="258" stroke="#1e293b" strokeWidth="1" />
          <circle cx="410" cy="245" r="2.5" fill="#fef08a" />
          <line x1="410" y1="247" x2="410" y2="258" stroke="#1e293b" strokeWidth="1" />
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            GRADUATION MORTARBOARD CAP (Top-Left of the "U")
        ═══════════════════════════════════════════════════════════════ */}
        <g transform="translate(195, 36) rotate(-8)">
          {/* Soft Cap Shadow */}
          <polygon points="75,45 135,15 195,45 135,75" fill="#000000" opacity="0.32" transform="translate(4, 6)" />

          {/* 3D Mortarboard Diamond Board */}
          <polygon points="75,45 135,15 195,45 135,75" fill="url(#su_capGrad)" stroke="#3b82f6" strokeWidth="1.5" />

          {/* Under-board Skullcap Bevel */}
          <path d="M110 63 C110 82 160 82 160 63 Z" fill="#1e3a8a" />

          {/* Center Golden Button */}
          <circle cx="135" cy="45" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

          {/* Cascading Golden Tassel */}
          <path
            d="M135 45 C115 50 100 65 92 88"
            stroke="url(#su_tasselGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tassel Knot Ring */}
          <circle cx="92" cy="88" r="3.5" fill="#eab308" />
          {/* Realistic Tassel Fringe */}
          <path
            d="M87 90 L85 118 C85 120 99 120 99 118 L97 90 Z"
            fill="url(#su_tasselGrad)"
          />
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            TYPOGRAPHY: "Smart" (Left Wordmark - Prominent & Bold)
        ═══════════════════════════════════════════════════════════════ */}
        <text
          x="12"
          y="280"
          className="fill-slate-950 dark:fill-white font-black tracking-tight"
          style={{
            fontFamily:
              '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '124px',
            fontWeight: 900,
            letterSpacing: '-2.5px',
          }}
        >
          Smart
        </text>

        {/* ═══════════════════════════════════════════════════════════════
            TYPOGRAPHY: "ni.Ai" (Right Wordmark + Mini Cap)
        ═══════════════════════════════════════════════════════════════ */}
        <g transform="translate(488, 0)">
          {/* "ni." in matching prominent bold brand text */}
          <text
            x="0"
            y="280"
            className="fill-slate-950 dark:fill-white font-black tracking-tight"
            style={{
              fontFamily:
                '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '124px',
              fontWeight: 900,
              letterSpacing: '-2.5px',
            }}
          >
            ni.
          </text>

          {/* "Ai" in royal azure-to-cyan 3D gradient */}
          <text
            x="138"
            y="280"
            fill="url(#su_uFront)"
            style={{
              fontFamily:
                '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '124px',
              fontWeight: 900,
              letterSpacing: '-2.5px',
            }}
          >
            Ai
          </text>

          {/* Miniature Graduation Mortarboard perched atop the "i" in "Ai" */}
          <g transform="translate(222, 172) rotate(-10) scale(0.52)">
            <polygon points="40,25 70,10 100,25 70,40" fill="url(#su_capGrad)" stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M58 33 C58 44 82 44 82 33 Z" fill="#1e3a8a" />
            <circle cx="70" cy="25" r="3" fill="#facc15" />
            <path d="M70 25 C62 30 56 38 52 48" stroke="#facc15" strokeWidth="2" fill="none" />
            <polygon points="50,48 54,48 55,62 49,62" fill="#eab308" />
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════════════════
            TAGLINE: "— Your Smart Digital University —"
        ═══════════════════════════════════════════════════════════════ */}
        {showTagline && (
          <g transform="translate(0, 336)">
            {/* Left Accent Rule */}
            <line x1="45" y1="0" x2="135" y2="0" stroke="url(#su_aiGlow)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Tagline Text */}
            <text
              x="375"
              y="6"
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 font-extrabold"
              style={{
                fontFamily:
                  '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '5px',
              }}
            >
              Your Smart Digital University
            </text>
            {/* Right Accent Rule */}
            <line x1="615" y1="0" x2="705" y2="0" stroke="url(#su_aiGlow)" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
