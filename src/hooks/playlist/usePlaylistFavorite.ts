import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { db } from '@/db';
import { playlistsTable } from '@/db/schema';

export function usePlaylistFavorite(playlistId: string) {
  const {
    data: [playlist],
  } = useLiveQuery(
    db.select().from(playlistsTable).where(eq(playlistsTable.id, playlistId)),
    [playlistId]
  );

  const toggleFavorite = useCallback(
    async (name: string, image?: string | null) => {
      if (!playlistId) return;
      const isFavorite = await db
        .select()
        .from(playlistsTable)
        .where(eq(playlistsTable.id, playlistId));

      if (isFavorite.length > 0) {
        db.delete(playlistsTable)
          .where(eq(playlistsTable.id, playlistId))
          .then(() => {
            console.log('playlist removed from favorites');
          });
      } else {
        db.insert(playlistsTable)
          .values({
            id: playlistId,
            name: name,
            image: image,
            author: 'jiosaavn',
          })
          .then(() => {
            console.log('playlist added to favorites');
          });
      }
    },
    [playlistId]
  );

  return {
    isFavorite: !!playlist,
    toggleFavorite,
  };
}
