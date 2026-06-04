import { useProfileStore } from '../store/profile';

// ─── Color Palette ───────────────────────────────────────────────
export type ThemeName = 'blue' | 'purple' | 'teal';

export interface ThemeColors {
  primary: string;
  glow: string;
  bg: string;
  hex: string;
  label: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  blue:   { primary: '#7BE7FF', glow: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)',   hex: '#7BE7FF', label: 'Blue' },
  purple: { primary: '#B77BFF', glow: '#E2B3FF', bg: 'rgba(183, 123, 255, 0.1)', hex: '#B77BFF', label: 'Purple' },
  teal:   { primary: '#0DF5C4', glow: '#00FFC2', bg: 'rgba(13, 245, 196, 0.1)',  hex: '#0DF5C4', label: 'Teal' },
};

export type CategoryName = 'coding' | 'study' | 'reading';

export interface CategoryColors {
  hex: string;
  text: string;
  bg: string;
  border: string;
}

export const CATEGORY_COLORS: Record<CategoryName, CategoryColors> = {
  coding:  { hex: '#7BE7FF', text: 'text-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10', border: 'border-[#7BE7FF]/20' },
  study:   { hex: '#B77BFF', text: 'text-[#B77BFF]', bg: 'bg-[#B77BFF]/10', border: 'border-[#B77BFF]/20' },
  reading: { hex: '#0DF5C4', text: 'text-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10', border: 'border-[#0DF5C4]/20' },
};

// ─── Surface Colors ──────────────────────────────────────────────
export const SURFACE = {
  bg:         '#0A0A0F',
  card:       '#11131A',
  cardAlt:    '#0E0E14',
  elevated:   '#181A24',
  border:     '#1F2330',
  borderDim:  '#1F2330',
  pit:        '#050508',
  textPrimary:   '#FFFFFF',
  textSecondary: '#A8B0C2',
  textMuted:     '#6C758A',
  textDim:       '#4E546A',
  danger:     '#E63946',
  warning:    '#FFB703',
  success:    '#0DF5C4',
  amber:      '#F59E0B',
} as const;

// ─── Avatar System ───────────────────────────────────────────────
export type AvatarKey = 'astronaut' | 'rocket' | 'cypher' | 'phoenix';

export const AVATARS: Record<AvatarKey, string> = {
  astronaut: '👨‍🚀',
  rocket:    '🚀',
  cypher:    '👾',
  phoenix:   '🔥',
};

export const DEFAULT_AVATAR = '🛰️';

// ─── Theme Hook ──────────────────────────────────────────────────
export function useTheme() {
  const profile = useProfileStore((s) => s.profile);
  const themeName: ThemeName = profile?.theme || 'blue';
  const theme = THEMES[themeName];
  const avatar = profile?.avatar ? AVATARS[profile.avatar] : DEFAULT_AVATAR;

  return {
    themeName,
    theme,
    avatar,
    profile,
    activeColor: theme.primary,
    glowColor: theme.glow,
  };
}

// ─── Tab Icons ───────────────────────────────────────────────────
export const TAB_ICONS = {
  home:     '⚡',
  stats:    '📊',
  focus:    '⏱️',
  sessions: '🎯',
  profile:  '👤',
} as const;
