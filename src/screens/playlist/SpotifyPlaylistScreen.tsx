import { Suspense, use } from 'react';
import { Text } from 'react-native';

import {
  spotifyApi,
  SpotifyPlaylistDetailsWithFields,
  SpotifyPlaylistTrack,
} from '@/api';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { PlaylistLayout } from '@/components/layouts/playlist-layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useThemeColors } from '@/theme/hooks/useTheme';

const fetchPlaylist = async (id: string, token: string) => {
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
    <PlaylistLayout
      title={playlist.name}
      listCount={songs.length}
      image={playlist.images[0].url}
      description={playlist.description}
      songs={songs.map((item) => ({
        id: item.track.id,
        title: item.track.name,
        image: item.track.album.images[0].url,
      }))}
      //   onItemPress={handlePress}
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
  const colors = useThemeColors();

  return (
    <ErrorBoundary fallback={<Text style={{ color: colors.text }}>Error</Text>}>
      <Suspense
        fallback={<Text style={{ color: colors.text }}>Loading...</Text>}
      >
        <SpotifyPlaylistDisplay
          songsPromise={songsPromise}
          playlistPromise={playlistPromise}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
