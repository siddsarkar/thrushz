import { useLocalSearchParams } from 'expo-router';

import SpotifyPlaylistScreen from '@/screens/playlist/SpotifyPlaylistScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SpotifyPlaylistScreen playlistId={id} />;
}
