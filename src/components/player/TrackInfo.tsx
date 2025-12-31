import { Ionicons } from '@expo/vector-icons';
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

export const TrackInfo = ({
  track,
  isFavorite,
  toggleFavorite,
}: {
  track?: Track;
  isFavorite: boolean;
  toggleFavorite: () => void;
}) => {
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
      <View
        style={{
          width: '90%',
          gap: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[typography.h4, { color: colors.text }]}
          >
            {decode(track?.title || '')}
          </Text>
          <Text
            numberOfLines={1}
            style={[typography.body, { color: colors.textSecondary }]}
          >
            {decode(track?.artist || '')}
          </Text>
        </View>
        <Ionicons
          name={isFavorite ? 'bookmark' : 'bookmark-outline'}
          size={30}
          color={colors.text}
          onPress={toggleFavorite}
        />
      </View>
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
});
