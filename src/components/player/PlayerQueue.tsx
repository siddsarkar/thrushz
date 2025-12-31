import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { Track, useActiveTrack } from 'react-native-track-player';

import { ListItem } from '../ui/ListItem';

export const useTrackPlayerQueue = () => {
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    let unmounted = false;

    const fetchQueue = async () => {
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      setQueue(queue);
    };

    fetchQueue();

    return () => {
      unmounted = true;
    };
  }, []);

  return queue;
};

export function PlayerQueue() {
  const queue = useTrackPlayerQueue();
  const activeSong = useActiveTrack();
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={queue}
      renderItem={({ item, index }) => (
        <ListItem
          title={item.title || ''}
          description={item.artist}
          image={item.artwork}
          isPlaying={activeSong?.id === item.id}
          onPress={() => TrackPlayer.skip(index)}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    />
  );
}
