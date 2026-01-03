import { MaterialIcons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useIsFocused } from '@react-navigation/native';
import { ID3Writer } from 'browser-id3-writer';
import { Blob } from 'expo-blob';
import { Directory, File, Paths } from 'expo-file-system';
import { parseBuffer, selectCover } from 'music-metadata';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';

import { logInterceptor } from '@/api';
import { RequestLog } from '@/api/interceptor';
import { ListItem } from '@/components/ui/ListItem';
import { useOverlayLoader } from '@/hooks/useOverlayLoader';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { useSAF } from '@/hooks/useSAF';
import { useStorageState } from '@/hooks/useStorageState';
import DownloadsScreenV2 from '@/screens/downloads/DownloadsScreenV2';
import { useTheme, useThemeColors } from '@/theme/hooks/useTheme';
import { formatBytes } from '@/utils/format/bytes';
import { SAFManager } from '@/utils/saf-manager';

const isAudioFile = (file: File) => {
  return ['mp3', 'mp4', 'ogg', 'wav', 'webm'].includes(
    file.name.split('.').pop() || ''
  );
};

function SystemFileExplorer() {
  const [files, setFiles] = useState<(File | Directory)[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Directory[]>([
    new Directory(Paths.cache),
  ]);

  const goBack = useCallback(() => {
    setBreadcrumbs((prev) => prev.slice(0, -1));
  }, []);

  const onBreadcrumbItemPress = useCallback((item: Directory | File) => {
    if (item instanceof Directory) {
      setBreadcrumbs((prev) => {
        const newBreadcrumbs = [...prev];
        const index = newBreadcrumbs.indexOf(item);
        if (index !== -1) {
          return newBreadcrumbs.slice(0, index + 1);
        }
        return newBreadcrumbs;
      });
    }
  }, []);

  const preventBackPress = useMemo(() => {
    return breadcrumbs.length > 1;
  }, [breadcrumbs]);

  usePreventBackPress(preventBackPress, goBack);

  const {
    theme: { colors },
    mode,
  } = useTheme();

  function loadAllFiles() {
    let files: (File | Directory)[] = [];
    function listFiles(directory: Directory) {
      const contents = directory.list();
      for (const item of contents) {
        if (item instanceof Directory) {
          listFiles(item);
        } else {
          const supportedExtensions = ['mp3', 'mp4', 'ogg', 'wav', 'webm'];
          if (supportedExtensions.includes(item.name.split('.').pop() || '')) {
            files.push(item);
          }
        }
      }
    }

    try {
      listFiles(new Directory(Paths.cache));
      setFiles(files);
    } catch (error) {
      console.error(error);
    }
  }

  const loadFiles = useCallback(async () => {
    try {
      const dir = breadcrumbs[breadcrumbs.length - 1];
      const files = dir.list();
      setFiles(files);
    } catch (error) {
      console.error(error);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDeleteFile = async (file: File) => {
    try {
      file.delete();
      loadFiles();
    } catch (error) {
      console.error(error);
    }
  };

  const sortedByType = useMemo(() => {
    return files.sort((a, b) => {
      // 1. Directory first
      if (a instanceof Directory && b instanceof Directory) {
        return a.name.localeCompare(b.name);
      }
      if (a instanceof Directory && b instanceof File) {
        return -1;
      }
      if (a instanceof File && b instanceof Directory) {
        return 1;
      }
      // 3. File second
      if (a instanceof File && b instanceof File) {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [files]);

  return (
    <FlatList
      contentContainerStyle={{
        paddingBottom: 200,
        gap: 10,
        paddingHorizontal: 16,
      }}
      data={sortedByType}
      ListHeaderComponent={() => {
        return (
          <View
            style={{
              gap: 10,
              backgroundColor: colors.background,
              paddingBottom: 6,
              paddingTop: 10,
            }}
          >
            <SegmentedControl
              appearance={mode === 'dark' ? 'light' : 'dark'}
              tintColor={colors.border}
              backgroundColor={colors.card}
              values={['Cache', 'Document']}
              selectedIndex={
                breadcrumbs[0]?.name?.toLowerCase() === 'cache' ? 0 : 1
              }
              onChange={async (event) => {
                setBreadcrumbs(
                  event.nativeEvent.selectedSegmentIndex === 0
                    ? [new Directory(Paths.cache)]
                    : [new Directory(Paths.document)]
                );
              }}
            />
            <ScrollView horizontal style={{ flexDirection: 'row', gap: 10 }}>
              {breadcrumbs.map((breadcrumb, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Pressable
                      onPress={() => onBreadcrumbItemPress(breadcrumb)}
                    >
                      <Text style={{ color: colors.text }} key={index}>
                        {breadcrumb.name}
                      </Text>
                    </Pressable>
                    {index < breadcrumbs.length - 1 && (
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={colors.text}
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );
      }}
      ListEmptyComponent={() => {
        return (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: colors.text }}>No files found</Text>
          </View>
        );
      }}
      stickyHeaderHiddenOnScroll={true}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => {
        return (
          <ListItem
            StartElement={
              item instanceof Directory ? (
                <MaterialIcons name="folder" size={24} color={colors.text} />
              ) : (
                <MaterialIcons
                  name={isAudioFile(item) ? 'music-note' : 'file-copy'}
                  size={24}
                  color={colors.text}
                />
              )
            }
            title={item.name || ''}
            image={null}
            description={
              item instanceof File
                ? formatBytes(item.size || 0)
                : `Folder &bull; ${item.list().length} files`
            }
            onPress={() => {
              if (item instanceof File) {
                console.log('file', item.name);
              }
              if (item instanceof Directory) {
                console.log('directory', item.name);
                setBreadcrumbs((prev) => [...prev, item]);
              }
            }}
            EndElement={
              item instanceof File ? (
                <Pressable onPress={() => handleDeleteFile(item)}>
                  <MaterialIcons name="delete" size={24} color={colors.text} />
                </Pressable>
              ) : null
            }
          />
        );
      }}
    />
  );
}
function SAFFileExplorer() {
  const colors = useThemeColors();
  const overlayLoader = useOverlayLoader();
  const saf = useSAF();

  const [safManager] = useState(new SAFManager());
  const [hasAccess, setHasAccess] = useState(false);
  const [files, setFiles] = useState<(File | Directory)[]>([]);

  const [[isStoredUriLoading, storedUri], setStoredUri] =
    useStorageState('directoryUri');

  useEffect(() => {
    let isMounted = true;

    if (isStoredUriLoading === false) {
      if (!storedUri) {
        return;
      }

      if (isMounted) {
        safManager.setDirectoryUri(storedUri);
        setHasAccess(true);
        loadFiles();
      }
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [isStoredUriLoading, storedUri]);

  const requestAccess = async () => {
    const directoryUri = await safManager.requestDirectoryAccess();
    if (directoryUri) {
      setHasAccess(true);
      setStoredUri(directoryUri);
    }
  };

  const revokeAccess = async () => {
    setStoredUri(null);
    setHasAccess(false);
  };

  const saveTextFile = async () => {
    const timestamp = new Date().toISOString();
    const content = `This is a test file created at ${timestamp}`;
    const fileName = `test_${Date.now()}.txt`;

    const result = await safManager.saveFileToDirectory(fileName, content);
    if (result) {
      Alert.alert('Success', 'File saved successfully!');
      loadFiles(); // Refresh file list
    }
  };

  const saveJsonFile = async () => {
    const data = {
      timestamp: new Date().toISOString(),
      data: 'Sample JSON data',
      count: Math.floor(Math.random() * 100),
    };
    const fileName = `data_${Date.now()}.json`;

    const result = await safManager.saveFileToDirectory(
      fileName,
      JSON.stringify(data, null, 2),
      'application/json'
    );
    if (result) {
      Alert.alert('Success', 'JSON file saved successfully!');
      loadFiles();
    }
  };

  const loadFiles = async () => {
    const fileList = await safManager.readFilesFromDirectory();
    setFiles(fileList.map((f) => new File(f)));
  };

  const playFile = async (file: File) => {
    console.log('parsing metadata...', { file: file.name, type: file.type });
    try {
      const bytes = await file.bytes();
      const metadata = await parseBuffer(new Uint8Array(bytes));
      console.log('metadata.common.title', metadata.common.title);
      console.log('metadata.common.album', metadata.common.album);
      console.log('metadata.common.artist', metadata.common.artist);
      console.log('metadata.format.duration', metadata.format.duration);
      const cover = selectCover(metadata.common.picture); // pick the cover image

      const artwork = new File(Paths.cache, 'artwork.jpg');
      artwork.create({ overwrite: true });
      artwork.write(new Uint8Array(cover?.data || []));
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: file.uri,
        title: metadata.common.title,
        artwork: artwork.uri,
        album: metadata.common.album,
        artist: metadata.common.artist,
        duration: metadata.format.duration,
      });
      await TrackPlayer.play();
    } catch (error) {
      console.error('error', error);
    }
  };

  const writeId3Tags = async (file: File) => {
    overlayLoader.setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const writer = new ID3Writer(arrayBuffer);
      writer.setFrame('TIT2', 'Home');
      // .setFrame('TPE1', ['Eminem', '50 Cent'])
      // .setFrame('TALB', 'Friday Night Lights')
      // .setFrame('TYER', 2004)
      // .setFrame('TRCK', '6/8')
      // .setFrame('TCON', ['Soundtrack'])
      // .setFrame('TBPM', 128)
      // .setFrame('WPAY', 'https://google.com')
      // .setFrame('TKEY', 'Fbm');
      // .setFrame('APIC', {
      //   type: 3,
      //   data: new Blob([new Uint8Array([])], {
      //     type: 'image/jpeg',
      //   }) as unknown as ArrayBuffer,
      //   description: 'Super picture',
      // });

      writer.addTag();
      console.log('tag', writer);

      let blob = new Blob(
        [new Uint8Array((writer as any).arrayBuffer as ArrayBuffer)],
        {
          type: file.type,
        }
      );
      let blobBytes = await blob.bytes();
      let tmp = new File(Paths.cache, 'tmp-' + file.name);
      tmp.create({ overwrite: true });
      tmp.write(blobBytes);
      await saf.moveFileToSAF(tmp.uri, 'saf-' + file.name);
      loadFiles();
    } catch (error) {
      console.error('error', error);
    } finally {
      overlayLoader.setLoading(false);
    }
  };

  const deleteFile = async (file: File) => {
    const safFile = new File(file.uri);
    if (safFile.exists) {
      safFile.delete();
      Alert.alert('Success', 'File deleted successfully!');
      loadFiles();
    } else {
      Alert.alert('Error', 'File not found!');
    }
    loadFiles();
  };

  if (!hasAccess) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          padding: 16,
          height: 600,
        }}
      >
        <Button title="Request Directory Access" onPress={requestAccess} />
        <Text style={{ color: colors.text, textAlign: 'center' }}>
          This app needs access to your directory to show your files.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ gap: 10, padding: 16 }}>
        {/* <Button title="Save Text File" onPress={saveTextFile} />
            <Button title="Save JSON File" onPress={saveJsonFile} /> */}
        <Button title="Load Files" onPress={loadFiles} />
        <Button title="Remove Access" onPress={revokeAccess} />
      </View>

      {files.length > 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          {files.map((file, index) => {
            if (file instanceof File) {
              return (
                <ListItem
                  key={index}
                  title={file.name || ''}
                  numberOfLinesTitle={10}
                  description={`${formatBytes(file.size)} &bull; ${file.type}`}
                  onPress={() => playFile(file)}
                  onLongPress={() => writeId3Tags(file)}
                  StartElement={
                    isAudioFile(file) ? (
                      <MaterialIcons
                        name="music-note"
                        size={24}
                        color={colors.text}
                      />
                    ) : (
                      <MaterialIcons
                        name="file-copy"
                        size={24}
                        color={colors.text}
                      />
                    )
                  }
                  image={null}
                  EndElement={
                    <Pressable onPress={() => deleteFile(file)}>
                      <MaterialIcons
                        name="delete"
                        size={24}
                        color={colors.text}
                      />
                    </Pressable>
                  }
                />
              );
            }
            if (file instanceof Directory) {
              return (
                <Pressable key={index}>
                  <Text>• {file.name}</Text>
                </Pressable>
              );
            }
            return null;
          })}
        </View>
      )}
    </ScrollView>
  );
}

function HttpDebugger() {
  const colors = useThemeColors();
  let [requests, setRequests] = useState<RequestLog[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const subscription = logInterceptor.getLogs().subscribe((logs) => {
      if (!isFocused) return;
      setRequests(logs);
    });
    return () => subscription.unsubscribe();
  }, [isFocused]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'green';
    }
    if (status >= 300 && status < 400) {
      return 'yellow';
    }
    return 'blue';
  };

  return (
    <FlatList<RequestLog>
      data={requests}
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: 200,
        gap: 10,
        paddingHorizontal: 16,
      }}
      renderItem={({ item }) => {
        return (
          <View
            style={{ flexDirection: 'row', gap: 10, flex: 1, flexWrap: 'wrap' }}
          >
            <View
              style={{
                backgroundColor: getStatusColor(item.response?.status || 0),
                padding: 4,
                borderRadius: 4,
              }}
            />
            <Text style={{ color: colors.text }}>
              {item.response?.status} {item.request?.method} {item.request?.url}
              {'\n'}
              {JSON.stringify(item?.response?.data || {}, null, 2).substring(
                0,
                200
              ) + '\n...response truncated'}
            </Text>
          </View>
        );
      }}
    />
  );
}

