import { ActivityIndicator, Text, View } from 'react-native';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export function LoadingIndicator({ text }: { text?: string }) {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {text && (
        <Text style={[typography.body, { color: colors.text }]}>{text}</Text>
      )}
    </View>
  );
}
