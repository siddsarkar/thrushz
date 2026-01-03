import { eq } from 'drizzle-orm';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { Alert, ToastAndroid } from 'react-native';
import { BehaviorSubject } from 'rxjs';

import { jiosaavnApi } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { db } from '@/db';
import {
  downloadedSongsTable,
  downloadsTable,
  metadataTable,
  songsMetadataTable,
} from '@/db/schema';
import { SAFManager } from '@/utils/saf-manager';

export interface Download {
  id: string;
  url: string;
  fileUri: string;
  progress: FileSystem.DownloadProgressData;
  isPaused: boolean;
  resumable: FileSystem.DownloadResumable | null;
  isComplete?: boolean;
}

export type StoredDownloadState = FileSystem.DownloadPauseState & {
  progress?: FileSystem.DownloadProgressData;
};

export interface StoredDownloadsState {
  [key: string]: StoredDownloadState;
}

export class DownloadsStateStorage {
  private readonly storageKey;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  async setSafUri(uri: string) {
    await SecureStore.setItemAsync('directoryUri', uri);
  }

  async getSafUri(): Promise<string | null> {
    return await SecureStore.getItemAsync('directoryUri');
  }

  async getDownloadsState(): Promise<StoredDownloadsState | null> {
    const downloadsState = await SecureStore.getItemAsync(this.storageKey);
    const parsedDownloads = JSON.parse(
      downloadsState || '{}'
    ) as StoredDownloadsState;
    return parsedDownloads;
  }

  async getDownloadState(id: string): Promise<StoredDownloadState | null> {
    const downloadsState = await SecureStore.getItemAsync(this.storageKey);
    const prevDownloads = JSON.parse(
      downloadsState || '{}'
    ) as StoredDownloadsState;
    return prevDownloads[id] || null;
  }

  async removeDownloadState(id: string) {
    const downloadsState = await SecureStore.getItemAsync(this.storageKey);
    const prevDownloads = JSON.parse(
      downloadsState || '{}'
    ) as StoredDownloadsState;

    const newDownloadsState = Object.fromEntries(
      Object.entries(prevDownloads).filter(([key]) => key !== id)
    );
    await SecureStore.setItemAsync(
      this.storageKey,
      JSON.stringify(newDownloadsState)
    );
    return newDownloadsState;
  }

  async updateDownloadState(id: string, state: StoredDownloadState) {
    const downloadsState = await SecureStore.getItemAsync(this.storageKey);
    const prevDownloads = JSON.parse(
      downloadsState || '{}'
    ) as StoredDownloadsState;
    const newDownloadsState = { ...prevDownloads, [id]: state };
    console.log('newDownloadsState', newDownloadsState);
    await SecureStore.setItemAsync(
      this.storageKey,
      JSON.stringify(newDownloadsState)
    );
    return newDownloadsState;
  }
}

class DownloadManager {
  private static instance: DownloadManager;

  private downloads = new BehaviorSubject<Download[]>([]);
  private saf: SAFManager = new SAFManager();
  private storage: DownloadsStateStorage = new DownloadsStateStorage(
    'downloads'
  );

  private constructor() {
    this.loadDirectoryUri();
    this.loadDownloads();
  }

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  getDownloads() {
    return this.downloads.asObservable();
  }

  private async loadDirectoryUri() {
    const directoryUri = await this.storage.getSafUri();
    if (!directoryUri) return;
    this.saf.setDirectoryUri(directoryUri);
  }

  private async loadDownloads() {
    const storedDownloads = await this.storage.getDownloadsState();
    console.log('storedDownloads', storedDownloads);
    if (!storedDownloads) return;

    let resumables: Download[] = [];
    for (const [id, data] of Object.entries(storedDownloads)) {
      const { url, fileUri, options, progress } = data;

      resumables = [
        ...resumables,
        {
          id,
          url,
          fileUri,
          progress: progress || {
            totalBytesExpectedToWrite: 0,
            totalBytesWritten: 1,
          },
          resumable: options,
          isPaused: true,
          isComplete: false,
        },
      ] as Download[];
    }

    this.downloads.next(resumables);
  }

