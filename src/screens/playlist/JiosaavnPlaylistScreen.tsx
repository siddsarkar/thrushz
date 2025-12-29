import React, { Suspense, use, useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiPlaylist } from '@/api/jiosaavn';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ListLayout } from '@/components/layouts/list-layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

const fetchPlaylist = async (id: string): Promise<JiosaavnApiPlaylist> => {
  if (!id) return Promise.reject('No playlistId provided!');

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
    <ListLayout
      title={playlist.title || ''}
      itemCount={Number(playlist.list_count)}
      image={playlist.image}
      description={playlist.header_desc || ''}
      items={playlist.list.map((song) => ({
        description: `${song.more_info.album} &bull; ${song.more_info.artistMap?.primary_artists[0]?.name}`,
        duration: Number(song.more_info.duration || 0),
        ...song,
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
  if (!playlistId) return <ErrorIndicator />;

  const songsPromise = fetchPlaylist(playlistId);

  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator />}>
        <PlaylistDisplay playlistPromise={songsPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
