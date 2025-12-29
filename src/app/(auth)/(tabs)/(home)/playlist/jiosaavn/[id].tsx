import { useLocalSearchParams } from 'expo-router';

import JiosaavnPlaylistScreen from '@/screens/playlist/JiosaavnPlaylistScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <JiosaavnPlaylistScreen playlistId={id} />;
}
