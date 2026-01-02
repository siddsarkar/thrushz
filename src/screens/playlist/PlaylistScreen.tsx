import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandle,
  BottomSheetHandleProps,
  BottomSheetModal,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiSong } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import {
  ListLayout,
  ListLayoutSkeleton,
} from '@/components/layouts/list-layout';
import { JiosaavnTrackInfoSheet } from '@/components/player/JiosaavnTrackInfoSheet';
import { AddToPlaylistSheet } from '@/components/playlist/AddToPlaylistSheet';
import { ListItem } from '@/components/ui/ListItem';
import { db, LIKED_SONGS_PLAYLIST_ID } from '@/db';
import { playlistsSongsTable, playlistsTable } from '@/db/schema';
import { usePlayerQueue } from '@/hooks/player/usePlayerQueue';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';
import { useThemeColors } from '@/theme/hooks/useTheme';

type Playlist = typeof playlistsTable.$inferSelect;

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

function PlaylistDisplay({
  playlist,
  songIds,
}: {
  playlist: Playlist;
  songIds: string[];
}) {
  const { addToQueue } = usePlayerQueue();
  const { dismissAll } = useBottomSheetModal();

  const activeSong = useActiveTrack();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const { data: { songs = [] } = {}, isFetching: isFetchingSongs } = useQuery({
    queryKey: ['playlist-songs', songIds],
    queryFn: () => jiosaavnApi.getSongDetailsById(songIds),
    enabled: songIds.length > 0,
  });

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const addToPlaylistSheetRef = useRef<BottomSheetModal>(null);
  const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] =
    useState(false);

  const trackInfoSheetRef = useRef<BottomSheetModal>(null);
  const [isTrackInfoSheetOpen, setIsTrackInfoSheetOpen] = useState(false);

  useBottomSheetBack(isAddToPlaylistSheetOpen, addToPlaylistSheetRef, () =>
    setIsAddToPlaylistSheetOpen(false)
  );
  useBottomSheetBack(isTrackInfoSheetOpen, trackInfoSheetRef, () =>
    setIsTrackInfoSheetOpen(false)
  );

  const snapPoints = useMemo(() => ['55%', '100%'], []);

  const handleDeletePlaylist = useCallback(async () => {
    await db
      .delete(playlistsTable)
      .where(eq(playlistsTable.id, playlist?.id || ''));
    router.dismissTo('/');
  }, [playlist?.id]);

  const onItemPress = useCallback(
    async (item: { id: string; title: string; image?: string }) => {
      const songIndex = songs?.findIndex((s) => s.id === item.id);

      await TrackPlayer.reset();
      TrackPlayer.add(
        songs?.map((song) => ({
          url:
            createDownloadLinks(song.more_info.encrypted_media_url || '')[0]
              ?.url || '',
          title: song.title,
          artist: song.more_info.artistMap?.primary_artists[0]?.name || '',
          artwork: createImageLinks(song.image || '')[0]?.url || '',
          duration: Number(song.more_info.duration || 0),
          id: song.id,
          canFavorite: true,
        })) || []
      );

      if (songIndex !== undefined) {
        TrackPlayer.skip(songIndex);
      }
      TrackPlayer.play();
    },
    [songs]
  );

  const onItemLongPress = useCallback((item: { id: string }) => {
    setSelectedTrackId(item.id);
    trackInfoSheetRef.current?.present();
    setIsTrackInfoSheetOpen(true);
  }, []);

  const handleDismissAddToPlaylistSheet = useCallback(() => {
    setIsAddToPlaylistSheetOpen(false);
  }, []);

  const handleDismissTrackInfoSheet = useCallback(() => {
    setIsTrackInfoSheetOpen(false);
  }, []);

  const handleDownloadPress = useCallback(() => {
    if (!selectedTrackId) return;

    let url =
      createDownloadLinks(
        songs?.find((s) => s.id === selectedTrackId)?.more_info
          .encrypted_media_url || ''
      )[0]?.url || null;
    if (!url) return;

    trackInfoSheetRef.current?.dismiss();
    setTimeout(() => {
      router.push({
        pathname: '/downloads',
        params: { url },
      });
    }, 100);
  }, [selectedTrackId, songs]);

  const handleCreatePlaylistPress = useCallback(() => {
    dismissAll();
    setTimeout(() => {
      router.push(`/playlist/create`);
    }, 100);
  }, [dismissAll]);

  const handleAddMoreSongsToPlaylistPress = useCallback(() => {
    router.push({
      pathname: '/playlist/[id]/add',
      params: { id: playlist.id },
    });
  }, [playlist.id]);

  const handleRemoveFromPlaylistPress = useCallback(() => {
    dismissAll();

    if (!selectedTrackId) return;

    db.delete(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, playlist.id),
          eq(playlistsSongsTable.songId, selectedTrackId)
        )
      )
      .then(() => {
        console.log('playlist item removed');
      });
  }, [playlist.id, selectedTrackId, dismissAll]);

  const handleFavoritePress = useCallback(async () => {
    dismissAll();
    if (!selectedTrackId) return;
    const isFav = await db
      .select()
      .from(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
          eq(playlistsSongsTable.songId, selectedTrackId)
        )
      );
    if (isFav.length > 0) {
      db.delete(playlistsSongsTable)
        .where(
          and(
            eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
            eq(playlistsSongsTable.songId, selectedTrackId)
          )
        )
        .then(() => {
          console.log('playlist item removed from favorites');
        });
    } else {
      db.insert(playlistsSongsTable)
        .values({
          playlistId: LIKED_SONGS_PLAYLIST_ID,
          songId: selectedTrackId,
        })
        .then(() => {
          console.log('playlist item added to favorites');
        });
    }
  }, [dismissAll, selectedTrackId]);

  const handleAddToQueuePress = useCallback(() => {
    dismissAll();
    const song = songs?.find((s) => s.id === selectedTrackId);
    if (!song) return;
    addToQueue({
      url:
        createDownloadLinks(song.more_info.encrypted_media_url || '')[0]?.url ||
        '',
      title: song.title,
      artist: song.more_info.artistMap?.primary_artists[0]?.name || '',
      artwork: createImageLinks(song.image || '')[0]?.url || '',
      duration: Number(song.more_info.duration || 0),
      id: song.id,
    });
  }, [dismissAll, selectedTrackId, addToQueue, songs]);

  const handleAddToPlaylistPress = useCallback(async () => {
    dismissAll();
    addToPlaylistSheetRef.current?.present();
    setIsAddToPlaylistSheetOpen(true);
  }, [dismissAll]);

  // renders
  const renderHeaderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <HeaderHandle
        {...props}
        item={songs?.find((s) => s.id === selectedTrackId) || null}
      />
    ),
    [songs, selectedTrackId]
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

  if (isFetchingSongs) {
    return <ListLayoutSkeleton />;
  }

  return (
    <Fragment>
      <ListLayout
        title={playlist.name}
        itemCount={songIds.length}
        image={playlist.image || undefined}
        items={
          songs?.map((song) => ({
            isPlaying: activeSong?.id === song.id,
            description: `${song.more_info.album} &bull; ${song.more_info.artistMap?.primary_artists[0]?.name}`,
            duration: Number(song.more_info.duration || 0),
            ...song,
          })) || []
        }
        onItemPress={onItemPress}
        moreIcon="trash-outline"
        onMorePress={
          playlist.id === LIKED_SONGS_PLAYLIST_ID
            ? undefined
            : () => handleDeletePlaylist()
        }
        onItemLongPress={onItemLongPress}
        footer={
          <View
            style={{
              paddingVertical: 20,
              height: 200,
              marginBottom: 100,
              // justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={handleAddMoreSongsToPlaylistPress}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                // height: '100%',
                backgroundColor: colors.primary,
                borderRadius: 50,
                padding: 10,
                flexDirection: 'row',
                gap: 5,
                paddingRight: 15,
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={colors.text}
              />
              <Text style={{ color: colors.text }}>Add more songs</Text>
            </Pressable>
          </View>
        }
      />
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
          playlistId={playlist?.id || null}
          onCreatePlaylistPress={handleCreatePlaylistPress}
          onRemoveFromPlaylistPress={handleRemoveFromPlaylistPress}
        />
      </BottomSheetModal>
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
          onRemoveFromPlaylistPress={handleRemoveFromPlaylistPress}
          onFavoritePress={handleFavoritePress}
          onAddToQueuePress={handleAddToQueuePress}
          onDownloadPress={handleDownloadPress}
        />
      </BottomSheetModal>
    </Fragment>
  );
}

export default function PlaylistScreen({ playlistId }: { playlistId: string }) {
  const {
    data: [playlist],
  } = useLiveQuery(
    db.select().from(playlistsTable).where(eq(playlistsTable.id, playlistId)),
    [playlistId]
  );

  const { data: songs } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(eq(playlistsSongsTable.playlistId, playlistId)),
    [playlistId]
  );

  if (!playlist) {
    return <Text>Playlist not found</Text>;
  }

  return (
    <PlaylistDisplay
      playlist={playlist}
      songIds={songs?.map((song) => song.songId) || []}
    />
  );
}
