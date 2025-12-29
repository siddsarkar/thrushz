/**
 * Forest theme colors
 *
 * @description A forest theme with natural greens and deep purples.
 * @colors #629539, #a4d562, #915fce, #6926b1, #401c66
 */

import { baseDarkTheme, baseLightTheme } from '@/theme/schemes/base';
import { Theme, ThemeColors } from '@/theme/types';

const forestLightColors: ThemeColors = {
  primary: '#629539',
  secondary: '#915fce',
  background: '#F0F8E8',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  none: '#FFFFFF00',

  text: '#2D4A1A',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#629539',
  textMuted: '#7A9B5A',

  tint: '#a4d562',
  accent: '#629539',

  success: '#a4d562',
  warning: '#D4A574',
  error: '#E67E7E',
  info: '#915fce',

  border: '#D4E8B8',
  divider: '#F0F8E8',
  overlay: 'rgba(45, 74, 26, 0.5)',

  icon: '#7A9B5A',
  iconSecondary: '#a4d562',

  tabBackground: '#F0F8E8',
  tabIconDefault: '#7A9B5A',
  tabIconSelected: '#629539',

  notStarted: '#D4A574',
  inProgress: '#a4d562',
  completed: '#629539',
};

const forestDarkColors: ThemeColors = {
  primary: '#a4d562',
  secondary: '#915fce',
  background: '#1A0F0A',
  surface: '#2D1B0F',
  card: '#401c66',
  none: '#FFFFFF00',

  text: '#E8F0D8',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#a4d562',
  textMuted: '#7A9B5A',

  tint: '#a4d562',
  accent: '#915fce',

  success: '#a4d562',
  warning: '#D4A574',
  error: '#E67E7E',
  info: '#915fce',

  border: '#6926b1',
  divider: '#401c66',
  overlay: 'rgba(26, 15, 10, 0.7)',

  icon: '#a4d562',
  iconSecondary: '#915fce',

  tabBackground: '#2D1B0F',
  tabIconDefault: '#7A9B5A',
  tabIconSelected: '#a4d562',

  notStarted: '#D4A574',
  inProgress: '#a4d562',
  completed: '#629539',
};

const forestGradients = {
  background: ['#F0F8E8', '#D4E8B8', '#E8D4F8', '#D4E8B8', '#F0F8E8'],
  card: ['#FFFFFF', '#F8F8F0'],
  button: ['#629539', '#a4d562'],
  accent: ['#915fce', '#6926b1'],
};

const forestDarkGradients = {
  background: ['#2D1B0F', '#401c66', '#6926b1', '#401c66', '#2D1B0F'],
  card: ['#401c66', '#6926b1'],
  button: ['#a4d562', '#629539'],
  accent: ['#915fce', '#6926b1'],
};

export const forestLight: Theme = {
  ...baseLightTheme,
  colors: forestLightColors,
  gradients: forestGradients,
};

export const forestDark: Theme = {
  ...baseDarkTheme,
  colors: forestDarkColors,
  gradients: forestDarkGradients,
};
