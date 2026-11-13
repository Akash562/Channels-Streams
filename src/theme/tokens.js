/**
 * Design tokens for the "Cinematic Glass" theme.
 * Every screen and component reads colors, spacing, type and motion from here.
 */

export const colors = {
  bg: '#07060F',
  bgElevated: '#100E1F',
  glass: 'rgba(255,255,255,0.06)',
  glassStrong: 'rgba(255,255,255,0.11)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderStrong: 'rgba(255,255,255,0.20)',
  scrim: 'rgba(7,6,15,0.86)',
  text: '#F5F4FF',
  textMuted: 'rgba(235,233,255,0.64)',
  textFaint: 'rgba(235,233,255,0.40)',
  plate: '#FFFFFF',
  violet: '#8B5CF6',
  violetSoft: '#A78BFA',
  pink: '#EC4899',
  cyan: '#22D3EE',
  live: '#FF3B5C',
  heart: '#FF4D7E',
};

export const gradients = {
  accent: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  topScrim: 'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
  bottomScrim: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
  screenFade: 'linear-gradient(180deg, rgba(7,6,15,0) 0%, rgba(7,6,15,0.55) 55%, #07060F 100%)',
};

export const radii = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const type = {
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: '#F5F4FF',
  },
  display: { fontSize: 38, fontWeight: '800', letterSpacing: -1, color: '#F5F4FF' },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: '#F5F4FF' },
  body: { fontSize: 15, fontWeight: '500', color: '#F5F4FF' },
  label: { fontSize: 13, fontWeight: '700', color: '#F5F4FF' },
  caption: { fontSize: 12, fontWeight: '600', color: 'rgba(235,233,255,0.64)' },
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
