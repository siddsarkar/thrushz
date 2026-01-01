import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandle,
  BottomSheetHandleProps,
  BottomSheetModal,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, {
  memo,
  Suspense,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import {
  jiosaavnApi,
  JiosaavnApiPlaylist,
  JiosaavnApiSong,
} from '@/api/jiosaavn';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ListLayout } from '@/components/layouts/list-layout';
import { JiosaavnTrackInfoSheet } from '@/components/player/JiosaavnTrackInfoSheet';
import { AddToPlaylistSheet } from '@/components/playlist/AddToPlaylistSheet';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';
import { useThemeColors } from '@/theme/hooks/useTheme';

const fetchPlaylist = async (id: string): Promise<JiosaavnApiPlaylist> => {
  if (!id) return Promise.reject('No playlistId provided!');

  const playlist = await jiosaavnApi.getPlaylistDetails(id, {
    perPage: 100,
  });
  return playlist;
};

const HeaderHandleComponent = ({
  item,
  ...props
}: BottomSheetHandleProps & { item: JiosaavnApiSong | null }) => {
  const colors = useThemeColors();
  const { card: backgroundColor, text: indicatorColor } = colors;

  return (
    <BottomSheetHandle
      {...props}
      indicatorStyle={{ height: 4, backgroundColor: indicatorColor }}
      style={{
        height: 80,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        zIndex: 99999,
        backgroundColor: backgroundColor,
      }}
    >
      <ListItem
        title={item?.title || ''}
        image={item?.image || ''}
        description={item?.more_info.artistMap?.primary_artists[0]?.name || ''}
      />
    </BottomSheetHandle>
  );
};

const HeaderHandle = memo(HeaderHandleComponent);

const PlaylistDisplay = ({
  playlistPromise,
}: {
  playlistPromise: Promise<JiosaavnApiPlaylist>;
}) => {
  const { dismissAll } = useBottomSheetModal();
  const playlist = use(playlistPromise);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  // Bottom sheet state
  const trackInfoSheetRef = useRef<BottomSheetModal>(null);
  const [isTrackInfoSheetOpen, setIsTrackInfoSheetOpen] = useState(false);

  const addToPlaylistSheetRef = useRef<BottomSheetModal>(null);
  const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] =
    useState(false);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [downloadSongUrl, setDownloadSongUrl] = useState<string | null>(null);

  useBottomSheetBack(isTrackInfoSheetOpen, trackInfoSheetRef, () =>
    setIsTrackInfoSheetOpen(false)
  );

  const snapPoints = useMemo(() => ['55%', '100%'], []);

  // actions
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
          canFavorite: true,
        });
        await TrackPlayer.play();
      }
    },
    [playlist.list]
  );

  const onItemLongPress = useCallback((item: { id: string }) => {
    setSelectedTrackId(item.id);
    trackInfoSheetRef.current?.present();
    setIsTrackInfoSheetOpen(true);
  }, []);

  const handleDownloadPress = useCallback(() => {
    if (!selectedTrackId) return;

    let url =
      createDownloadLinks(
        playlist.list.find((s) => s.id === selectedTrackId)?.more_info
          .encrypted_media_url || ''
      )[0]?.url || null;
    if (!url) return;

    setTimeout(() => {
      trackInfoSheetRef.current?.dismiss();
      router.push({
        pathname: '/downloads',
        params: { url },
      });
    }, 100);
  }, [selectedTrackId, playlist.list]);

  const handleAddToPlaylistPress = useCallback(() => {
    dismissAll();
    addToPlaylistSheetRef.current?.present();
    setIsAddToPlaylistSheetOpen(true);
  }, [dismissAll]);

  const handleCreatePlaylistPress = useCallback(() => {
    dismissAll();
    router.push(`/playlist/create`);
  }, [dismissAll]);

  // sheet callbacks
  const handleDismissTrackInfoSheet = useCallback(() => {
    setIsTrackInfoSheetOpen(false);
  }, []);

  const handleDismissAddToPlaylistSheet = useCallback(() => {
    setIsAddToPlaylistSheetOpen(false);
  }, []);

  // renders
  const renderHeaderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <HeaderHandle
        {...props}
        item={playlist.list.find((s) => s.id === selectedTrackId) || null}
      />
    ),
    [playlist.list, selectedTrackId]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <View style={{ flex: 1 }}>
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
        onItemLongPress={onItemLongPress}
      />
      <BottomSheetModal
        key="track-info-sheet"
        ref={trackInfoSheetRef}
        snapPoints={snapPoints}
        handleComponent={renderHeaderHandle}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismissTrackInfoSheet}
        containerStyle={{ marginTop: insets.top }}
        backgroundComponent={() => (
          <View style={{ backgroundColor: colors.card }} />
        )}
      >
        <JiosaavnTrackInfoSheet
          trackId={selectedTrackId}
          onAddToPlaylistPress={handleAddToPlaylistPress}
          onDownloadPress={handleDownloadPress}
        />
      </BottomSheetModal>
      <BottomSheetModal
        key="add-to-playlist-sheet"
        ref={addToPlaylistSheetRef}
        snapPoints={snapPoints}
        handleComponent={renderHeaderHandle}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismissAddToPlaylistSheet}
        containerStyle={{ marginTop: insets.top }}
        backgroundComponent={() => (
          <View style={{ backgroundColor: colors.card }} />
        )}
      >
        <AddToPlaylistSheet
          trackId={selectedTrackId}
          onCreatePlaylistPress={handleCreatePlaylistPress}
        />
      </BottomSheetModal>
    </View>
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
