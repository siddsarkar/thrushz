import { Text, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export function ErrorIndicator({ error }: { error?: Error | string | null }) {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.text }}>
        {error instanceof Error
          ? error.message
          : error || 'Something went wrong.'}
      </Text>
    </View>
  );
}
