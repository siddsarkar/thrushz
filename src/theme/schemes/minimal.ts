/**
 * Minimal theme colors
 *
 * @description A minimal theme with a clean and professional design.
 */

import { baseDarkTheme, baseLightTheme } from '@/theme/schemes/base';
import { Theme, ThemeColors } from '@/theme/types';

const minimalLightColors: ThemeColors = {
  primary: '#06b6d4',
  secondary: '#22c55e',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  none: '#FFFFFF00',

  text: '#1A1A1A',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#4A5568',
  textMuted: '#718096',

  tint: '#0066CC',
  accent: '#3B82F6',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',

  border: '#E2E8F0',
  divider: '#F1F5F9',
  overlay: 'rgba(0, 0, 0, 0.5)',

  icon: '#64748B',
  iconSecondary: '#94A3B8',

  tabBackground: '#FFFFFF',
  tabIconDefault: '#64748B',
  tabIconSelected: '#0066CC',

  notStarted: '#F1F5F9',
  inProgress: '#FEF3C7',
  completed: '#D1FAE5',
};

const minimalDarkColors: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#000',
  surface: '#121212',
  card: '#1e1e1e',
  none: '#FFFFFF00',

  text: '#F8FAFC',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',

  tint: '#3B82F6',
  accent: '#60A5FA',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#F87171',
  info: 'rgb(92, 211, 255)',

  border: '#43444d',
  divider: '#334155',
  overlay: 'rgba(0, 0, 0, 0.7)',

  icon: '#94A3B8',
  iconSecondary: '#64748B',

  tabBackground: '#2d2d2d',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#38BDF8',

  notStarted: '#475569',
  inProgress: '#92400E',
  completed: '#065F46',
};

const minimalGradients = {
  background: ['#FFFFFF', '#F8F9FA'],
  card: ['#FFFFFF', '#F8F9FA'],
  button: ['#0066CC', '#3B82F6'],
  accent: ['#3B82F6', '#60A5FA'],
};

const minimalDarkGradients = {
  background: ['#0F172A', '#1E293B'],
  card: ['#1E293B', '#334155'],
  button: ['#3B82F6', '#60A5FA'],
  accent: ['#60A5FA', '#93C5FD'],
};

// THEME EXPORTS
export const minimalLight: Theme = {
  ...baseLightTheme,
  colors: minimalLightColors,
  gradients: minimalGradients,
};

export const minimalDark: Theme = {
  ...baseDarkTheme,
  colors: minimalDarkColors,
  gradients: minimalDarkGradients,
};
