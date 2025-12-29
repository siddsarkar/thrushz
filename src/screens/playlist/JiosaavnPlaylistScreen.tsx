import React, { Suspense, use, useCallback } from 'react';
import { Text } from 'react-native';
import TrackPlayer from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiPlaylist } from '@/api/jiosaavn';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { PlaylistLayout } from '@/components/layouts/playlist-layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useThemeColors } from '@/theme/hooks/useTheme';

const fetchPlaylist = async (id: string): Promise<JiosaavnApiPlaylist> => {
  const playlist = await jiosaavnApi.getPlaylistDetails(id, {
    perPage: 100,
  });
  return playlist;
};

const PlaylistDisplay = ({
  playlistPromise,
}: {
  playlistPromise: Promise<JiosaavnApiPlaylist>;
}) => {
  const playlist = use(playlistPromise);

  const onItemPress = useCallback(
    async (item: { id: string; title: string; image?: string }) => {
      const song = playlist.list.find((s) => s.id === item.id);
      if (song) {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          url:
            createDownloadLinks(song.more_info.encrypted_media_url || '')[0]
              ?.url || '',
          title: song.title,
          artist: song.more_info.artistMap?.primary_artists[0]?.name || '',
          artwork: createImageLinks(song.image || '')[0]?.url || '',
          duration: Number(song.more_info.duration || 0),
          id: song.id,
        });
        await TrackPlayer.play();
      }
    },
    [playlist.list]
  );

  return (
    <PlaylistLayout
      title={playlist.title || ''}
      listCount={Number(playlist.list_count)}
      image={playlist.image}
      description={playlist.header_desc || ''}
      songs={playlist.list.map((song) => ({
        id: song.id,
        title: song.title || '',
        image: song.image || '',
      }))}
      onItemPress={onItemPress}
    />
  );
};

export default function JiosaavnPlaylistScreen({
  playlistId,
}: {
  playlistId: string;
}) {
  const songsPromise = fetchPlaylist(playlistId);
  const colors = useThemeColors();

  return (
    <ErrorBoundary fallback={<Text style={{ color: colors.text }}>Error</Text>}>
      <Suspense
        fallback={<Text style={{ color: colors.text }}>Loading...</Text>}
      >
        <PlaylistDisplay playlistPromise={songsPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
