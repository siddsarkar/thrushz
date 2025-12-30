import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export const PlaybackError: React.FC<{
  error?: string;
}> = ({ error }) => {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  if (!error) return null;
  return (
    <View style={styles.container}>
      <Text style={[typography.body, { color: colors.error }]}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 24,
    alignSelf: 'center',
  },
  text: {
    width: '100%',
    textAlign: 'center',
  },
});
