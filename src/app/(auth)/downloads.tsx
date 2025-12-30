import { useLocalSearchParams } from 'expo-router';

import DownloadsScreen from '@/screens/downloads/DownloadsScreen';

export default function Page() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  return <DownloadsScreen url={url} />;
}
