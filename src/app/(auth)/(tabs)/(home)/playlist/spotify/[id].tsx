import SpotifyPlaylistScreen from '@/screens/playlist/SpotifyPlaylistScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SpotifyPlaylistScreen playlistId={id} />;
}