export default function SystemStorageDebugger() {
  const [selectedTab, setSelectedTab] = useState<
    'saf' | 'files' | 'http' | 'downloads'
  >('downloads');
  const insets = useSafeAreaInsets();
  const {
    theme: { colors },
    mode,
  } = useTheme();
  return (
    <View
      style={{ paddingTop: insets.top + 16, flex: 1, flexDirection: 'column' }}
    >
      <SegmentedControl
        appearance={mode === 'dark' ? 'light' : 'dark'}
        tintColor={colors.border}
        backgroundColor={colors.card}
        values={['Downloads', 'SAF', 'Files', 'HTTP']}
        selectedIndex={
          selectedTab === 'downloads'
            ? 0
            : selectedTab === 'saf'
              ? 1
              : selectedTab === 'files'
                ? 2
                : 3
        }
        onChange={async (event) => {
          setSelectedTab(
            event.nativeEvent.selectedSegmentIndex === 0
              ? 'downloads'
              : event.nativeEvent.selectedSegmentIndex === 1
                ? 'saf'
                : event.nativeEvent.selectedSegmentIndex === 2
                  ? 'files'
                  : event.nativeEvent.selectedSegmentIndex === 3
                    ? 'http'
                    : 'downloads'
          );
        }}
        style={{ marginHorizontal: 16 }}
      />
      <View style={{ flex: 1 }}>
        {selectedTab === 'downloads' ? (
          <DownloadsScreenV2 />
        ) : selectedTab === 'saf' ? (
          <SAFFileExplorer />
        ) : selectedTab === 'files' ? (
          <SystemFileExplorer />
        ) : (
          <HttpDebugger />
        )}
      </View>
    </View>
  );
}
