import React from 'react';

export interface IconPreset {
  id: string;
  label: string;
  renderIcon: () => React.ReactNode;
}

export const ICON_PRESETS: IconPreset[] = [
  {
    id: 'key',
    label: 'Maison Key & Seal',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M50 16 L53 23 L60 20 L58 28 L66 28 L61 34 L67 39 L60 41 L61 48 L54 46 L50 52 L46 46 L39 48 L40 41 L33 39 L39 34 L34 28 L42 28 L40 20 L47 23 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="50" cy="34" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 40 L50 82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 62 L58 62 M50 70 L59 70 M50 78 L56 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="34" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'orchid',
    label: 'Golden Orchid',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M50 20 C42 32 40 44 50 54 C60 44 58 32 50 20 Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M50 54 C35 50 22 60 28 72 C36 78 46 68 50 54 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 54 C65 50 78 60 72 72 C64 78 54 68 50 54 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 54 C44 65 42 78 50 84 C58 78 56 65 50 54 Z" fill="currentColor" opacity="0.85" />
        <circle cx="50" cy="52" r="3.5" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'crown',
    label: 'Imperial Crown',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M22 66 L20 40 L34 52 L50 30 L66 52 L80 40 L78 66 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <rect x="22" y="66" width="56" height="7" rx="2" fill="currentColor" />
        <circle cx="20" cy="38" r="2.5" fill="currentColor" />
        <circle cx="34" cy="50" r="2.5" fill="currentColor" />
        <circle cx="50" cy="28" r="3" fill="currentColor" />
        <circle cx="66" cy="50" r="2.5" fill="currentColor" />
        <circle cx="80" cy="38" r="2.5" fill="currentColor" />
        <polygon points="50,44 56,53 50,62 44,53" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'flame',
    label: 'Arabesque Flame',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M50 18 C58 28 68 40 68 56 C68 70 58 82 48 82 C38 82 32 72 32 62 C32 48 42 36 46 24 C48 20 49 18 50 18 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M50 32 C54 40 60 48 60 58 C60 66 54 72 48 72 C42 72 38 66 38 60 C38 50 44 42 48 34 Z" fill="currentColor" opacity="0.8" />
        <circle cx="62" cy="28" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'palmette',
    label: 'Islamic Palmette',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M50 20 L58 35 L74 35 L62 46 L67 62 L50 52 L33 62 L38 46 L26 35 L42 35 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 32 L50 78 M38 78 L62 78" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="50" cy="20" r="2.5" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'script',
    label: 'Diwani Script',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M30 65 C32 50 44 38 58 38 C70 38 76 46 76 56 C76 68 62 72 46 72 C36 72 26 68 24 58" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 28 L50 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="26" r="2.5" fill="currentColor" />
        <circle cx="56" cy="26" r="2.5" fill="currentColor" />
        <circle cx="52" cy="55" r="3" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'wing',
    label: 'Winged Paisley',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M36 72 C28 62 28 46 38 36 C48 26 64 26 72 38 C78 48 76 62 66 70 C58 76 44 78 36 72 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M46 62 C40 56 40 46 46 40 C52 34 60 36 64 42 C68 48 66 56 60 60 Z" fill="currentColor" opacity="0.8" />
        <circle cx="68" cy="32" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'sunburst',
    label: 'Radiate Sunburst',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M30 46 L32 28 C34 26 38 26 40 28 L42 46" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M42 46 L45 22 C47 20 53 20 55 22 L58 46" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M58 46 L60 28 C62 26 66 26 68 28 L70 46" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M26 46 C26 44 74 44 74 46 L70 74 C70 76 30 76 30 74 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="50" cy="60" r="5" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'coronet',
    label: 'Triple Coronet',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M26 64 L24 42 L38 52 L50 34 L62 52 L76 42 L74 64 Z" fill="currentColor" opacity="0.9" />
        <circle cx="24" cy="38" r="2.5" fill="currentColor" />
        <circle cx="50" cy="30" r="3" fill="currentColor" />
        <circle cx="76" cy="38" r="2.5" fill="currentColor" />
        <rect x="24" y="66" width="52" height="4" rx="1" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'burner',
    label: 'Oud Mabkhara',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <path d="M30 68 L36 34 L46 48 L50 28 L54 48 L64 34 L70 68 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="50" cy="24" r="2.5" fill="currentColor" />
        <path d="M26 72 L74 72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="40" cy="58" r="2" fill="currentColor" />
        <circle cx="60" cy="58" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'calligraphy',
    label: 'Signature Script',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M32 58 C38 38 48 38 52 48 C56 56 64 42 70 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M40 64 C48 68 58 64 68 56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="48" cy="34" r="2.5" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'atelier',
    label: 'OUD.X Monogram',
    renderIcon: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="currentColor">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 24 L54 30 L62 30 L56 35 L58 42 L50 37 L42 42 L44 35 L38 30 L46 30 Z" fill="currentColor" />
        <text x="50" y="64" textAnchor="middle" fontSize="16" fontFamily="Cinzel, serif" fontWeight="bold" fill="currentColor" letterSpacing="1">
          OUD.X
        </text>
      </svg>
    )
  }
];
