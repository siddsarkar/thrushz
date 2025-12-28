import JiosaavnPlaylistScreen from '@/screens/playlist/JiosaavnPlaylistScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <JiosaavnPlaylistScreen playlistId={id} />;
}
