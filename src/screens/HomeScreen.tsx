import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Suspense, use } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

import { jiosaavnApi, JiosaavnApiPlaylistMini } from '@/api/jiosaavn';
import { spotifyApi, SpotifyPlaylist } from '@/api/spotify';
import ambientSounds from '@/assets/data/google-ambient-sounds.json';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useThemeColors } from '@/theme/hooks/useTheme';

const fetchSpotifyUserPlaylists = async (
  userId: string,
  token: string
): Promise<SpotifyPlaylist[]> => {
  const playlists = await spotifyApi.fetchUserPlaylists(userId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return playlists.items;
};

const fetchJiosaavnTopPlaylists = async (): Promise<
  JiosaavnApiPlaylistMini[]
> => {
  const playlists = await jiosaavnApi.getLaunchData();
  return playlists.top_playlists;
};

const AmbientSoundsPlaylistDisplay = () => {
  const colors = useThemeColors();
  return (
    <Link
      href={{
        pathname: '/playlist/ambient-sounds',
      }}
      asChild
    >
      <Pressable
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Image
          source={{ uri: ambientSounds[0].artwork }}
          style={{ width: 100, height: 100 }}
        />
        <Text style={{ color: colors.text }}>Ambient Sounds</Text>
      </Pressable>
    </Link>
  );
};

const SpotifyPlaylistDisplay = ({
  playlist,
}: {
  playlist: SpotifyPlaylist;
}) => {
  const colors = useThemeColors();
  return (
    <Link
      href={{
        pathname: '/playlist/spotify/[id]',
        params: { id: playlist.id },
      }}
      asChild
    >
      <Pressable>
        <Image
          source={{ uri: playlist.images[0].url }}
          style={{ width: 100, height: 100 }}
        />
        <Text style={{ color: colors.text }}>{playlist.name}</Text>
      </Pressable>
    </Link>
  );
};

const JiosaavnPlaylistDisplay = ({
  playlist,
}: {
  playlist: JiosaavnApiPlaylistMini;
}) => {
  const colors = useThemeColors();
  return (
    <Link
      href={{
        pathname: '/playlist/jiosaavn/[id]',
        params: { id: playlist.perma_url.split('/').pop() || '' },
      }}
      asChild
    >
      <Pressable>
        <Image
          source={{ uri: playlist.image }}
          style={{ width: 100, height: 100 }}
        />
        <Text style={{ color: colors.text }}>
          {playlist.name || playlist.title}
        </Text>
      </Pressable>
    </Link>
  );
};

const PlaylistListDisplay = ({
  jiosaavnTopPlaylistsPromise,
  spotifyUserPlaylistsPromise,
}: {
  jiosaavnTopPlaylistsPromise: Promise<JiosaavnApiPlaylistMini[]>;
  spotifyUserPlaylistsPromise: Promise<SpotifyPlaylist[]>;
}) => {
  const jiosaavnTopPlaylists = use(jiosaavnTopPlaylistsPromise);
  const spotifyUserPlaylists = use(spotifyUserPlaylistsPromise);
  const colors = useThemeColors();

  return (
    <SectionList<{
      playlist:
        | JiosaavnApiPlaylistMini
        | SpotifyPlaylist
        | typeof ambientSounds;
      source: 'jiosaavn' | 'spotify' | 'ambient-sounds';
    }>
      style={{ flex: 1 }}
      sections={[
        {
          title: 'Jiosaavn Top Playlists',
          data: jiosaavnTopPlaylists.map((playlist) => ({
            playlist,
            source: 'jiosaavn',
          })),
        },
        {
          title: 'Spotify User Playlists',
          data: spotifyUserPlaylists.map((playlist) => ({
            playlist,
            source: 'spotify',
          })),
        },
        {
          title: 'Ambient Sounds',
          data: [{ playlist: ambientSounds, source: 'ambient-sounds' }],
        },
      ]}
      renderItem={({
        item,
      }: {
        item: {
          playlist:
            | JiosaavnApiPlaylistMini
            | SpotifyPlaylist
            | typeof ambientSounds;
          source: 'jiosaavn' | 'spotify' | 'ambient-sounds';
        };
      }) =>
        item.source === 'jiosaavn' ? (
          <JiosaavnPlaylistDisplay
            playlist={item.playlist as JiosaavnApiPlaylistMini}
          />
        ) : item.source === 'spotify' ? (
          <SpotifyPlaylistDisplay playlist={item.playlist as SpotifyPlaylist} />
        ) : (
          <AmbientSoundsPlaylistDisplay />
        )
      }
      renderSectionHeader={({ section: { title } }) => (
        <View style={{ padding: 10 }}>
          <Text style={{ color: colors.text }}>{title}</Text>
        </View>
      )}
    />
  );
};

export default function HomeScreen() {
  const { user, token } = useSession();
  const jiosaavnTopPlaylists = fetchJiosaavnTopPlaylists();
  const spotifyUserPlaylists = fetchSpotifyUserPlaylists(
    user?.id || '',
    token || ''
  );
  const colors = useThemeColors();

  return (
    <ErrorBoundary fallback={<Text style={{ color: colors.text }}>Error</Text>}>
      <Suspense
        fallback={<Text style={{ color: colors.text }}>Loading...</Text>}
      >
        <PlaylistListDisplay
          jiosaavnTopPlaylistsPromise={jiosaavnTopPlaylists}
          spotifyUserPlaylistsPromise={spotifyUserPlaylists}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
