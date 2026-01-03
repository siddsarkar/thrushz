import { MaterialIcons } from '@expo/vector-icons';
import { eq, inArray } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { ListItem } from '@/components/ui/ListItem';
import { db } from '@/db';
import {
  downloadedSongsTable,
  downloadsTable,
  metadataTable,
  songsMetadataTable,
} from '@/db/schema';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

type Metadata = typeof metadataTable.$inferSelect & {
  songId?: string;
};

export default function OfflineSongsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const activeSong = useActiveTrack();

  const { data: downloadedSongs } = useLiveQuery(
    db.select().from(downloadedSongsTable),
    []
  );

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      const songMetadata = await db
        .select()
        .from(songsMetadataTable)
        .where(
          inArray(
            songsMetadataTable.songId,
            downloadedSongs?.map((song) => song.songId) || []
          )
        );

      const metadata = await db
        .select()
        .from(metadataTable)
        .where(
          inArray(
            metadataTable.id,
            songMetadata?.map((m) => m.metadataId) || []
          )
        );

      setMetadata(
        metadata.map((item) => ({
          ...item,
          songId: songMetadata.find((m) => m.metadataId === item.id)?.songId,
        }))
      );
    };
    fetchMetadata();
  }, [downloadedSongs]);

  const onItemPress = useCallback(async (item: Metadata) => {
    // find the download
    const songMetadata = await db
      .select()
      .from(songsMetadataTable)
      .where(eq(songsMetadataTable.metadataId, item.id));

    const songDownload = await db
      .select()
      .from(downloadedSongsTable)
      .where(eq(downloadedSongsTable.songId, songMetadata[0].songId));

    console.log({ songMetadata, songDownload });
    if (songDownload && songDownload.length > 0) {
      const download = await db
        .select()
        .from(downloadsTable)
        .where(eq(downloadsTable.id, songDownload[0].downloadId));
      console.log({ download });
      if (download && download.length > 0) {
        await TrackPlayer.reset();
        TrackPlayer.add({
          url: download[0].uri,
          album: 'Offline Songs',
          title: item.title,
          artist: item.artist,
          artwork: item.artwork,
          id: songMetadata[0].songId,
          canFavorite: true,
        });
        TrackPlayer.play();
      }
    }
  }, []);

  const handleDeleteSong = useCallback(async (item: Metadata) => {
    // find the download
    const songMetadata = await db
      .select()
      .from(songsMetadataTable)
      .where(eq(songsMetadataTable.metadataId, item.id));

    const songDownload = await db
      .select()
      .from(downloadedSongsTable)
      .where(eq(downloadedSongsTable.songId, songMetadata[0].songId));

    console.log({ songMetadata, songDownload });
    if (songDownload && songDownload.length > 0) {
      const download = await db
        .select()
        .from(downloadsTable)
        .where(eq(downloadsTable.id, songDownload[0].downloadId));

      if (download && download.length > 0) {
        TrackPlayer.getQueue().then((queue) => {
          const queueIndex = queue.findIndex(
            (q) => q.id === songMetadata[0].songId
          );
          if (queueIndex !== -1) {
            TrackPlayer.remove(queueIndex);
          }
        });

        let file = new File(download[0].uri);
        if (file.exists) {
          file.delete();
        }
        let artworkFile = new File(item.artwork);
        if (artworkFile.exists) {
          artworkFile.delete();
        }

        await db
          .delete(downloadsTable)
          .where(eq(downloadsTable.id, songDownload[0].downloadId));

        await db
          .delete(downloadedSongsTable)
          .where(eq(downloadedSongsTable.songId, songMetadata[0].songId));
      }
    }
  }, []);

  return (
    <FlatList
      data={metadata}
      renderItem={({ item }) => (
        <ListItem
          title={item.title}
          description={item.artist}
          image={item.artwork}
          onPress={() => onItemPress(item)}
          isPlaying={item.songId ? activeSong?.id === item.songId : false}
          EndElement={
            <Pressable onPress={() => handleDeleteSong(item)}>
              <MaterialIcons name="delete" size={24} color={colors.text} />
            </Pressable>
          }
        />
      )}
      ListHeaderComponent={
        <Text style={[typography.h1, { color: colors.text }]}>
          Offline Songs
        </Text>
      }
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
        gap: 10,
      }}
    />
  );
}
