import { useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';

import ambientSounds from '@/assets/data/google-ambient-sounds.json';
import { ListLayout } from '@/components/layouts/list-layout';

export default function AmbientSoundsPlaylistScreen() {
  const sounds = ambientSounds;

  const handlePress = useCallback(
    async ({ id }: { id: string }) => {
      const sound = sounds.find((sound) => sound.id.toString() === id);
      if (!sound) return;
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: sound.url,
        title: sound.title,
        artist: sound.artist,
        artwork: sound.artwork,
        duration: sound.duration,
        id: sound.id,
      });
      await TrackPlayer.play();
    },
    [sounds]
  );

  return (
    <ListLayout
      title="Ambient Sounds"
      itemCount={sounds.length}
      image={sounds[0].artwork}
      description="Ambient sounds to relax and sleep"
      items={sounds.map((sound) => ({
        ...sound,
        id: sound.id.toString(),
        image: sound.artwork,
      }))}
      onItemPress={handlePress}
    />
  );
}
