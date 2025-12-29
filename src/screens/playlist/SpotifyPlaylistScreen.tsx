import { Suspense, use } from 'react';

import {
  spotifyApi,
  SpotifyPlaylistDetailsWithFields,
  SpotifyPlaylistTrack,
} from '@/api';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { ListLayout } from '@/components/layouts/list-layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

const fetchPlaylist = async (id: string, token: string) => {
  if (!id || !token) return Promise.reject('No token or playlistId provided!');

  const playlist = await spotifyApi.fetchPlaylistDetails(id, undefined, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return playlist;
};

const fetchPlaylistSongs = async (
  id: string,
  token: string
): Promise<SpotifyPlaylistTrack[]> => {
  if (!id || !token) return Promise.reject('No token or playlistId provided!');

  const playlist = await spotifyApi.fetchAllItemsInPlaylist(id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return playlist;
};

const SpotifyPlaylistDisplay = ({
  songsPromise,
  playlistPromise,
}: {
  songsPromise: Promise<SpotifyPlaylistTrack[]>;
  playlistPromise: Promise<
    SpotifyPlaylistDetailsWithFields<['name', 'images', 'description']>
  >;
}) => {
  const songs = use(songsPromise);
  const playlist = use(playlistPromise);
  return (
    <ListLayout
      title={playlist.name}
      itemCount={songs.length}
      image={playlist.images[0].url}
      description={playlist.description}
      items={songs.map((item) => ({
        ...item.track,
        id: item.track.id,
        title: item.track.name,
        description: item.track.artists.map((artist) => artist.name).join(', '),
        image: item.track.album.images[0].url,
        duration: Math.floor(item.track.duration_ms / 1000),
      }))}
    />
  );
};

export default function SpotifyPlaylistScreen({
  playlistId,
}: {
  playlistId: string;
}) {
  const { token } = useSession();
  const songsPromise = fetchPlaylistSongs(playlistId, token || '');
  const playlistPromise = fetchPlaylist(playlistId, token || '');

  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator />}>
        <SpotifyPlaylistDisplay
          songsPromise={songsPromise}
          playlistPromise={playlistPromise}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
