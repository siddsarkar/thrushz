import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetModal,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { jiosaavnApi } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import {
  ListLayout,
  ListLayoutSkeleton,
} from '@/components/layouts/list-layout';
import { AddToPlaylistSheet } from '@/components/playlist/AddToPlaylistSheet';
import { PlaylistInfoSheet } from '@/components/playlist/PlaylistInfoSheet';
import { PlaylistSheetHeaderHandle } from '@/components/playlist/PlaylistSheetHeaderHandle';
import { JiosaavnTrackHeaderHandle } from '@/components/song/JiosaavnTrackHeaderHandle';
import { JiosaavnTrackInfoSheet } from '@/components/song/JiosaavnTrackInfoSheet';
import { db, LIKED_SONGS_PLAYLIST_ID } from '@/db';
import {
  downloadedSongsTable,
  downloadsTable,
  metadataTable,
  playlistsSongsTable,
  playlistsTable,
  songsMetadataTable,
} from '@/db/schema';
import { usePlayerQueue } from '@/hooks/player/usePlayerQueue';
import { useBottomSheetBack } from '@/hooks/useBottomSheetBack';
import { useThemeColors } from '@/theme/hooks/useTheme';
import { downloadManager } from '@/utils/download-manager';

type Playlist = typeof playlistsTable.$inferSelect;

function PlaylistDisplay({
  playlist,
  songIds,
  downloadedSongIds,
}: {
  playlist: Playlist;
  songIds: string[];
  downloadedSongIds: string[];
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

  const playlistMoreSheetRef = useRef<BottomSheetModal>(null);
  const [isPlaylistMoreSheetOpen, setIsPlaylistMoreSheetOpen] = useState(false);

  const addToPlaylistSheetRef = useRef<BottomSheetModal>(null);
  const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] =
    useState(false);

  const trackInfoSheetRef = useRef<BottomSheetModal>(null);
  const [isTrackInfoSheetOpen, setIsTrackInfoSheetOpen] = useState(false);

  useBottomSheetBack(isPlaylistMoreSheetOpen, playlistMoreSheetRef, () =>
    setIsPlaylistMoreSheetOpen(false)
  );

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
      if (downloadedSongIds.includes(item.id)) {
        try {
          // find the metadata
          const metadata = await db
            .select({
              id: metadataTable.id,
              title: metadataTable.title,
              artist: metadataTable.artist,
              artwork: metadataTable.artwork,
              duration: metadataTable.duration,
              album: metadataTable.album,
              year: metadataTable.year,
            })
            .from(songsMetadataTable)
            .innerJoin(
              metadataTable,
              eq(songsMetadataTable.metadataId, metadataTable.id)
            )
            .where(eq(songsMetadataTable.songId, item.id));

          if (metadata && metadata.length > 0) {
            // find in song downloads
            const downloadSong = await db
              .select()
              .from(downloadedSongsTable)
              .where(eq(downloadedSongsTable.songId, item.id));

            if (downloadSong && downloadSong.length > 0) {
              // find the download
              const download = await db
                .select()
                .from(downloadsTable)
                .where(eq(downloadsTable.id, downloadSong[0].downloadId));

              if (download && download.length > 0) {
                console.log('download', download);
                await TrackPlayer.reset();
                TrackPlayer.add({
                  url: download[0].uri,
                  title: metadata[0].title,
                  artist: metadata[0].artist,
                  artwork: metadata[0].artwork,
                  id: item.id,
                  canFavorite: true,
                });
                TrackPlayer.play();
              }
            }
          }
        } catch (error) {
          console.error('error', error);
        }
        return;
      }

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
    [songs, downloadedSongIds]
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

    // let url =
    //   createDownloadLinks(
    //     songs?.find((s) => s.id === selectedTrackId)?.more_info
    //       .encrypted_media_url || ''
    //   )[0]?.url || null;
    // if (!url) return;
    downloadManager.downloadSong(selectedTrackId);

    trackInfoSheetRef.current?.dismiss();
    // setTimeout(() => {
    //   router.push({
    //     pathname: '/downloads',
    //     params: { url },
    //   });
    // }, 100);
  }, [selectedTrackId]);

  const handlePlaylistMorePress = useCallback(() => {
    setIsPlaylistMoreSheetOpen(true);
    playlistMoreSheetRef.current?.present();
  }, []);

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
    setTimeout(() => {
      addToPlaylistSheetRef.current?.present();
      setIsAddToPlaylistSheetOpen(true);
    }, 100);
  }, [dismissAll]);

  const handleDismissPlaylistMoreSheet = useCallback(() => {
    setIsPlaylistMoreSheetOpen(false);
  }, []);

  // renders
  const renderHeaderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <JiosaavnTrackHeaderHandle
        {...props}
        item={songs?.find((s) => s.id === selectedTrackId) || null}
      />
    ),
    [songs, selectedTrackId]
  );

  const renderPlaylistHeaderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <PlaylistSheetHeaderHandle {...props} playlist={playlist} />
    ),
    [playlist]
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
            isDownloaded: downloadedSongIds.includes(song.id),
            ...song,
          })) || []
        }
        onItemPress={onItemPress}
        // moreIcon="trash-outline"
        onMorePress={
          playlist.id === LIKED_SONGS_PLAYLIST_ID
            ? undefined
            : () => handlePlaylistMorePress()
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
      <BottomSheetModal
        key="playlist-more-sheet"
        ref={playlistMoreSheetRef}
        snapPoints={snapPoints}
        handleComponent={renderPlaylistHeaderHandle}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismissPlaylistMoreSheet}
        containerStyle={{ marginTop: insets.top }}
        backgroundComponent={() => (
          <View style={{ backgroundColor: colors.card }} />
        )}
      >
        <PlaylistInfoSheet
          playlist={playlist}
          onDeletePlaylistPress={handleDeletePlaylist}
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

  const { data: downloadedSongs } = useLiveQuery(
    db.select().from(downloadedSongsTable),
    []
  );

  if (!playlist) {
    return <Text>Playlist not found</Text>;
  }

  return (
    <PlaylistDisplay
      playlist={playlist}
      songIds={songs?.map((song) => song.songId) || []}
      downloadedSongIds={downloadedSongs?.map((song) => song.songId) || []}
    />
  );
}
