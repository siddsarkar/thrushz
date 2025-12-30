import { Image } from 'expo-image';
import { decode } from 'html-entities';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Track, useProgress } from 'react-native-track-player';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

import { PlayPauseButton } from './PlayPauseButton';

export function MiniPlayer({
  track,
  onPress,
}: {
  track?: Track;
  onPress: () => void;
}) {
  const typography = useThemeTypography();
  const colors = useThemeColors();
  const { position, duration } = useProgress();
  const progress = position / duration;
  // @ts-expect-error - track.artwork is not typed
  const imageUri = track?.artwork?.uri || track?.artwork;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.primary }]}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          height: 2,
          backgroundColor: colors.textMuted,
        }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: colors.text,
          }}
        />
      </View>
      <Pressable style={styles.container} onPress={onPress}>
        <View style={styles.artworkContainer}>
          <Image style={styles.artwork} source={{ uri: imageUri }} />
        </View>
        <View style={styles.info}>
          <Text
            style={[typography.body, { color: colors.text }]}
            numberOfLines={1}
          >
            {decode(track?.title)}
          </Text>
          <Text
            style={[typography.caption, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {decode(track?.artist)}
          </Text>
        </View>
      </Pressable>
      <View style={styles.controls}>
        <PlayPauseButton size={28} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingLeft: 16,
  },
  artworkContainer: {
    width: 50,
    height: 60,
    justifyContent: 'center',
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    flex: 1,
  },
  controls: {
    gap: 10,
  },
});
