import Icon from '@expo/vector-icons/Ionicons';
import {
  QueryErrorResetBoundary,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { forwardRef, Fragment, Ref, Suspense, useCallback } from 'react';
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
// import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { ListItem } from '@/components/ui/ListItem';
import { SkeletonLoader } from '@/components/ui/Skeleton';
import { db } from '@/db';
import { playlistsTable } from '@/db/schema';
import {
  useThemeColors,
  useThemeShadows,
  useThemeTypography,
} from '@/theme/hooks/useTheme';

const fetchSpotifyUserPlaylists = async (
  userId?: string
): Promise<SpotifyPlaylist[]> => {
  if (!userId) {
    return Promise.reject('No userId provided!');
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
          source={{ uri: image }}
          placeholder={require('@/assets/images/app-icon.png')}
          fadeDuration={500}
          style={{
            width: '100%',
            aspectRatio: 1,
            backgroundColor: colors.card,
          }}
          placeholderContentFit="contain"
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

const MyPlaylistsPlaylistDisplay = ({
  playlists,
}: {
  playlists: (typeof playlistsTable.$inferSelect)[];
}) => {
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

const PlaylistListDisplay = () => {
  const { user } = useSession();
  const { data: playlists } = useLiveQuery(db.select().from(playlistsTable));

  const queryClient = useQueryClient();
  const {
    data: jiosaavnTopPlaylists,
    isLoading: isFetchingJiosaavnTopPlaylists,
  } = useSuspenseQuery({
    queryKey: ['jiosaavnTopPlaylists'],
    queryFn: fetchJiosaavnTopPlaylists,
  });
  const {
    data: spotifyUserPlaylists,
    isLoading: isFetchingSpotifyUserPlaylists,
  } = useSuspenseQuery({
    queryKey: ['spotifyUserPlaylists'],
    queryFn: () => fetchSpotifyUserPlaylists(user?.id || ''),
  });

  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['jiosaavnTopPlaylists'] });
    queryClient.invalidateQueries({ queryKey: ['spotifyUserPlaylists'] });
  }, [queryClient]);

  const isRefreshing =
    isFetchingJiosaavnTopPlaylists || isFetchingSpotifyUserPlaylists;

  return (
    <SectionList
      style={{ flex: 1, paddingTop: insets.top }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
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
            <MyPlaylistsPlaylistDisplay playlists={playlists} />
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

export const HomeScreenSkeleton = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header Skeleton: User avatar, display name, and settings button */}
      <View
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SkeletonLoader
            height={35}
            width={35}
            style={{ borderRadius: 17.5 }}
          />
          <SkeletonLoader height={20} width={100} />
        </View>
        <SkeletonLoader height={24} width={24} />
      </View>

      {/* Inline Playlist Skeleton: 4 items */}
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SkeletonLoader height={50} style={{ flex: 1 }} />
          <SkeletonLoader height={50} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SkeletonLoader height={50} style={{ flex: 1 }} />
          <SkeletonLoader height={50} style={{ flex: 1 }} />
        </View>
      </View>

      {/* title skeleton */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <SkeletonLoader height={20} width={100} />
      </View>
      {/* My Playlists Skeleton: 2 column grid with 4 items */}
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', gap: 10 }}>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
      </View>

      {/* title skeleton */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <SkeletonLoader height={20} width={100} />
      </View>
      {/* My Playlists Skeleton: 2 column grid with 4 items */}
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', gap: 10 }}>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
        <View style={{ gap: 10 }}>
          <SkeletonLoader height={150} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  return (
    <QueryErrorResetBoundary>
      <ErrorBoundary fallback={<ErrorIndicator />}>
        <Suspense fallback={<HomeScreenSkeleton />}>
          <PlaylistListDisplay />
        </Suspense>
      </ErrorBoundary>
    </QueryErrorResetBoundary>
  );
}
