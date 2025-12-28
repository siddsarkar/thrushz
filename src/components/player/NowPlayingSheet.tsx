import { useThemeColors } from '@/theme/hooks/useTheme';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button, Text, View, useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NowPlayingSheet({
  onClosePress,
}: {
  onClosePress: () => void;
}) {
  const { accent: backgroundColor } = useThemeColors();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor }}
    >
      <View
        style={{
          height: windowHeight - insets.bottom - insets.top,
        }}
      >
        <Text>NowPlayingSheet</Text>
        <Button title="Close" onPress={onClosePress} />
      </View>
    </BottomSheetScrollView>
  );
}
