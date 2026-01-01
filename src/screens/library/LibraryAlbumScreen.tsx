import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { parseBuffer, selectCover } from 'music-metadata';
import { Suspense, use, useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import VirtualizedPaginatedList, {
  FetchDataParams,
} from '@/components/ui/VirtualizedPaginatedList';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatDuration } from '@/utils/format/duration';

function AlbumEntry({
  albumPromise,
}: {
  albumPromise: Promise<MediaLibrary.Album>;
}) {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const album = use(albumPromise);
  const [after, setAfter] = useState<MediaLibrary.AssetRef | undefined>();

  const playAudio = async (asset: MediaLibrary.Asset) => {
    const file = new File(asset.uri);

    console.log('parsing metadata...', { file: file.name, type: file.type });
    try {
      const bytes = await file.bytes();
      const metadata = await parseBuffer(new Uint8Array(bytes));
      console.log('metadata.common.title', metadata.common.title);
      console.log('metadata.common.album', metadata.common.album);
      console.log('metadata.common.artist', metadata.common.artist);
      console.log('metadata.format.duration', metadata.format.duration);
      const cover = selectCover(metadata.common.picture); // pick the cover image

      const artwork = new File(Paths.cache, 'artwork.jpg');
      artwork.create({ overwrite: true });
      artwork.write(new Uint8Array(cover?.data || []));
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: file.uri,
        title: metadata.common.title || file.name,
        artwork: artwork.uri,
        album: metadata.common.album,
        artist: metadata.common.artist,
        duration: metadata.format.duration,
      });
      await TrackPlayer.play();
    } catch (error) {
      console.error('error', error);
    }
  };

  const fetchData = useCallback(
    async (params: FetchDataParams) => {
      const { page, limit, searchQuery } = params;

      const albumAssets = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: 'audio',
        first: limit,
        after: page === 1 ? undefined : after,
      });

      const regex = new RegExp(searchQuery?.toLowerCase() || '', 'i');
      if (searchQuery) {
        const filteredAssets = albumAssets.assets.filter((a) =>
          regex.test(a.filename.toLowerCase())
        );
        setAfter(undefined);
        return {
          data: filteredAssets,
          hasMore: false,
        };
      }

      setAfter(albumAssets.endCursor);
      return {
        data: albumAssets.assets,
        hasMore: albumAssets.hasNextPage,
        total: albumAssets.totalCount,
      };
    },
    [album, after]
  );

  const renderItem = useCallback(
    ({ item }: { item: MediaLibrary.Asset }) => {
      return (
        <ListItem
          title={item.filename}
          numberOfLinesTitle={1}
          EndElement={
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {formatDuration(Math.floor(item.duration || 0))}
            </Text>
          }
          onPress={() => playAudio(item)}
        />
      );
    },
    [colors, typography]
  );

  const keyExtractor = useCallback((item: MediaLibrary.Asset) => item.id, []);

  return (
    <VirtualizedPaginatedList<MediaLibrary.Asset>
      title="item"
      fetchData={fetchData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemsPerPage={20}
      enablePullToRefresh={false}
      enableLoadMore={true}
      loadingColor={colors.primary}
      flatListProps={{
        style: { flex: 1, padding: 16 },
        contentContainerStyle: { gap: 10 },
        ListFooterComponent: () => <View style={{ height: 150 }} />,
      }}
    />
  );
}

export default function LibraryAlbumScreen({ albumId }: { albumId: string }) {
  if (!albumId) return <ErrorIndicator />;

  const albumPromise = MediaLibrary.getAlbumAsync(albumId);
  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator />}>
        <AlbumEntry albumPromise={albumPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
