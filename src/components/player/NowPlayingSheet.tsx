import Icon from '@expo/vector-icons/Ionicons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from 'react-native-track-player';

import { PlayerControls } from '@/components/player/PlayerControls';
import { PlayerVolumeControls } from '@/components/player/PlayerVolumeControls';
import { Progress } from '@/components/player/Progress';
import { Spacer } from '@/components/player/Spacer';
import { TrackInfo } from '@/components/player/TrackInfo';
import { usePlayerTrackFavorite } from '@/hooks/player/usePlayerTrackFavorite';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

import { OptionSheet } from './OptionSheet';

export function NowPlayingSheet({
  onClosePress,
  track,
}: {
  track?: Track;
  onClosePress: () => void;
}) {
  const colors = useThemeColors();
  const { isFavorite, toggleFavorite } = usePlayerTrackFavorite(track?.id);
  const { primary: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const typography = useThemeTypography();

  const optionsSheetRef = useRef<BottomSheetModal>(null);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);

  useBottomSheetBack(optionsSheetOpen, optionsSheetRef, () =>
    setOptionsSheetOpen(false)
  );

  const handleOptionsSheetPress = useCallback(() => {
    optionsSheetRef.current?.present();
    setOptionsSheetOpen(true);
  }, []);

  const handleOptionsSheetDismiss = useCallback(() => {
    setOptionsSheetOpen(false);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

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
          <Pressable onPress={handleOptionsSheetPress} style={{ padding: 20 }}>
            <Icon name="ellipsis-vertical" size={24} color={colors.text} />
          </Pressable>
        </View>
        <TrackInfo
          track={track}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
        />
        <Progress live={track?.isLiveStream} />
        <PlayerControls />
        <Spacer mode="expand" />
        <View style={{ padding: 20, paddingBottom: insets.bottom }}>
          <PlayerVolumeControls />
        </View>
        <Spacer mode="expand" />
      </View>
      <BottomSheetModal
        ref={optionsSheetRef}
        stackBehavior="push"
        snapPoints={['50%']}
        handleComponent={null}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        onDismiss={handleOptionsSheetDismiss}
        containerStyle={{ marginTop: insets.top }}
        style={{ padding: 16, backgroundColor: colors.background }}
        backgroundStyle={{ backgroundColor: 'transparent' }}
      >
        <OptionSheet />
      </BottomSheetModal>
    </BottomSheetScrollView>
  );
}
