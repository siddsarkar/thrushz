import Icon from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { decode } from 'html-entities';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import TrackPlayer, {
  Track,
  useIsPlaying,
  useProgress,
} from 'react-native-track-player';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { withOpacity } from '@/utils/color';

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
  const { playing, bufferingDuringPlay } = useIsPlaying();
  const progress = position / duration;
  // @ts-expect-error - track.artwork is not typed
  const imageUri = track?.artwork?.uri || track?.artwork;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.primary }]}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 8,
          right: 8,
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
            style={[
              typography.caption,
              { color: withOpacity(colors.onPrimary, 0.7) },
            ]}
            numberOfLines={1}
          >
            {decode(track?.artist)}
          </Text>
        </View>
      </Pressable>
      <View style={styles.controls}>
        <Pressable onPress={playing ? TrackPlayer.pause : TrackPlayer.play}>
          <Icon
            name={playing ? 'add-circle-outline' : 'checkmark-circle'}
            size={28}
            color={colors.text}
            iconStyle="solid"
          />
        </Pressable>
        {bufferingDuringPlay ? (
          <View style={styles.button}>
            <Icon
              name="play-circle"
              size={28}
              color={colors.textMuted}
              iconStyle="solid"
            />
          </View>
        ) : (
          <Pressable
            onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
            style={styles.button}
          >
            <Icon
              name={playing ? 'pause' : 'play'}
              size={28}
              color={colors.text}
              iconStyle="solid"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 8,
    borderRadius: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingLeft: 8,
  },
  artworkContainer: {
    width: 42,
    height: 55,
    justifyContent: 'center',
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  controls: {
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    paddingRight: 16,
  },
});
