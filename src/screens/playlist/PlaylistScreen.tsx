import { useQuery } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';

import { jiosaavnApi } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ListLayout } from '@/components/layouts/list-layout';
import { db } from '@/db';
import { playlistsSongsTable, playlistsTable } from '@/db/schema';

type Playlist = typeof playlistsTable.$inferSelect;

function PlaylistDisplay({
  playlist,
  songIds,
}: {
  playlist: Playlist | null;
  songIds: string[];
}) {
  const songs = useQuery({
    queryKey: ['playlist-songs', songIds],
    queryFn: () => jiosaavnApi.getSongDetailsById(songIds),
  });

  const onItemPress = useCallback(
    async (item: { id: string; title: string; image?: string }) => {
      const song = songs.data?.songs?.find((s) => s.id === item.id);
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
        });
        await TrackPlayer.play();
      }
    },
    [songs.data?.songs]
  );

  const handleDeletePlaylist = useCallback(async () => {
    await db
      .delete(playlistsTable)
      .where(eq(playlistsTable.id, playlist?.id || ''));
    router.dismissTo('/');
  }, [playlist?.id]);

  return (
    <ListLayout
      title={playlist?.name || ''}
      itemCount={songIds.length}
      image={playlist?.image || undefined}
      items={
        songs.data?.songs?.map((song) => ({
          ...song,
          id: song.id,
          title: song.title,
          description: `${song.more_info.album} &bull; ${song.more_info.artistMap?.primary_artists[0]?.name}`,
          duration: Number(song.more_info.duration || 0),
        })) || []
      }
      onItemPress={onItemPress}
      moreIcon="trash-bin"
      onMorePress={() => handleDeletePlaylist()}
    />
  );
}

export default function PlaylistScreen({ playlistId }: { playlistId: string }) {
  const {
    data: [playlist],
  } = useLiveQuery(
    db.select().from(playlistsTable).where(eq(playlistsTable.id, playlistId))
  );
  const { data: songs } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(eq(playlistsSongsTable.playlistId, playlistId))
  );
  return (
    <PlaylistDisplay
      playlist={playlist}
      songIds={songs?.map((song) => song.songId) || []}
    />
  );
}
