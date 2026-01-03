import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetModal,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiSong } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { AddToPlaylistSheet } from '@/components/playlist/AddToPlaylistSheet';
import { JiosaavnTrackHeaderHandle } from '@/components/song/JiosaavnTrackHeaderHandle';
import { JiosaavnTrackInfoSheet } from '@/components/song/JiosaavnTrackInfoSheet';
import { ListItem } from '@/components/ui/ListItem';
import VirtualizedPaginatedList, {
  FetchDataParams,
  PaginatedResponse,
} from '@/components/ui/VirtualizedPaginatedList';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';
import { useThemeColors } from '@/theme/hooks/useTheme';
import { downloadManager } from '@/utils/download-manager';

export default function SongSearchScreen() {
  const activeTrack = useActiveTrack();
  const { dismissAll } = useBottomSheetModal();
  const trackInfoSheetRef = useRef<BottomSheetModal>(null);
  const addToPlaylistSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<JiosaavnApiSong | null>(
    null
  );
  const [isTrackInfoSheetOpen, setIsTrackInfoSheetOpen] = useState(false);
  const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] =
    useState(false);

  const fetchSongs = async (
    params: FetchDataParams
  ): Promise<PaginatedResponse<JiosaavnApiSong>> => {
    const { page, limit, searchQuery } = params;

    const songsResponse = await jiosaavnApi.searchSongs(searchQuery || '', {
      page,
      perPage: limit,
    });

    return {
      data: songsResponse.results ?? [],
      hasMore: (songsResponse.total ?? 0) > page * limit,
      total: songsResponse.total ?? 0,
    };
  };

  useBottomSheetBack(isTrackInfoSheetOpen, trackInfoSheetRef, () =>
    setIsTrackInfoSheetOpen(false)
  );

  useBottomSheetBack(isAddToPlaylistSheetOpen, addToPlaylistSheetRef, () =>
    setIsAddToPlaylistSheetOpen(false)
  );

  const snapPoints = useMemo(() => ['55%', '100%'], []);

  // actions
  const onItemPress = useCallback(async (item: JiosaavnApiSong) => {
    if (item) {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url:
          createDownloadLinks(item.more_info.encrypted_media_url || '')[0]
            ?.url || '',
        title: item.title,
        artist: item.more_info.artistMap?.primary_artists[0]?.name || '',
        artwork: createImageLinks(item.image || '')[0]?.url || '',
        duration: Number(item.more_info.duration || 0),
        id: item.id,
        canFavorite: true,
      });
      await TrackPlayer.play();
    }
  }, []);

  const onItemLongPress = useCallback((item: JiosaavnApiSong) => {
    Keyboard.dismiss();
    setSelectedTrackId(item.id);
    setSelectedSong(item);
    trackInfoSheetRef.current?.present();
    setIsTrackInfoSheetOpen(true);
  }, []);

  const handleDownloadPress = useCallback(() => {
    if (!selectedTrackId) return;

    downloadManager.downloadSong(selectedTrackId);
    trackInfoSheetRef.current?.dismiss();
  }, [selectedTrackId]);

  const handleAddToPlaylistPress = useCallback(() => {
    dismissAll();
    setTimeout(() => {
      addToPlaylistSheetRef.current?.present();
      setIsAddToPlaylistSheetOpen(true);
    }, 100);
  }, [dismissAll]);

  const handleCreatePlaylistPress = useCallback(() => {
    dismissAll();
    setTimeout(() => {
      router.push(`/playlist/create`);
    }, 100);
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
      <JiosaavnTrackHeaderHandle {...props} item={selectedSong} />
    ),
    [selectedSong]
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

  const renderSong = useCallback(
    ({ item }: { item: JiosaavnApiSong }) => (
      <ListItem
        title={item.title}
        description={item.subtitle}
        image={item.image}
        onPress={() => onItemPress(item)}
        onLongPress={() => onItemLongPress(item)}
        isPlayable={true}
        isPlaying={activeTrack?.id === item.id}
      />
    ),
    [onItemPress, onItemLongPress, activeTrack]
  );

  const getSongKey = useCallback((item: JiosaavnApiSong) => item.id, []);

  return (
    <Fragment>
      <VirtualizedPaginatedList<JiosaavnApiSong>
        title="song"
        fetchData={fetchSongs}
        renderItem={renderSong}
        keyExtractor={getSongKey}
        itemsPerPage={20}
        inputPlaceholderText="Search songs..."
        searchDebounceMs={500}
        enablePullToRefresh={true}
        flatListProps={{
          showsVerticalScrollIndicator: false,
          contentContainerStyle: { gap: 10 },
          style: { flex: 1, padding: 16 },
          ListFooterComponent: () => <View style={{ height: 150 }} />,
        }}
        enableLoadMore={true}
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
    </Fragment>
  );
}
