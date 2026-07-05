/**
 * نظام التصميم الموحد لتطبيق AI Clinic
 */
export const colors = {
  primary: '#0E7C7B',
  primaryDark: '#095958',
  primaryLight: '#E0F2F1',
  accent: '#F4A261',
  background: '#F7F9F9',
  surface: '#FFFFFF',
  text: '#1A2E35',
  textSecondary: '#5C6F76',
  border: '#E3E9EA',
  danger: '#D9534F',
  dangerLight: '#FDECEA',
  success: '#2E9E5B',
  successLight: '#E6F4EC',
  warning: '#C98A08',
  warningLight: '#FDF3DC',
  info: '#2A6FDB',
  infoLight: '#E8F0FD',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textSecondary },
} as const;
