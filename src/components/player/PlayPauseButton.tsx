import Icon from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import TrackPlayer, { useIsPlaying } from 'react-native-track-player';

import { useThemeColors } from '@/theme/hooks/useTheme';

export const PlayPauseButton: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const colors = useThemeColors();
  const { playing, bufferingDuringPlay } = useIsPlaying();

  return (
    <View style={styles.container}>
      {bufferingDuringPlay ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Pressable
          onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
          style={styles.button}
        >
          <Icon
            name={playing ? 'pause' : 'play'}
            size={size}
            color={colors.text}
            iconStyle="solid"
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
