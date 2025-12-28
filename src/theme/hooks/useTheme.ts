import { ThemeContext } from '@/theme/context/ThemeContext';
import { ThemeContextType } from '@/theme/types';
import { useContext } from 'react';

// Hook to use the theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hooks for specific theme properties
export const useThemeColors = () => useTheme().theme.colors;
export const useThemeTypography = () => useTheme().theme.typography;
export const useThemeSpacing = () => useTheme().theme.spacing;
export const useThemeRadii = () => useTheme().theme.radii;
export const useThemeShadows = () => useTheme().theme.shadows;
export const useThemeGradients = () => useTheme().theme.gradients;
export const useIsDark = () => useTheme().isDark;
export const useIsSystem = () => useTheme().isSystem;
