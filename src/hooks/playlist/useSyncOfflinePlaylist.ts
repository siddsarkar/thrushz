import { eq, inArray } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import { db } from '@/db';
import { playlistsSongsTable, playlistsTable } from '@/db/schema';
import { syncManager } from '@/utils/sync-manager';

function useChangedPlaylistIds(
  playlists: (typeof playlistsTable.$inferSelect)[]
) {
  const playlistIds = playlists.map((p) => p.id);

  const { data: playlistSongs } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(inArray(playlistsSongsTable.playlistId, playlistIds)),
    [playlistIds.join(',')]
  );

  const prevSongsMapRef = useRef<Map<string, Set<string>> | null>(null);
  const [changedPlaylistIds, setChangedPlaylistIds] = useState<string[]>([]);

  useEffect(() => {
    // Build current songs map grouped by playlist
    const currentMap = new Map<string, Set<string>>();
    for (const song of playlistSongs) {
      if (!currentMap.has(song.playlistId)) {
        currentMap.set(song.playlistId, new Set());
      }
      currentMap.get(song.playlistId)!.add(song.songId);
    }

    // Skip comparison on first render (initialize only)
    if (prevSongsMapRef.current === null) {
      prevSongsMapRef.current = currentMap;
      return;
    }

    // Find playlists with added or removed songs
    const changedIds: string[] = [];
    const allPlaylistIds = new Set([
      ...prevSongsMapRef.current.keys(),
      ...currentMap.keys(),
    ]);

    for (const playlistId of allPlaylistIds) {
      const prevSongs = prevSongsMapRef.current.get(playlistId);
      const currSongs = currentMap.get(playlistId);

      const hasChanged =
        // Songs added to a new playlist
        (!prevSongs && currSongs && currSongs.size > 0) ||
        // Playlist songs removed entirely
        (prevSongs && prevSongs.size > 0 && !currSongs) ||
        // Song count changed
        (prevSongs && currSongs && prevSongs.size !== currSongs.size) ||
        // Different songs (same count but different content)
        (prevSongs &&
          currSongs &&
          [...prevSongs].some((songId) => !currSongs.has(songId)));

      if (hasChanged) {
        changedIds.push(playlistId);
      }
    }

    // Update ref for next comparison
    prevSongsMapRef.current = currentMap;

    // Only update state when there are actual changes
    if (changedIds.length > 0) {
      setChangedPlaylistIds(changedIds);
    }
  }, [playlistSongs]);

  return changedPlaylistIds;
}

export function useSyncOfflinePlaylist() {
  const { data: offlinePlaylists } = useLiveQuery(
    db.select().from(playlistsTable).where(eq(playlistsTable.offline, 1)),
    []
  );

  const changedPlaylistIds = useChangedPlaylistIds(offlinePlaylists);

  useEffect(() => {
    if (changedPlaylistIds.length > 0) {
      for (const playlistId of changedPlaylistIds) {
        console.log(`syncing offline playlist "${playlistId}"`);
        syncManager.syncPlaylist(playlistId);
      }
    }
  }, [changedPlaylistIds]);

  useEffect(() => {
    return () => {
      syncManager.release();
    };
  }, []);

  return null;
}
