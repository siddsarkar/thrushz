import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { decode } from 'html-entities';
import { useEffect, useState } from 'react';
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
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatDuration } from '@/utils/format/duration';
import { formatNumber } from '@/utils/format/number';

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

export function JiosaavnTrackInfoSheet({
  trackId,
  onAddToPlaylistPress,
  onDownloadPress,
}: {
  trackId: string | null;
  onAddToPlaylistPress?: () => void;
  onDownloadPress?: () => void;
}) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const { card: backgroundColor } = colors;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [track, setTrack] = useState<JiosaavnApiSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          title="Add to playlist"
          onPress={onAddToPlaylistPress}
        />
        <ListItemButton
          Icon={<MaterialIcons name="download" size={24} color={colors.text} />}
          title="Download"
          onPress={onDownloadPress}
        />

        {track && !loading && (
          <View style={styles.container}>
            <View style={styles.infoSection}>
              {allArtists && (
                <InfoRow
                  label="Artists"
                  value={allArtists}
                  colors={colors}
                  typography={typography}
                />
              )}
              {track.more_info?.album && (
                <InfoRow
                  label="Album"
                  value={track.more_info.album}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.more_info?.duration && (
                <InfoRow
                  label="Duration"
                  value={formatDuration(Number(track.more_info.duration))}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.year && (
                <InfoRow
                  label="Year"
                  value={track.year}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.language && (
                <InfoRow
                  label="Language"
                  value={track.language}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.more_info?.release_date && (
                <InfoRow
                  label="Release Date"
                  value={track.more_info.release_date}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.more_info?.label && (
                <InfoRow
                  label="Label"
                  value={track.more_info.label}
                  colors={colors}
                  typography={typography}
                />
              )}

              {track.play_count && (
                <InfoRow
                  label="Play Count"
                  value={formatNumber(Number(track.play_count))}
                  colors={colors}
                  typography={typography}
                />
              )}
            </View>
          </View>
        )}
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
