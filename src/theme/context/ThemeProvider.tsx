import * as StatusBar from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useStorageState } from '@/hooks/useStorageState';
import { ThemeContext } from '@/theme/context/ThemeContext';
import { getTheme } from '@/theme/theme';
import { ThemeContextType, ThemeMode, ThemeScheme } from '@/theme/types';

interface ThemeProviderProps {
  systemSchemeIsDark: boolean;
  children: React.ReactNode;
}

export function ThemeProvider({
  systemSchemeIsDark,
  children,
}: ThemeProviderProps) {
  // Storage states for persistence
  const [[modeLoading, mode], setThemeMode] = useStorageState('themeMode');
  const [[schemeLoading, scheme], setThemeScheme] =
    useStorageState('themeScheme');

  // Actions
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setThemeMode(newMode);
    },
    [setThemeMode]
  );

  const setScheme = useCallback(
    (newScheme: ThemeScheme) => {
      setThemeScheme(newScheme);
    },
    [setThemeScheme]
  );

  // Computed values
  const systemMode: 'light' | 'dark' = systemSchemeIsDark ? 'dark' : 'light';
  const effectiveMode =
    mode === 'system' || !mode ? systemMode : mode || 'light';
  const isDark = effectiveMode === 'dark';
  const isSystem = mode === 'system';

  // Get the current theme
  const theme = useMemo(() => {
    const currentScheme = (scheme || 'minimal') as ThemeScheme;
    return getTheme(currentScheme, isDark);
  }, [scheme, isDark]);

  // Handle status bar changes
  useEffect(() => {
    const statusBarStyle = isDark ? 'light' : 'dark';

    StatusBar.setStatusBarStyle(statusBarStyle, false);

    // Set it again after a delay to ensure it takes effect
    const timeoutId = setTimeout(() => {
      StatusBar.setStatusBarStyle(statusBarStyle, false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isDark]);

  // Loading state
  const loading = modeLoading || schemeLoading;

  const contextValue: ThemeContextType = useMemo(
    () => ({
      theme,
      mode: (mode || 'system') as ThemeMode,
      scheme: (scheme || 'minimal') as ThemeScheme,
      systemMode,
      isDark,
      isSystem,
      setMode,
      setScheme,
      loading,
    }),
    [
      theme,
      mode,
      scheme,
      systemMode,
      isDark,
      isSystem,
      setMode,
      setScheme,
      loading,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
