import { TextStyle } from 'react-native';

// Theme types and interfaces
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeScheme = 'minimal' | 'girly-pop' | 'forest';

export interface ThemeColors {
  // Core colors
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  none: string;

  // Text colors
  text: string;
  onPrimary: string;
  onSecondary: string;
  textSecondary: string;
  textMuted: string;

  // Interactive colors
  tint: string;
  accent: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // UI colors
  border: string;
  divider: string;
  overlay: string;

  // Icon colors
  icon: string;
  iconSecondary: string;

  // Tab colors
  tabBackground: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // Status colors for progress
  notStarted: string;
  inProgress: string;
  completed: string;
}

export type ThemeTypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'button';

export type ThemeTypography = Record<ThemeTypographyVariant, TextStyle>;

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: object;
  sm: object;
  md: object;
  lg: object;
  xl: object;
}

export interface ThemeGradients {
  background: string[];
  card: string[];
  button: string[];
  accent: string[];
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  gradients: ThemeGradients;
}

export interface ThemeContextType {
  // Current theme values
  theme: Theme;
  mode: ThemeMode;
  scheme: ThemeScheme;
  systemMode: 'light' | 'dark';

  // Computed values
  isDark: boolean;
  isSystem: boolean;

  // Actions
  setMode: (mode: ThemeMode) => void;
  setScheme: (scheme: ThemeScheme) => void;

  // Loading state
  loading: boolean;
}
