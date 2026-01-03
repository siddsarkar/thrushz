import { Mutex } from 'await-semaphore';
import { eq, inArray } from 'drizzle-orm';

import { db } from '@/db';
import {
  downloadedSongsTable,
  playlistsSongsTable,
  playlistsTable,
} from '@/db/schema';

import { downloadManager } from './download-manager';

type Playlist = typeof playlistsTable.$inferSelect;

class SyncManager {
  private static instance: SyncManager;

  private semaphore = new Mutex();

  private constructor() {
    // private constructor
  }

  private playlistSyncQueue: Playlist[] = [];

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public async syncPlaylist(playlistId: string) {
    if (this.playlistSyncQueue.find((p) => p.id === playlist.id)) {
      console.log(`playlist already in queue`);
      return;
    }

    const [playlist] = await db
      .select()
      .from(playlistsTable)
      .where(eq(playlistsTable.id, playlistId));

    if (!playlist) {
      console.log(`playlist "${playlistId}" not found`);
      return;
    }

    console.log(`adding playlist "${playlist.name}" to queue`);
    this.playlistSyncQueue.push(playlist);
    this.semaphore.use(() => this.syncNextPlaylist());
  }

  private async syncNextPlaylist() {
    if (this.playlistSyncQueue.length === 0) {
      return;
    }
    const playlist = this.playlistSyncQueue.shift() as Playlist;
    console.log(`syncing playlist "${playlist?.name}"...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // sync the playlist
    await this.processPlaylist(playlist);
    console.log(`"${playlist?.name}" sync completed!`);
    console.log(`${this.playlistSyncQueue.length} playlists remaining to sync`);
  }

  private async processPlaylist(playlist: Playlist) {
    console.log(`processing playlist "${playlist.name}"...`);
    // process the playlist
    const playlistSongs = await db
      .select()
      .from(playlistsSongsTable)
      .where(eq(playlistsSongsTable.playlistId, playlist.id));

    const playlistDownloadedSongs = await db
      .select()
      .from(downloadedSongsTable)
      .where(
        inArray(
          downloadedSongsTable.songId,
          playlistSongs.map((song) => song.songId)
        )
      );

    const totalSongs = playlistSongs.length;
    const downloadedSongs = playlistDownloadedSongs.length;

    console.log(
      `${downloadedSongs} / ${totalSongs} songs downloaded for playlist "${playlist.name}"`
    );

    const missingSongIds = playlistSongs
      .filter(
        (song) =>
          !playlistDownloadedSongs.some(
            (downloadedSong) => downloadedSong.songId === song.songId
          )
      )
      .map((song) => song.songId);

    if (missingSongIds.length === 0) {
      return;
    }

    console.log('Missing song ids: ', missingSongIds);
    const downloadPromises = missingSongIds.map((songId) =>
      downloadManager.downloadSong(songId)
    );

    await Promise.all(downloadPromises);
    console.log(
      `${downloadedSongs + missingSongIds.length} / ${totalSongs} songs downloaded for playlist "${playlist.name}"`
    );
  }

  public release() {
    console.log('releasing sync manager');
    this.playlistSyncQueue = [];
  }
}

export const syncManager = SyncManager.getInstance();
