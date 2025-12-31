import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import { db, LIKED_SONGS_PLAYLIST_ID } from '@/db';
import { playlistsTable } from '@/db/schema';
import migrations from '@/drizzle/migrations';

export function useDbInit() {
  const { success } = useMigrations(db, migrations);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unmounted = false;

    (async () => {
      if (!success) return;

      const likedSongsPlaylist = {
        id: LIKED_SONGS_PLAYLIST_ID,
        name: 'Liked Songs',
      };

      const query = db
        .insert(playlistsTable)
        .values(likedSongsPlaylist)
        .onConflictDoNothing()
        .prepare();

      await query.execute();

      if (unmounted) return;
      setIsReady(true);
    })();

    return () => {
      unmounted = true;
    };
  }, [success]);

  return isReady;
}
