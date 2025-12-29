import { useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';

import ambientSounds from '@/assets/data/google-ambient-sounds.json';
import { PlaylistLayout } from '@/components/layouts/playlist-layout';


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
    <PlaylistLayout
      title="Ambient Sounds"
      listCount={sounds.length}
      image={sounds[0].artwork}
      description="Ambient sounds to relax and sleep"
      songs={sounds.map((sound) => ({
        id: sound.id.toString(),
        title: sound.title,
        image: sound.artwork,
      }))}
      onItemPress={handlePress}
    />
  );
}
