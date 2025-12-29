import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { IPicture, parseBuffer, selectCover } from 'music-metadata';
import { Suspense, use, useState } from 'react';
import { Text } from 'react-native';
import TrackPlayer from 'react-native-track-player';

// @ts-expect-error – sure we can import this
import localArtwork from '@/assets/resources/artwork.jpg';
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

  const getArtwork = async (cover: IPicture | null) => {
    if (cover) {
      const artwork = new File(Paths.cache, 'artwork.jpg');
      artwork.create({ overwrite: true });
      artwork.write(new Uint8Array(cover?.data || []));
      return artwork.uri;
    }
    return localArtwork;
  };

  const playAudio = async (asset: MediaLibrary.Asset) => {
    const file = new File(asset.uri);

    console.log('parsing metadata...', { file: file.name, type: file.type });
    try {
      const bytes = await file.bytes();
      const { common, format } = await parseBuffer(new Uint8Array(bytes), {
        mimeType: 'audio/mp4',
      });

      const { duration } = format;
      const { title, album, artist, picture } = common;

      console.log(
        'metadata',
        JSON.stringify({ title, album, artist, duration })
      );

      const cover = selectCover(picture); // pick the cover image
      const artwork = await getArtwork(cover);
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: file.uri,
        title: title || file.name,
        artwork: artwork,
        album: album || 'Unknown Album',
        artist: artist || 'Unknown Artist',
        duration,
      });
      await TrackPlayer.play();
    } catch (error) {
      console.error('error', error);
    }
  };

  const fetchData = async (params: FetchDataParams) => {
    console.log('fetchData', `p=${params.page} l=${params.limit}`);
    const albumAssets = await MediaLibrary.getAssetsAsync({
      album,
      mediaType: 'audio',
      first: params.limit,
      after: after,
    });
    setAfter(albumAssets.endCursor);
    return { data: albumAssets.assets, hasMore: albumAssets.hasNextPage };
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
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
  };
  const keyExtractor = (item: MediaLibrary.Asset) => item.id;

  return (
    <VirtualizedPaginatedList
      type="album"
      fetchData={fetchData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemsPerPage={20}
      enablePullToRefresh={false}
      initialSearchQuery=""
      enableLoadMore={true}
      loadingColor={colors.primary}
      flatListProps={{
        style: { flex: 1, padding: 16 },
        contentContainerStyle: { gap: 10 },
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
