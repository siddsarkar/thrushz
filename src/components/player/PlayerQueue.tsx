import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { ListItem } from '@/components/ui/ListItem';
import { usePlayerQueue } from '@/hooks/player/usePlayerQueue';

export function PlayerQueue() {
  const { queue } = usePlayerQueue();
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
      keyExtractor={(item, index) => `${item.id}-${index}`}
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    />
  );
}
