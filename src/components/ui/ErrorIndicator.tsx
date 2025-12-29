import { Text, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export function ErrorIndicator() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.text }}>Error</Text>
    </View>
  );
}
