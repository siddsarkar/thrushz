import Icon from '@expo/vector-icons/Ionicons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from 'react-native-track-player';

import { PlayerControls } from '@/components/player/PlayerControls';
import { Progress } from '@/components/player/Progress';
import { Spacer } from '@/components/player/Spacer';
import { TrackInfo } from '@/components/player/TrackInfo';
import { useThemeColors } from '@/theme/hooks/useTheme';

export function NowPlayingSheet({
  onClosePress,
  track,
}: {
  track?: Track;
  onClosePress: () => void;
}) {
  const colors = useThemeColors();
  const { accent: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor }}
    >
      <View
        style={{
          paddingTop: insets.top,
          height: windowHeight - insets.bottom - insets.top,
        }}
      >
        <Pressable
          onPress={onClosePress}
          style={{ padding: 20, paddingVertical: 10 }}
        >
          <Icon name="arrow-back" size={28} color={colors.text} />
        </Pressable>
        <TrackInfo track={track} />
        <Progress live={track?.isLiveStream} />
        <Spacer />
        <PlayerControls />
        <Spacer mode={'expand'} />
      </View>
    </BottomSheetScrollView>
  );
}
