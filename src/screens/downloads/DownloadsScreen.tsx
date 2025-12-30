import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListItem } from '@/components/ui/ListItem';
import { useSAF } from '@/hooks/useSAF';
import { useStorageState } from '@/hooks/useStorageState';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

interface Download {
  id: string;
  url: string;
  fileUri: string;
  progress: FileSystem.DownloadProgressData;
  isPaused: boolean;
  resumable: FileSystem.DownloadResumable | null;
  isComplete?: boolean;
}

export default function DownloadsScreen({ url }: { url?: string }) {
  const saf = useSAF();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const [urlInput, setUrlInput] = useState(url || '');
  const [downloads, setDownloads] = useState<Download[]>([]);

  const [
    [isLoadingResumableDownloads, resumableDownloads],
    setResumableDownloads,
  ] = useStorageState('downloads');

  useEffect(() => {
    let isMounted = false;

    if (isMounted) return;
    if (isLoadingResumableDownloads === false) {
      isMounted = true;

      if (!resumableDownloads) {
        return;
      }

      console.log('Resumable downloads loaded:', resumableDownloads);

      let resumables: Download[] = [];
      for (const [id, data] of Object.entries(
        JSON.parse(resumableDownloads || '{}')
      )) {
        const pausedState = data as FileSystem.DownloadPauseState & {
          progress?: FileSystem.DownloadProgressData;
        };
        resumables = [
          ...resumables,
          {
            id,
            url: pausedState.url,
            fileUri: pausedState.fileUri,
            progress: pausedState.progress || {
              totalBytesExpectedToWrite: 0,
              totalBytesWritten: 1,
            },
            resumable: pausedState.options,
            isPaused: true,
            isComplete: false,
          },
        ] as Download[];
      }

      setDownloads(resumables);
    }

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line
  }, [isLoadingResumableDownloads]);

  const addDownload = async () => {
    let isUrlValid = false;
    let url = urlInput.trim();

    try {
      new URL(url);
      isUrlValid = true;
    } catch (err) {
      isUrlValid = false;
      console.error('Invalid URL:', url, err);
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
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, progress: downloadProgress } : d
        )
      );
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      newDownload.fileUri,
      {},
      callback
    );

    setDownloads((prev) => [
      ...prev,
      { ...newDownload, resumable: downloadResumable },
    ]);

    try {
      let res = await downloadResumable.downloadAsync();

      if (res) {
        setDownloads((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isComplete: true } : d))
        );
        let prevDownloads = JSON.parse(resumableDownloads || '{}');
        setResumableDownloads(
          JSON.stringify(
            Object.fromEntries(
              Object.entries(prevDownloads).filter(([key]) => key !== id)
            )
          )
        );

        saf.moveFileToSAF(newDownload.fileUri, newDownload.fileUri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pauseDownload = async (id: string) => {
    const download = downloads.find((d) => d.id === id);
    if (download && download.resumable) {
      try {
        await download.resumable.pauseAsync();
        const savable = download.resumable.savable();
        console.log('Paused data:', savable);

        let prevDownloads = JSON.parse(resumableDownloads || '{}');
        setResumableDownloads(
          JSON.stringify({
            ...prevDownloads,
            [id]: {
              ...savable,
              progress: download.progress,
            } as FileSystem.DownloadPauseState & {
              progress: FileSystem.DownloadProgressData;
            },
          })
        );

        setDownloads((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isPaused: true } : d))
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const resumeDownload = async (id: string) => {
    const pausedData = JSON.parse(resumableDownloads || '{}')[id];

    console.log('Paused data:', pausedData);

    if (!pausedData) {
      Alert.alert('Error', 'No paused data found for this download.');
      return;
    }

    const download = downloads.find((d) => d.id === id);
    const snapshot = pausedData;

    if (download) {
      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        setDownloads((prev) =>
          prev.map((d) =>
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

      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, resumable: downloadResumable, isPaused: false }
            : d
        )
      );

      try {
        let res = await downloadResumable.resumeAsync();

        if (res) {
          setDownloads((prev) =>
            prev.map((d) => (d.id === id ? { ...d, isComplete: true } : d))
          );
          let prevDownloads = JSON.parse(resumableDownloads || '{}');
          setResumableDownloads(
            JSON.stringify(
              Object.fromEntries(
                Object.entries(prevDownloads).filter(([key]) => key !== id)
              )
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const cancelDownload = async (id: string) => {
    const download = downloads.find((d) => d.id === id);
    if (download) {
      try {
        setResumableDownloads(
          JSON.stringify(
            Object.fromEntries(
              Object.entries(JSON.parse(resumableDownloads || '{}')).filter(
                ([key]) => key !== id
              )
            )
          )
        );
        await FileSystem.deleteAsync(download.fileUri, { idempotent: true });
        setDownloads((prev) => prev.filter((d) => d.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const renderItem = ({ item, index }: { item: Download; index: number }) => (
    <ListItem
      title={item.url}
      description={`Progress: ${(
        (item.progress?.totalBytesWritten /
          item.progress?.totalBytesExpectedToWrite) *
        100
      ).toFixed(2)}%`}
      EndElement={
        item?.isComplete !== true ? (
          <View style={styles.buttonRow}>
            {!item.isPaused ? (
              <Pressable onPress={() => pauseDownload(item.id)}>
                <MaterialIcons name="pause" size={24} color="black" />
              </Pressable>
            ) : (
              <Pressable onPress={() => resumeDownload(item.id)}>
                <MaterialIcons name="play-circle" size={24} color="black" />
              </Pressable>
            )}
            <Pressable onPress={() => cancelDownload(item.id)}>
              <MaterialIcons name="delete" size={24} color="black" />
            </Pressable>
          </View>
        ) : null
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: 20, paddingTop: insets.top + 20 }}>
        <Text style={[typography.h6, { color: colors.text }]}>
          Download Manager
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter URL"
          value={urlInput}
          onChangeText={setUrlInput}
        />
        <Button title="Add Download" onPress={addDownload} />
      </View>
      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // style={styles.list}
        style={{ borderRadius: 28 }}
        contentContainerStyle={{ borderRadius: 28, overflow: 'hidden' }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[typography.caption, { color: colors.text }]}>
              No ongoing downloads
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  list: {
    marginTop: 20,
  },
  downloadItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  downloadText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    // justifyContent: 'space-between',
    marginTop: 0,
  },
});
