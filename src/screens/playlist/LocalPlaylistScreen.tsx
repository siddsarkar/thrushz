import { useCallback } from 'react';
import TrackPlayer from 'react-native-track-player';

import localPlaylist from '@/assets/data/playlist.json';
import { ListLayout } from '@/components/layouts/list-layout';

export default function LocalPlaylistScreen() {
  const tracks = localPlaylist;

  const handlePress = useCallback(
    async ({ id }: { id: string }) => {
      const track = tracks.find((_, index) => index.toString() === id);
      if (!track) return;
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      });
      await TrackPlayer.play();
    },
    [tracks]
  );

  return (
    <ListLayout
      title="Local Playlist"
      itemCount={tracks.length}
      image={tracks[0].artwork}
      description="Local playlist to relax and sleep"
      items={tracks.map((sound, index) => ({
        ...sound,
        id: index.toString(),
        image: sound.artwork,
      }))}
      onItemPress={handlePress}
    />
  );
}
