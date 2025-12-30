import { useLocalSearchParams } from 'expo-router';

import AddToPlaylistScreen from '@/screens/playlist/AddToPlaylistScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <AddToPlaylistScreen playlistId={id} />;
}
