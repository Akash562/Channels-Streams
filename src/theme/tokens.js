/**
 * Design tokens for the "Cinematic Glass" theme, in light and dark variants.
 * Components read the active palette through useTheme() (see ThemeProvider.js).
 */

export const palettes = {
  light: {
    bg: '#F6F4FC',
    bgElevated: '#FFFFFF',
    glass: 'rgba(255,255,255,0.72)',
    glassStrong: 'rgba(255,255,255,0.92)',
    glassBorder: 'rgba(36,24,84,0.08)',
    glassBorderStrong: 'rgba(36,24,84,0.12)',
    card: 'rgba(255,255,255,0.62)',
    cardBorder: 'rgba(36,24,84,0.08)',
    cardShadow: '0 8px 24px rgba(60,40,140,0.10)',
    scrim: 'rgba(246,244,252,0.9)',
    text: '#17142B',
    textMuted: 'rgba(23,20,43,0.62)',
    textFaint: 'rgba(23,20,43,0.40)',
    plate: '#FFFFFF',
    plateBorder: 'rgba(36,24,84,0.06)',
    accent: '#7C3AED',
    searchBg: 'rgba(255,255,255,0.75)',
    searchBgFocus: 'rgba(255,255,255,0.98)',
    searchBorder: 'rgba(36,24,84,0.10)',
    searchBorderFocus: 'rgba(124,58,237,0.65)',
    focusGlow: '0 0 24px rgba(124,58,237,0.22)',
    live: '#E11D48',
    heart: '#F43F5E',
  },
  dark: {
    bg: '#07060F',
    bgElevated: '#100E1F',
    glass: 'rgba(255,255,255,0.06)',
    glassStrong: 'rgba(255,255,255,0.11)',
    glassBorder: 'rgba(255,255,255,0.10)',
    glassBorderStrong: 'rgba(255,255,255,0.20)',
    card: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.20)',
    cardShadow: null,
    scrim: 'rgba(7,6,15,0.86)',
    text: '#F5F4FF',
    textMuted: 'rgba(235,233,255,0.64)',
    textFaint: 'rgba(235,233,255,0.40)',
    plate: '#FFFFFF',
    plateBorder: 'transparent',
    accent: '#A78BFA',
    searchBg: 'rgba(255,255,255,0.06)',
    searchBgFocus: 'rgba(255,255,255,0.10)',
    searchBorder: 'rgba(255,255,255,0.10)',
    searchBorderFocus: 'rgba(167,139,250,0.9)',
    focusGlow: '0 0 28px rgba(139,92,246,0.45)',
    live: '#FF3B5C',
    heart: '#FF4D7E',
  },
};

/** Moving light behind the home screen, per theme. rgb + peak alpha. */
export const auroraPalettes = {
  light: [
    { rgb: '167,139,250', alpha: 0.34 },
    { rgb: '244,114,182', alpha: 0.22 },
    { rgb: '103,232,249', alpha: 0.26 },
  ],
  dark: [
    { rgb: '139,92,246', alpha: 0.5 },
    { rgb: '236,72,153', alpha: 0.34 },
    { rgb: '34,211,238', alpha: 0.22 },
  ],
};

/** Gradients that look the same in both themes. */
export const gradients = {
  accent: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  topScrim: 'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
  bottomScrim: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
};

/** Fades the aurora into the page color toward the bottom of the screen. */
export function screenFade(bgHex) {
  return `linear-gradient(180deg, ${withAlpha(bgHex, 0)} 0%, ${withAlpha(bgHex, 0.55)} 55%, ${bgHex} 100%)`;
}

export const radii = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

/** Type scale (colors are applied per theme in each component). */
export const type = {
  display: { fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  caption: { fontSize: 12, fontWeight: '600' },
};

/** Reanimated spring presets. */
export const springs = {
  snappy: { damping: 18, stiffness: 260, mass: 0.7 },
  soft: { damping: 16, stiffness: 140, mass: 0.9 },
  bouncy: { damping: 7, stiffness: 320, mass: 0.6 },
};

/** Two-color accent per category, used for gradients, dots and glows. */
const CATEGORY_ACCENTS = {
  Music: ['#8B5CF6', '#EC4899'],
  News: ['#F97316', '#EF4444'],
  Movies: ['#06B6D4', '#6366F1'],
  Religious: ['#F59E0B', '#F43F5E'],
};
const FALLBACK_ACCENTS = [
  ['#22D3EE', '#8B5CF6'],
  ['#10B981', '#06B6D4'],
  ['#E879F9', '#6366F1'],
];

export function accentFor(group = '') {
  if (CATEGORY_ACCENTS[group]) {
    return CATEGORY_ACCENTS[group];
  }
  let hash = 0;
  for (let i = 0; i < group.length; i++) {
    hash = (hash * 31 + group.charCodeAt(i)) % 1000003;
  }
  return FALLBACK_ACCENTS[Math.abs(hash) % FALLBACK_ACCENTS.length];
}

/** '#RRGGBB' + alpha (0–1) → 'rgba(r,g,b,a)'. */
export function withAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
