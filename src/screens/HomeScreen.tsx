import Icon from '@expo/vector-icons/Ionicons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { forwardRef, Fragment, Ref, Suspense, use, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { jiosaavnApi, JiosaavnApiPlaylistMini } from '@/api/jiosaavn';
import { spotifyApi, SpotifyPlaylist } from '@/api/spotify';
import ambientSounds from '@/assets/data/google-ambient-sounds.json';
import localPlaylist from '@/assets/data/playlist.json';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { db } from '@/db';
import { playlistsTable } from '@/db/schema';
import {
  useThemeColors,
  useThemeShadows,
  useThemeTypography,
} from '@/theme/hooks/useTheme';

const fetchSpotifyUserPlaylists = async (
  userId?: string,
  token?: string
): Promise<SpotifyPlaylist[]> => {
  if (!userId || !token) {
    return Promise.reject('No token or userId provided!');
  }
  const playlists = await spotifyApi.fetchUserPlaylists(userId);
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
          // alignItems: 'center',
          gap: 10,
        }}
      >
        <Image
          source={{
            uri: image,
          }}
          placeholder={require('@/assets/images/app-icon.png')}
          style={{
            width: '100%',
            aspectRatio: 1,
            backgroundColor: colors.card,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[typography.body, { color: colors.text }]}
          >
            {title}
          </Text>
          {description && (
            <Text
              numberOfLines={1}
              style={[typography.caption, { color: colors.textMuted }]}
            >
              {description}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
);
PlaylistItemDisplay.displayName = 'PlaylistItemDisplay';

const PlaylistItemDisplayInline = forwardRef<View, PlaylistItemDisplayProps>(
  (
    { title, image, description, ...props }: PlaylistItemDisplayProps,
    ref: Ref<View>
  ) => {
    const colors = useThemeColors();
    const shadows = useThemeShadows();
    return (
      <Pressable
        ref={ref}
        {...props}
        style={{
          ...shadows.xs,
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.card,
          maxWidth: '48%',
          borderRadius: 4,
          overflow: 'hidden',
          paddingRight: 5,
        }}
      >
        <ListItem
          onPress={(props as { onPress: () => void }).onPress}
          title={title}
          titleStyle={{ lineHeight: 18, fontSize: 13, fontWeight: 600 }}
          numberOfLinesTitle={2}
          description={description}
          image={image}
        />
      </Pressable>
    );
  }
);
PlaylistItemDisplayInline.displayName = 'PlaylistItemDisplayInline';

const MyPlaylistsPlaylistDisplay = () => {
  const { data: playlists } = useLiveQuery(db.select().from(playlistsTable));

  const renderItem = useCallback(
    ({ item }: { item: typeof playlistsTable.$inferSelect }) => {
      return (
        <Link
          href={
            item.author === 'jiosaavn'
              ? {
                  pathname: '/playlist/jiosaavn/[id]',
                  params: { id: item.id || '' },
                }
              : { pathname: '/playlist/[id]', params: { id: item.id || '' } }
          }
          asChild
        >
          <PlaylistItemDisplayInline
            title={item.name || ''}
            image={item.image || ''}
          />
        </Link>
      );
    },
    []
  );

  return (
    <FlatList
      data={playlists}
      numColumns={2}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
      columnWrapperStyle={{
        gap: 10,
        paddingHorizontal: 16,
      }}
      style={{ gap: 10 }}
      renderItem={renderItem}
    />
  );
};

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

const RNTPSamplePlaylistDisplay = () => {
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

type SectionItem = string | JiosaavnApiPlaylistMini | SpotifyPlaylist;

type Section = {
  title: string;
  source: string;
  data: readonly SectionItem[];
};

const PlaylistListDisplay = ({
  jiosaavnTopPlaylistsPromise,
  spotifyUserPlaylistsPromise,
  refresh,
}: {
  jiosaavnTopPlaylistsPromise: Promise<JiosaavnApiPlaylistMini[]>;
  spotifyUserPlaylistsPromise: Promise<SpotifyPlaylist[]>;
  refresh: () => void;
}) => {
  const { user } = useSession();
  const jiosaavnTopPlaylists = use(jiosaavnTopPlaylistsPromise);
  const spotifyUserPlaylists = use(spotifyUserPlaylistsPromise);

  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  return (
    <SectionList
      style={{ flex: 1, paddingTop: insets.top }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      sections={
        [
          {
            title: 'My Playlists',
            source: 'local',
            data: ['my-playlists'],
          },
          {
            title: 'Ambient Sounds',
            source: 'asset-local',
            data: ['ambient-sounds', 'sample-playlist', 'ambient-sounds'],
          },
          {
            title: 'Jiosaavn Top Playlists',
            source: 'jiosaavn',
            data: jiosaavnTopPlaylists,
          },
          {
            title: 'Spotify User Playlists',
            source: 'spotify',
            data: spotifyUserPlaylists,
          },
        ] as readonly Section[]
      }
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
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Image
              source={{ uri: user?.images[0].url || '' }}
              style={{ width: 35, height: 35, borderRadius: 25 }}
            />
            <View>
              <Text
                numberOfLines={1}
                style={[typography.h4, { color: colors.text }]}
              >
                Hola! {user?.display_name}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Pressable onPress={() => router.push('/playlist/create')}>
              <Icon name="add" size={24} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('/settings')}>
              <Icon name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      }
      renderSectionHeader={({ section: { title, data, source } }) => (
        <View>
          {source === 'local' ? (
            <MyPlaylistsPlaylistDisplay />
          ) : (
            <Fragment>
              <View style={{ padding: 16 }}>
                <Text style={[typography.h5, { color: colors.text }]}>
                  {title}
                </Text>
              </View>
              <FlatList
                data={data}
                horizontal
                contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
                renderItem={({ item }) =>
                  source === 'jiosaavn' ? (
                    <JiosaavnPlaylistDisplay
                      playlist={item as JiosaavnApiPlaylistMini}
                    />
                  ) : source === 'spotify' ? (
                    <SpotifyPlaylistDisplay
                      playlist={item as SpotifyPlaylist}
                    />
                  ) : source === 'asset-local' ? (
                    item === 'ambient-sounds' ? (
                      <AmbientSoundsPlaylistDisplay />
                    ) : (
                      <RNTPSamplePlaylistDisplay />
                    )
                  ) : null
                }
              />
            </Fragment>
          )}
        </View>
      )}
      ListFooterComponent={<View style={{ height: 150 }} />}
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
  const refresh = useCallback(() => {
    Promise.all([
      fetchJiosaavnTopPlaylists(),
      fetchSpotifyUserPlaylists(user?.id || '', token || ''),
    ]).then(() => {
      console.log('Refreshed!');
    });
  }, [user?.id, token]);

  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator text="Loading playlists..." />}>
        <PlaylistListDisplay
          jiosaavnTopPlaylistsPromise={jiosaavnTopPlaylists}
          spotifyUserPlaylistsPromise={spotifyUserPlaylists}
          refresh={refresh}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
