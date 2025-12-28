import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { Text, View } from 'react-native';

export default function Index() {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.border,
      }}
    >
      <Text
        style={{ color: colors.text, ...typography.h1, textAlign: 'center' }}
      >
        Edit app/index.tsx to edit this screen.
      </Text>
    </View>
  );
}
