import { ActivityIndicator, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export function LoadingIndicator() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
