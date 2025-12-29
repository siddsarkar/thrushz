import { Image } from 'expo-image';
import { decode } from 'html-entities';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Track } from 'react-native-track-player';

import {
  useThemeColors,
  useThemeShadows,
  useThemeTypography,
} from '@/theme/hooks/useTheme';

export const TrackInfo = ({ track }: { track?: Track }) => {
  const colors = useThemeColors();
  const shadows = useThemeShadows();
  const typography = useThemeTypography();

  // @ts-expect-error - track.artwork is not typed
  const imageUri = track?.artwork?.uri || track?.artwork;

  return (
    <View style={styles.container}>
      <Image
        style={[
          styles.artwork,
          { backgroundColor: colors.border, ...shadows.sm },
        ]}
        source={{ uri: imageUri }}
      />
      <Text style={[typography.h1, styles.titleText, { color: colors.text }]}>
        {decode(track?.title || '')}
      </Text>
      <Text
        style={[typography.body, styles.artistText, { color: colors.text }]}
      >
        {decode(track?.artist || '')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    width: '90%',
    aspectRatio: 1,
    marginTop: '2%',
    marginBottom: '5%',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 30,
  },
  artistText: {
    textAlign: 'center',
    fontWeight: '200',
    marginTop: '2%',
  },
});
