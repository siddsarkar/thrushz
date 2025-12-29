/**
 * Girly Pop theme colors
 *
 * @description A girly pop theme with a playful and feminine design.
 */
import { baseDarkTheme, baseLightTheme } from '@/theme/schemes/base';
import { Theme, ThemeColors } from '@/theme/types';

const girlyPopLightColors: ThemeColors = {
  primary: '#FF4DA6',
  secondary: '#C77DFF',
  background: '#FFF6FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  none: '#FFFFFF00',

  text: '#4A154B',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#7A1FA2',
  textMuted: '#9A68C1',

  tint: '#FF77B7',
  accent: '#FF4DA6',

  success: '#B8E1C6',
  warning: '#FFD166',
  error: '#FF6B9D',
  info: '#DDB6F2',

  border: '#FFD3E2',
  divider: '#FFF0F8',
  overlay: 'rgba(74, 21, 75, 0.5)',

  icon: '#C7A1E3',
  iconSecondary: '#E5C3FF',

  tabBackground: '#FFF6FB',
  tabIconDefault: '#C7A1E3',
  tabIconSelected: '#FF4DA6',

  notStarted: '#FFB5A7',
  inProgress: '#FFD166',
  completed: '#B8E1C6',
};

const girlyPopDarkColors: ThemeColors = {
  primary: '#FF77B7',
  secondary: '#E5C3FF',
  background: '#0F0A17',
  surface: '#1A0B2E',
  card: '#2B124C',
  none: '#FFFFFF00',

  text: '#F8EAFE',
  onPrimary: '#F8FAFC',
  onSecondary: '#F8FAFC',
  textSecondary: '#E5C3FF',
  textMuted: '#C7A1E3',

  tint: '#FF77B7',
  accent: '#FF4DA6',

  success: '#8FCEC0',
  warning: '#FFC94A',
  error: '#FF8FB3',
  info: '#C7A1E3',

  border: '#431863',
  divider: '#2B124C',
  overlay: 'rgba(15, 10, 23, 0.7)',

  icon: '#E5C3FF',
  iconSecondary: '#C7A1E3',

  tabBackground: '#1A0B2E',
  tabIconDefault: '#C7A1E3',
  tabIconSelected: '#FF77B7',

  notStarted: '#E89E93',
  inProgress: '#efd453',
  completed: '#b8c9a5',
};

const girlyPopGradients = {
  background: ['#FFF6FB', '#FFD3E2', '#EBD7FF', '#FFD3E2', '#FFF6FB'],
  card: ['#FFFFFF', '#FFF0F8'],
  button: ['#FF77B7', '#C77DFF'],
  accent: ['#FF4DA6', '#DDB6F2'],
};

const girlyPopDarkGradients = {
  background: ['#1A0B2E', '#2B124C', '#431863', '#2B124C', '#1A0B2E'],
  card: ['#2B124C', '#3B1E54'],
  button: ['#FF4DA6', '#9D4EDD'],
  accent: ['#FF77B7', '#E5C3FF'],
};

export const girlyPopLight: Theme = {
  ...baseLightTheme,
  colors: girlyPopLightColors,
  gradients: girlyPopGradients,
};

export const girlyPopDark: Theme = {
  ...baseDarkTheme,
  colors: girlyPopDarkColors,
  gradients: girlyPopDarkGradients,
};
