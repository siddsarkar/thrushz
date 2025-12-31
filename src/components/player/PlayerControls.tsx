import Icon from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import TrackPlayer, { usePlaybackState } from 'react-native-track-player';

import { PlaybackError } from '@/components/player/PlaybackError';
import { PlayerRepeatModeToggle } from '@/components/player/PlayerRepeatModeToggle';
import { PlayPauseButton } from '@/components/player/PlayPauseButton';
import { Spacer } from '@/components/player/Spacer';
import { useThemeColors } from '@/theme/hooks/useTheme';

const performSkipToNext = () => TrackPlayer.skipToNext();
const performSkipToPrevious = () => TrackPlayer.skipToPrevious();

export const PlayerControls: React.FC = () => {
  const colors = useThemeColors();
  const playback = usePlaybackState();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PlayerRepeatModeToggle size={30} />
        <Spacer mode="expand" />
        <TouchableWithoutFeedback onPress={performSkipToPrevious}>
          <Icon
            name="play-skip-back"
            size={30}
            color={colors.text}
            iconStyle="solid"
          />
        </TouchableWithoutFeedback>
        <PlayPauseButton size={80} />
        <TouchableWithoutFeedback onPress={performSkipToNext}>
          <Icon
            name="play-skip-forward"
            size={30}
            color={colors.text}
            iconStyle="solid"
          />
        </TouchableWithoutFeedback>
        <Spacer mode="expand" />
        <TouchableWithoutFeedback onPress={() => router.push('/queue')}>
          <Icon
            name="list-outline"
            size={30}
            color={colors.text}
            iconStyle="solid"
          />
        </TouchableWithoutFeedback>
      </View>
      <PlaybackError
        error={'error' in playback ? playback.error.message : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
