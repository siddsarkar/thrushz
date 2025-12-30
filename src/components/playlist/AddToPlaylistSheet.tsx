import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { decode } from 'html-entities';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { jiosaavnApi } from '@/api/jiosaavn';
import type { JiosaavnApiSong } from '@/api/jiosaavn/models/Song';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { db } from '@/db';
import { playlistsSongsTable, playlistsTable } from '@/db/schema';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

function ListItemButton({
  Icon,
  title,
  onPress,
}: {
  Icon: React.ReactNode;
  title: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        {Icon}
      </View>
      <Text style={{ color: colors.text }}>{title}</Text>
    </Pressable>
  );
}

export function AddToPlaylistSheet({
  trackId,
  onCreatePlaylistPress,
}: {
  trackId: string | null;
  onCreatePlaylistPress?: () => void;
}) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { card: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [track, setTrack] = useState<JiosaavnApiSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: playlists } = useLiveQuery(db.select().from(playlistsTable));
  const { data: playlistsSongs } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(eq(playlistsSongsTable.songId, trackId || ''))
  );

  useEffect(() => {
    if (!trackId) {
      setTrack(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setTrack(null);

    jiosaavnApi
      .getSongDetailsById(trackId)
      .then((response) => {
        if (response.songs && response.songs.length > 0) {
          setTrack(response.songs[0]);
        } else {
          setError('Track not found');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load track details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [trackId]);

  const toggleItemInPlaylist = useCallback(
    (playlistId: string) => {
      if (!trackId) return;
      const isInPlaylist = playlistsSongs?.some(
        (song) => song.playlistId === playlistId
      );
      if (isInPlaylist) {
        db.delete(playlistsSongsTable)
          .where(
            and(
              eq(playlistsSongsTable.playlistId, playlistId),
              eq(playlistsSongsTable.songId, trackId)
            )
          )
          .then(() => {
            console.log('playlist item removed');
          });
      } else {
        db.insert(playlistsSongsTable)
          .values({
            playlistId,
            songId: trackId,
          })
          .then(() => {
            console.log('playlist item added');
          });
      }
    },
    [trackId, playlistsSongs]
  );

  const primaryArtists =
    track?.more_info?.artistMap?.primary_artists
      ?.map((artist) => artist.name)
      .join(', ') || '';
  const featuredArtists =
    track?.more_info?.artistMap?.featured_artists
      ?.map((artist) => artist.name)
      .join(', ') || '';
  const allArtists = featuredArtists
    ? `${primaryArtists} (feat. ${featuredArtists})`
    : primaryArtists;

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor }}
    >
      <View
        style={{
          paddingTop: insets.top,
          minHeight: windowHeight - insets.bottom - insets.top,
        }}
      >
        {loading && <LoadingIndicator />}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <ErrorIndicator />
            <Text
              style={[
                typography.body,
                { color: colors.textMuted, marginTop: 16 },
              ]}
            >
              {error}
            </Text>
          </View>
        )}

        <ListItemButton
          Icon={
            <MaterialIcons name="playlist-add" size={24} color={colors.text} />
          }
          title="Create playlist"
          onPress={onCreatePlaylistPress}
        />

        {playlists.map((playlist) => (
          <ListItemButton
            key={playlist.id}
            Icon={
              playlistsSongs?.some(
                (song) => song.playlistId === playlist.id
              ) ? (
                <MaterialIcons
                  name="playlist-add-check"
                  size={24}
                  color={colors.text}
                />
              ) : (
                <MaterialIcons
                  name="playlist-add"
                  size={24}
                  color={colors.text}
                />
              )
            }
            title={playlist.name}
            onPress={() => toggleItemInPlaylist(playlist.id)}
          />
        ))}
      </View>
    </BottomSheetScrollView>
  );
}

function InfoRow({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
  typography: ReturnType<typeof useThemeTypography>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
        {label}:
      </Text>
      <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
        {decode(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: '90%',
    aspectRatio: 1,
    marginTop: '2%',
    marginBottom: '5%',
  },
  titleText: {
    // textAlign: 'center',
    fontWeight: '600',
    marginTop: 30,
  },
  subtitleText: {
    // textAlign: 'center',
    marginTop: 8,
  },
  artistText: {
    // textAlign: 'center',
    fontWeight: '200',
    marginTop: '2%',
  },
  infoSection: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    // alignItems: 'flex-start',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
