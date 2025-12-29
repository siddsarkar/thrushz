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

import { useStorageState } from '@/hooks/useStorageState';
import { SAFManager } from '@/utils/saf-manager';

export default function SAFExplorerScreen() {
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
    if (storedUri) {
      const dir = new Directory(storedUri);
      if (dir.exists) {
        const files = dir.list();
        setFiles(files);
      }
    }
    // console.log(files.map((f) => f.name));
    // const fileList = await safManager.readFilesFromDirectory();
  };

  const playFile = async (file: File) => {
    console.log('parsing metadata...', { file: file.name, type: file.type });
    try {
      const bytes = await file.bytes();
      const metadata = await parseBuffer(new Uint8Array(bytes));
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Expo SAF File Manager</Text>

      {!hasAccess ? (
        <Button title="Request Directory Access" onPress={requestAccess} />
      ) : (
        <View>
          <Text style={styles.status}>✅ Directory access granted</Text>

          <View style={styles.buttonContainer}>
            <Button title="Save Text File" onPress={saveTextFile} />
            <Button title="Save JSON File" onPress={saveJsonFile} />
            <Button title="Load Files" onPress={loadFiles} />
            <Button title="Revoke Access" onPress={revokeAccess} />
          </View>

          {files.length > 0 && (
            <View style={styles.filesContainer}>
              <Text style={styles.filesTitle}>Files in directory:</Text>
              {files.map((file, index) => {
                if (file instanceof File) {
                  return (
                    <Pressable key={index} onPress={() => playFile(file)}>
                      <Text style={styles.fileName}>• {file.uri}</Text>
                    </Pressable>
                  );
                }
                if (file instanceof Directory) {
                  return (
                    <Pressable key={index}>
                      <Text style={styles.fileName}>• {file.uri}</Text>
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
    marginBottom: 20,
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
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
