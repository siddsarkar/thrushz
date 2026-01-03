import { Ionicons } from '@expo/vector-icons';
import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiSong } from '@/api/jiosaavn';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ListItem } from '@/components/ui/ListItem';
import VirtualizedPaginatedList, {
  FetchDataParams,
  PaginatedResponse,
} from '@/components/ui/VirtualizedPaginatedList';
import { db } from '@/db';
import { playlistsSongsTable } from '@/db/schema';
import { useThemeColors } from '@/theme/hooks/useTheme';

export default function AddToPlaylistScreen({
  playlistId,
}: {
  playlistId?: string;
}) {
  const colors = useThemeColors();
  const { data: playlistSongs = [] } = useLiveQuery(
    db
      .select()
      .from(playlistsSongsTable)
      .where(eq(playlistsSongsTable.playlistId, playlistId || ''))
  );
  const fetchSongs = async (
    params: FetchDataParams
  ): Promise<PaginatedResponse<JiosaavnApiSong>> => {
    const { page, limit, searchQuery } = params;

    const songsResponse = await jiosaavnApi.searchSongs(searchQuery || '', {
      page,
      perPage: limit,
    });

    return {
      data: songsResponse.results ?? [],
      hasMore: (songsResponse.total ?? 0) > page * limit,
      total: songsResponse.total ?? 0,
    };
  };

  const onItemPress = useCallback(async (song: JiosaavnApiSong) => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      url:
        createDownloadLinks(song.more_info.encrypted_media_url || '')[0]?.url ||
        '',
      title: song.title,
      artist: song.more_info.artistMap?.primary_artists[0]?.name || '',
      artwork: createImageLinks(song.image || '')[0]?.url || '',
      duration: Number(song.more_info.duration || 0),
      id: song.id,
      canFavorite: true,
    });
    await TrackPlayer.play();
  }, []);

  const toggleItemInPlaylist = useCallback(
    (song: JiosaavnApiSong) => {
      if (!playlistId) return;
      const isInPlaylist = playlistSongs.some(
        (playlistSong) => playlistSong.songId === song.id
      );
      if (isInPlaylist) {
        db.delete(playlistsSongsTable)
          .where(
            and(
              eq(playlistsSongsTable.playlistId, playlistId),
              eq(playlistsSongsTable.songId, song.id)
            )
          )
          .then(() => {
            console.log('playlist item removed');
          });
      } else {
        db.insert(playlistsSongsTable)
          .values({
            playlistId,
            songId: song.id,
          })
          .then(() => {
            console.log('playlist item added');
          });
      }
    },
    [playlistSongs, playlistId]
  );
  const renderSong = ({
    item,
    index,
  }: {
    item: JiosaavnApiSong;
    index: number;
  }) => (
    <ListItem
      title={item.title}
      description={item.subtitle}
      image={item.image}
      onPress={() => onItemPress(item)}
      EndElement={
        <Pressable
          onPress={() => toggleItemInPlaylist(item)}
          style={{
            height: '100%',
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {playlistSongs.some(
            (playlistSong) => playlistSong.songId === item.id
          ) ? (
            <Ionicons name="remove" size={24} color={colors.text} />
          ) : (
            <Ionicons name="add" size={24} color={colors.text} />
          )}
        </Pressable>
      }
    />
  );

  const getSongKey = (item: JiosaavnApiSong, index: number): string => {
    return `song-${item.id}-${index}`;
  };

  return (
    <VirtualizedPaginatedList<JiosaavnApiSong>
      title="song"
      backButtonEnabled={true}
      fetchData={fetchSongs}
      renderItem={renderSong}
      keyExtractor={getSongKey}
      itemsPerPage={20}
      inputPlaceholderText="Search songs..."
      searchDebounceMs={500}
      enablePullToRefresh={true}
      flatListProps={{
        contentContainerStyle: { gap: 10 },
        style: { flex: 1, padding: 16 },
        ListFooterComponent: () => <View style={{ height: 150 }} />,
      }}
      enableLoadMore={true}
    />
  );
}
