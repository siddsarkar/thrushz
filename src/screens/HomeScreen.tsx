import Icon from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { forwardRef, Ref, Suspense, use } from 'react';
import { FlatList, Pressable, SectionList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { jiosaavnApi, JiosaavnApiPlaylistMini } from '@/api/jiosaavn';
import { spotifyApi, SpotifyPlaylist } from '@/api/spotify';
import ambientSounds from '@/assets/data/google-ambient-sounds.json';
import localPlaylist from '@/assets/data/playlist.json';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

const fetchSpotifyUserPlaylists = async (
  userId?: string,
  token?: string
): Promise<SpotifyPlaylist[]> => {
  if (!userId || !token) {
    return Promise.reject('No token or userId provided!');
  }
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

type PlaylistItemDisplayProps = {
  title: string;
  image?: string;
  description?: string;
};

const PlaylistItemDisplay = forwardRef<View, PlaylistItemDisplayProps>(
  (
    { title, image, description, ...props }: PlaylistItemDisplayProps,
    ref: Ref<View>
  ) => {
    const colors = useThemeColors();
    const typography = useThemeTypography();
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          width: 150,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Image
          source={{ uri: image }}
          style={{ width: '100%', aspectRatio: 1 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
          {description && (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {description}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
);

PlaylistItemDisplay.displayName = 'PlaylistItemDisplay';

const AmbientSoundsPlaylistDisplay = () => {
  return (
    <Link href={{ pathname: '/playlist/ambient-sounds' }} asChild>
      <PlaylistItemDisplay
        title="Ambient Sounds"
        image={ambientSounds[0].artwork}
      />
    </Link>
  );
};

const SampleLocalPlaylistDisplay = () => {
  return (
    <Link href={{ pathname: '/playlist/sample-playlist' }} asChild>
      <PlaylistItemDisplay
        title="Sample Playlist"
        image={localPlaylist[0].artwork}
      />
    </Link>
  );
};

const SpotifyPlaylistDisplay = ({
  playlist,
}: {
  playlist: SpotifyPlaylist;
}) => {
  return (
    <Link
      href={{
        pathname: '/playlist/spotify/[id]',
        params: { id: playlist.id },
      }}
      asChild
    >
      <PlaylistItemDisplay
        title={playlist.name || ''}
        image={playlist.images[0].url}
      />
    </Link>
  );
};

const JiosaavnPlaylistDisplay = ({
  playlist,
}: {
  playlist: JiosaavnApiPlaylistMini;
}) => {
  return (
    <Link
      href={{
        pathname: '/playlist/jiosaavn/[id]',
        params: { id: playlist.perma_url.split('/').pop() || '' },
      }}
      asChild
    >
      <PlaylistItemDisplay
        title={playlist.title || ''}
        image={playlist.image}
      />
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

  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  return (
    <SectionList<{
      playlist: JiosaavnApiPlaylistMini | SpotifyPlaylist | { id: string };
      source: 'jiosaavn' | 'spotify' | 'local';
    }>
      style={{ flex: 1, paddingTop: insets.top }}
      sections={[
        {
          title: 'Ambient Sounds',
          data: [
            { playlist: { id: 'ambient-sounds' }, source: 'local' },
            { playlist: { id: 'sample-playlist' }, source: 'local' },
          ],
        },
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
      ]}
      renderItem={() => null}
      ListHeaderComponent={
        <View
          style={{
            padding: 16,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={[typography.h1, { color: colors.text }]}>Home</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Icon name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      }
      renderSectionHeader={({ section: { title, data } }) => (
        <View>
          <View style={{ padding: 16 }}>
            <Text style={[typography.bodyLarge, { color: colors.text }]}>
              {title}
            </Text>
          </View>
          <FlatList
            data={data}
            horizontal
            contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
            renderItem={({ item }) =>
              item.source === 'jiosaavn' ? (
                <JiosaavnPlaylistDisplay
                  playlist={item.playlist as JiosaavnApiPlaylistMini}
                />
              ) : item.source === 'spotify' ? (
                <SpotifyPlaylistDisplay
                  playlist={item.playlist as SpotifyPlaylist}
                />
              ) : item.source === 'local' ? (
                item.playlist.id === 'ambient-sounds' ? (
                  <AmbientSoundsPlaylistDisplay />
                ) : (
                  <SampleLocalPlaylistDisplay />
                )
              ) : null
            }
          />
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

  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator />}>
        <PlaylistListDisplay
          jiosaavnTopPlaylistsPromise={jiosaavnTopPlaylists}
          spotifyUserPlaylistsPromise={spotifyUserPlaylists}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