  async addDownload(urlInput: string, songId?: string) {
    let isUrlValid = false;
    let url = urlInput.trim();

    try {
      new URL(url);
      isUrlValid = true;
    } catch {
      isUrlValid = false;
    }

    if (!isUrlValid) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const id = Date.now().toString(); // Unique ID for each download
    const newDownload: Download = {
      id,
      url,
      fileUri:
        FileSystem.cacheDirectory +
        id +
        '.' +
        new URL(url).pathname.split('.').pop(),
      progress: { totalBytesExpectedToWrite: 1, totalBytesWritten: 0 },
      isPaused: false,
      resumable: null,
    };

    const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      this.downloads.next(
        this.downloads
          .getValue()
          .map((d) => (d.id === id ? { ...d, progress: downloadProgress } : d))
      );
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      newDownload.fileUri,
      {},
      callback
    );

    this.downloads.next([
      ...this.downloads.getValue(),
      { ...newDownload, resumable: downloadResumable },
    ]);

    try {
      let res = await downloadResumable.downloadAsync();

      if (res) {
        this.downloads.next(
          this.downloads
            .getValue()
            .map((d) => (d.id === id ? { ...d, isComplete: true } : d))
        );

        await this.storage.removeDownloadState(id);

        // Handle song differently
        if (songId) {
          let offlineSongsDirectory = new Directory(
            Paths.cache,
            'offline-songs'
          );
          if (!offlineSongsDirectory.exists) {
            offlineSongsDirectory.create();
          }

          // move the newly downloaded file to the offline-songs directory
          let songFile = new File(newDownload.fileUri);
          songFile.move(offlineSongsDirectory);

          const downloadDbEntry = await db
            .insert(downloadsTable)
            .values({
              uri: songFile.uri,
              type: songFile.type,
              duration: 0,
              size: newDownload.progress.totalBytesWritten,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
            .returning({ id: downloadsTable.id });

          if (downloadDbEntry) {
            await db.insert(downloadedSongsTable).values({
              songId: songId,
              downloadId: downloadDbEntry[0].id,
            });
          }

          return true;
        }

        // generally donload to saf directory, if songId is not provided
        if (!this.saf.hasDirectoryAccess()) {
          let uri = await this.saf.requestDirectoryAccess();
          if (!uri) return;
          await this.storage.setSafUri(uri);
        }

        let safUri = await this.saf.moveFileToDirectory(
          newDownload.fileUri,
          newDownload.fileUri,
          'application/octet-stream'
        );

        if (safUri) {
          this.downloads.next(
            this.downloads
              .getValue()
              .map((d) => (d.id === id ? { ...d, fileUri: safUri } : d))
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async pauseDownload(id: string) {
    const download = this.downloads.getValue().find((d) => d.id === id);
    if (download && download.resumable) {
      try {
        await download.resumable.pauseAsync();
        const savable = download.resumable.savable();
        console.log('Paused data:', savable);

        await this.storage.updateDownloadState(id, {
          ...savable,
          progress: download.progress,
        });

        this.downloads.next(
          this.downloads
            .getValue()
            .map((d) => (d.id === id ? { ...d, isPaused: true } : d))
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  async resumeDownload(id: string) {
    const pausedData = await this.storage.getDownloadState(id);

    console.log('Paused data:', pausedData);

    if (!pausedData) {
      Alert.alert('Error', 'No paused data found for this download.');
      return;
    }

    const download = this.downloads.getValue().find((d) => d.id === id);
    const snapshot = pausedData;

    if (download) {
      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        this.downloads.next(
          this.downloads
            .getValue()
            .map((d) =>
              d.id === id ? { ...d, progress: downloadProgress } : d
            )
        );
      };

      const downloadResumable = new FileSystem.DownloadResumable(
        snapshot.url,
        snapshot.fileUri,
        snapshot.options,
        callback,
        snapshot.resumeData
      );

      this.downloads.next(
        this.downloads
          .getValue()
          .map((d) =>
            d.id === id
              ? { ...d, resumable: downloadResumable, isPaused: false }
              : d
          )
      );

      try {
        let res = await downloadResumable.resumeAsync();

        if (res) {
          this.downloads.next(
            this.downloads
              .getValue()
              .map((d) => (d.id === id ? { ...d, isComplete: true } : d))
          );
          await this.storage.removeDownloadState(id);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async cancelDownload(id: string) {
    const download = this.downloads.getValue().find((d) => d.id === id);
    if (download) {
      try {
        await this.storage.removeDownloadState(id);
        await FileSystem.deleteAsync(download.fileUri, { idempotent: true });
        this.downloads.next(
          this.downloads.getValue().filter((d) => d.id !== id)
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  async deleteDownload(id: string) {
    const download = this.downloads.getValue().find((d) => d.id === id);
    if (download) {
      await this.storage.removeDownloadState(id);
      await FileSystem.deleteAsync(download.fileUri, { idempotent: true });
      this.downloads.next(this.downloads.getValue().filter((d) => d.id !== id));
    }
  }

  async downloadSong(songId: string) {
    // check if the song is already downloaded
    const downloadedSong = await db
      .select()
      .from(downloadedSongsTable)
      .where(eq(downloadedSongsTable.songId, songId));
    if (downloadedSong && downloadedSong.length > 0) {
      ToastAndroid.show('Song already downloaded', ToastAndroid.SHORT);
      return;
    }
    /**
     * 1. Get song details from JioSaavn API
     * 2. Save song metadata to database
     * 3. Download song file
     * 4. Save song file to cache/offline-songs directory
     * 5. Update download state in database
     */
    const songDetails = await jiosaavnApi.getSongDetailsById(songId);
    if (!songDetails) return;
    const song = songDetails.songs[0];
    if (!song) return;
    const songUrl =
      createDownloadLinks(song.more_info.encrypted_media_url || '')[0]?.url ||
      '';
    if (!songUrl) return;
    const artworkUrl = createImageLinks(song.image || '')[0]?.url || '';
    let artwork = song.image || '';
    if (artworkUrl) {
      // download the artwork
      try {
        const artworkDirectory = new Directory(Paths.cache, 'artwork-images');
        if (!artworkDirectory.exists) {
          artworkDirectory.create();
        }
        let artworkFileUri =
          FileSystem.cacheDirectory + 'artwork-images/' + songId + '.jpg';
        const artworkFile = await FileSystem.downloadAsync(
          artworkUrl,
          artworkFileUri
        );
        if (artworkFile) {
          artwork = artworkFile.uri;
        }
      } catch (error) {
        console.error(error);
      }
    }

    // check if the metadata already exists for the song
    const songMetadata = await db
      .select()
      .from(songsMetadataTable)
      .where(eq(songsMetadataTable.songId, songId));

    if (songMetadata && songMetadata.length > 0) {
      // TODO: update the metadata for the song
    } else {
      const metadata = await db
        .insert(metadataTable)
        .values({
          title: song.title,
          artist: song.more_info.artistMap?.primary_artists[0]?.name || '',
          album: song.more_info.album || '',
          year: song.more_info.release_date || '',
          artwork: artwork,
          duration: Number(song.more_info.duration || 0),
        })
        .returning();

      if (!metadata) return;
      await db.insert(songsMetadataTable).values({
        songId: songId,
        metadataId: metadata[0].id,
      });
    }

    await this.addDownload(songUrl, songId);
    console.log(`song "${song.title}" downloaded successfully`);
  }
}

export const downloadManager = DownloadManager.getInstance();
