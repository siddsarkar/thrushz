import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { Download, downloadManager } from '@/utils/download-manager';

export default function DownloadsScreenV2({ url }: { url?: string }) {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const [urlInput, setUrlInput] = useState(url || '');
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    const subscription = downloadManager
      .getDownloads()
      .subscribe((downloads) => {
        setDownloads(downloads);
      });
    return () => subscription.unsubscribe();
  }, []);

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
              <Pressable onPress={() => downloadManager.pauseDownload(item.id)}>
                <MaterialIcons name="pause" size={24} color={colors.text} />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => downloadManager.resumeDownload(item.id)}
              >
                <MaterialIcons
                  name="play-circle"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            )}
            <Pressable onPress={() => downloadManager.cancelDownload(item.id)}>
              <MaterialIcons name="delete" size={24} color={colors.text} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable onPress={() => downloadManager.deleteDownload(item.id)}>
              <MaterialIcons name="delete" size={24} color={colors.text} />
            </Pressable>
          </View>
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={[typography.h6, { color: colors.text }]}>
          Download Manager
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter URL"
          value={urlInput}
          onChangeText={setUrlInput}
        />
        <Button
          title="Add Download"
          onPress={() => downloadManager.addDownload(urlInput)}
        />
      </View>
      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
