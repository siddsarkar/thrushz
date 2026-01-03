import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['audio'],
  });

  useEffect(() => {
    if (permissionResponse?.granted) {
      const fetchAlbums = async () => {
        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });
        setAlbums(fetchedAlbums);
      };

      fetchAlbums();
    }
  }, [permissionResponse]);

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      await requestPermission();
    }
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    setAlbums(fetchedAlbums);
  }

  if (permissionResponse?.status !== 'granted') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Button onPress={getAlbums} title="Allow access" />
        <Text style={{ color: colors.text, textAlign: 'center' }}>
          This app needs access to your media library to show your songs.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={albums}
      renderItem={({ item }) => (
        <ListItem title={item.title} description="Folder" />
      )}
      ListHeaderComponent={
        <Text style={[typography.h1, { color: colors.text }]}>Library</Text>
      }
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
        gap: 10,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumContainer: {
    marginBottom: 16,
  },
  albumAssetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
