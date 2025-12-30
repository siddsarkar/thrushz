import { MaterialIcons } from '@expo/vector-icons';
import { ID3Writer } from 'browser-id3-writer';
import { Blob } from 'expo-blob';
import { Directory, File, Paths } from 'expo-file-system';
import { parseBuffer, selectCover } from 'music-metadata';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';

import { ListItem } from '@/components/ui/ListItem';
import { useOverlayLoader } from '@/hooks/useOverlayLoader';
import { useSAF } from '@/hooks/useSAF';
import { useStorageState } from '@/hooks/useStorageState';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatBytes } from '@/utils/format/bytes';
import { SAFManager } from '@/utils/saf-manager';

export default function SAFExplorerScreen() {
  const colors = useThemeColors();
  const typography = useThemeTypography();
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
        console.log('Stored URI found:', storedUri);
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
      // Store the URI for future use
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
    let files: File[] = [];
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
  };

  const loadSAFFiles = async () => {
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
    } catch (error) {
      console.error('error', error);
    } finally {
      overlayLoader.setLoading(false);
    }
  };

  const deleteFile = async (file: File) => {
    const safFile = new File(file.uri);
    if (safFile.exists) {
      await safFile.delete();
      Alert.alert('Success', 'File deleted successfully!');
      loadFiles();
    } else {
      Alert.alert('Error', 'File not found!');
    }
    loadFiles();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Expo SAF File Manager</Text>

      {!hasAccess ? (
        <Button title="Request Directory Access" onPress={requestAccess} />
      ) : (
        <View>
          <Text style={styles.status}>✅ Directory access granted</Text>

          <View style={styles.buttonContainer}>
            {/* <Button title="Save Text File" onPress={saveTextFile} />
            <Button title="Save JSON File" onPress={saveJsonFile} /> */}
            <Button title="Load Files" onPress={loadFiles} />
            <Button title="Load SAF Files" onPress={loadSAFFiles} />
            {/* <Button title="Revoke Access" onPress={revokeAccess} /> */}
          </View>

          {files.length > 0 && (
            <View style={styles.filesContainer}>
              {files.map((file, index) => {
                if (file instanceof File) {
                  return (
                    <ListItem
                      key={index}
                      title={file.name || ''}
                      numberOfLinesTitle={10}
                      description={formatBytes(file.size)}
                      onPress={() => playFile(file)}
                      onLongPress={() => writeId3Tags(file)}
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
                      <Text style={styles.fileName}>• {file.name}</Text>
                    </Pressable>
                  );
                }
                return null;
              })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: 'green',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  filesContainer: {
    // marginTop: 20,
    // padding: 15,
    // backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 10,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 14,
    marginBottom: 5,
  },
});
