import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { BehaviorSubject } from 'rxjs';

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

export class DownloadManager {
  private downloads = new BehaviorSubject<Download[]>([]);
  private saf: SAFManager;
  private storage: DownloadsStateStorage;

  constructor() {
    this.saf = new SAFManager();
    this.storage = new DownloadsStateStorage('downloads');
    this.loadDirectoryUri();
    this.loadDownloads();
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

  async addDownload(urlInput: string) {
    if (!this.saf.hasDirectoryAccess()) {
      let uri = await this.saf.requestDirectoryAccess();
      if (!uri) return;
      await this.storage.setSafUri(uri);
    }

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
}

export const downloadManager = new DownloadManager();
