import { useThemeColors } from '@/theme/hooks/useTheme';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button, View, useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from 'react-native-track-player';
import { PlayerControls } from './PlayerControls';
import { Progress } from './Progress';
import { Spacer } from './Spacer';
import { TrackInfo } from './TrackInfo';

export function NowPlayingSheet({
  onClosePress,
  track,
}: {
  track?: Track;
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
          paddingTop: insets.top,
          height: windowHeight - insets.bottom - insets.top,
        }}
      >
        <TrackInfo track={track} />
        <Progress live={track?.isLiveStream} />
        <Spacer />
        <PlayerControls />
        <Spacer mode={'expand'} />
        <Button title="Close" onPress={onClosePress} />
      </View>
    </BottomSheetScrollView>
  );
}
