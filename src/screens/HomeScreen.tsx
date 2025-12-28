import { JiosaavnApiClient } from '@/api/jiosaavn';
import { JiosaavnApiSong } from '@/api/jiosaavn/models/Song';
import {
  createDownloadLinks,
  createImageLinks,
} from '@/api/jiosaavn/utils/helpers';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useThemeColors } from '@/theme/hooks/useTheme';
import { Image } from 'expo-image';
import { Suspense, use } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';

const fetchPlaylistSongs = async (id: string): Promise<JiosaavnApiSong[]> => {
  const playlist = await new JiosaavnApiClient().getPlaylistDetails(id, {
    perPage: 100,
  });
  return playlist.list;
};

const SongDisplay = ({ song }: { song: JiosaavnApiSong }) => {
  const colors = useThemeColors();

  const handlePress = async () => {
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
    });
    await TrackPlayer.play();
  };

  return (
    <Pressable
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      onPress={handlePress}
    >
      <Image source={{ uri: song.image }} style={{ width: 100, height: 100 }} />
      <Text style={{ color: colors.text }}>{song.title}</Text>
    </Pressable>
  );
};

const SongListDisplay = ({
  songsPromise,
}: {
  songsPromise: Promise<JiosaavnApiSong[]>;
}) => {
  const songs = use(songsPromise);
  return (
    <FlatList
      data={songs}
      renderItem={({ item }: { item: JiosaavnApiSong }) => (
        <SongDisplay song={item} />
      )}
    />
  );
};

export default function HomeScreen() {
  const songPromise = fetchPlaylistSongs('waNcnezc7nIrZqI-DFN-4Q__');
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ErrorBoundary
        fallback={<Text style={{ color: colors.text }}>Error</Text>}
      >
        <Suspense
          fallback={<Text style={{ color: colors.text }}>Loading...</Text>}
        >
          <SongListDisplay songsPromise={songPromise} />
        </Suspense>
      </ErrorBoundary>
    </View>
  );
}
