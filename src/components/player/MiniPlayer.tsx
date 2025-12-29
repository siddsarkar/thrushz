import { Image } from 'expo-image';
import { decode } from 'html-entities';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Track } from 'react-native-track-player';

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
  // @ts-expect-error - track.artwork is not typed
  const imageUri = track?.artwork?.uri || track?.artwork;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
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
            style={[typography.caption, { color: colors.textMuted }]}
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
    height: 52,
    justifyContent: 'flex-end',
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
