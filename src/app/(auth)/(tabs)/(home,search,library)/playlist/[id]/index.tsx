import { useLocalSearchParams } from 'expo-router';

import PlaylistScreen from '@/screens/playlist/PlaylistScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaylistScreen playlistId={id} />;
}
