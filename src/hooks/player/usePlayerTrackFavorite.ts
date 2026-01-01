import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { db, LIKED_SONGS_PLAYLIST_ID } from '@/db';
import { playlistsSongsTable } from '@/db/schema';

export const usePlayerTrackFavorite = (trackId?: string | null) => {
  const { data: playlistSong } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
          eq(playlistsSongsTable.songId, trackId || '')
        )
      ),
    [trackId]
  );

  const toggleFavorite = useCallback(async () => {
    if (!trackId) return;
    const isFav = await db
      .select()
      .from(playlistsSongsTable)
      .where(
        and(
          eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
          eq(playlistsSongsTable.songId, trackId)
        )
      );
    if (isFav.length > 0) {
      db.delete(playlistsSongsTable)
        .where(
          and(
            eq(playlistsSongsTable.playlistId, LIKED_SONGS_PLAYLIST_ID),
            eq(playlistsSongsTable.songId, trackId)
          )
        )
        .then(() => {
          console.log('playlist item removed from favorites');
        });
    } else {
      db.insert(playlistsSongsTable)
        .values({
          playlistId: LIKED_SONGS_PLAYLIST_ID,
          songId: trackId,
        })
        .then(() => {
          console.log('playlist item added to favorites');
        });
    }
  }, [trackId]);

  return {
    isFavorite: playlistSong && playlistSong.length > 0,
    toggleFavorite,
  };
};
