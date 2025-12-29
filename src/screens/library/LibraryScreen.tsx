import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export function Library() {
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

  return permissionResponse?.status !== 'granted' ? (
    <View style={styles.container}>
      <Button onPress={getAlbums} title="Get albums" />
    </View>
  ) : (
    <ScrollView contentContainerStyle={{ gap: 10, padding: 16 }}>
      <Text style={[typography.h1, { color: colors.text }]}>Library</Text>
      {albums &&
        albums.map((album) => (
          <ListItem
            key={album.id}
            onPress={() =>
              router.push({
                pathname: '/library-album/[id]',
                params: { id: album.title },
              })
            }
            title={album.title}
            description="Folder"
          />
        ))}
    </ScrollView>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Library />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
