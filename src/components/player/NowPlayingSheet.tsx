import Icon from '@expo/vector-icons/Ionicons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from 'react-native-track-player';

import { PlayerControls } from '@/components/player/PlayerControls';
import { PlayerVolumeControls } from '@/components/player/PlayerVolumeControls';
import { Progress } from '@/components/player/Progress';
import { Spacer } from '@/components/player/Spacer';
import { TrackInfo } from '@/components/player/TrackInfo';
import { db, LIKED_SONGS_PLAYLIST_ID } from '@/db';
import { playlistsSongsTable } from '@/db/schema';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

const useSongIsFavorite = (trackId?: string | null) => {
  const { data: playlistSong } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
          eq(playlistsSongsTable.songId, trackId || '')
        )
      )
  );

  const toggleFavorite = useCallback(async () => {
    if (!trackId) return;
    const isFav = await db
      .select()
      .from(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
          eq(playlistsSongsTable.songId, trackId)
        )
      );
    if (isFav.length > 0) {
      db.delete(playlistsSongsTable)
        .where(
          and(
            eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
            eq(playlistsSongsTable.songId, trackId)
          )
        )
        .then(() => {
          console.log('playlist item removed from favorites');
        });
    } else {
      db.insert(playlistsSongsTable)
        .values({
          playlistId: LIKED_SONGS_PLAYLIST_ID,
          songId: trackId,
        })
        .then(() => {
          console.log('playlist item added to favorites');
        });
    }
  }, [trackId]);

  return {
    isFavorite: playlistSong && playlistSong.length > 0,
    toggleFavorite,
  };
};

export function NowPlayingSheet({
  onClosePress,
  track,
}: {
  track?: Track;
  onClosePress: () => void;
}) {
  const colors = useThemeColors();
  const { isFavorite, toggleFavorite } = useSongIsFavorite(track?.id);
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
    </BottomSheetScrollView>
  );
}
