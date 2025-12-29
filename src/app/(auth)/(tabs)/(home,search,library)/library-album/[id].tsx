import { useLocalSearchParams } from 'expo-router';

import LibraryAlbumScreen from '@/screens/library/LibraryAlbumScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LibraryAlbumScreen albumId={id} />;
}
