import Icon from '@expo/vector-icons/Ionicons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from 'react-native-track-player';

import { PlayerControls } from '@/components/player/PlayerControls';
import { Progress } from '@/components/player/Progress';
import { TrackInfo } from '@/components/player/TrackInfo';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

import { PlayerVolumeControls } from './PlayerVolumeControls';
import { Spacer } from './Spacer';

export function NowPlayingSheet({
  onClosePress,
  track,
}: {
  track?: Track;
  onClosePress: () => void;
}) {
  const colors = useThemeColors();
  const { primary: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const typography = useThemeTypography();
  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor, paddingTop: insets.top }}
    >
      <View
        style={{
          height: windowHeight - insets.bottom - insets.top,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          <Pressable onPress={onClosePress} style={{ padding: 20 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[typography.h6, { color: colors.text }]}>
              Now Playing
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {track?.album || 'Unknown Album'}
            </Text>
          </View>
          <Pressable onPress={onClosePress} style={{ padding: 20 }}>
            <Icon name="ellipsis-vertical" size={24} color={colors.text} />
          </Pressable>
        </View>
        <TrackInfo track={track} />
        <Progress live={track?.isLiveStream} />
        <PlayerControls />
        <Spacer mode="expand" />
        <View style={{ padding: 20, paddingBottom: insets.bottom }}>
          <PlayerVolumeControls />
        </View>
        <Spacer mode="expand" />
      </View>
    </BottomSheetScrollView>
  );
}
