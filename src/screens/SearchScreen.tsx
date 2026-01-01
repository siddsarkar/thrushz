import React, { useCallback } from 'react';
import { View } from 'react-native';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { jiosaavnApi, JiosaavnApiSong } from '@/api';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ListItem } from '@/components/ui/ListItem';
import VirtualizedPaginatedList, {
  FetchDataParams,
  PaginatedResponse,
} from '@/components/ui/VirtualizedPaginatedList';

export default function SongSearchScreen() {
  const activeTrack = useActiveTrack();

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
      isPlaying={activeTrack?.id === item.id}
    />
  );

  const getSongKey = (item: JiosaavnApiSong, index: number): string => {
    return `song-${item.id}-${index}`;
  };

  return (
    <VirtualizedPaginatedList<JiosaavnApiSong>
      title="song"
      fetchData={fetchSongs}
      renderItem={renderSong}
      keyExtractor={getSongKey}
      itemsPerPage={20}
      inputPlaceholderText="Search songs..."
      searchDebounceMs={500}
      enablePullToRefresh={true}
      flatListProps={{
        showsVerticalScrollIndicator: false,
        contentContainerStyle: { gap: 10 },
        style: { flex: 1, padding: 16 },
        ListFooterComponent: () => <View style={{ height: 150 }} />,
      }}
      enableLoadMore={true}
    />
  );
}
