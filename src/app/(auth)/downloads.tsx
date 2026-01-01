import { useLocalSearchParams } from 'expo-router';

import DownloadsScreenV2 from '@/screens/downloads/DownloadsScreenV2';

export default function Page() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  return <DownloadsScreenV2 url={url} />;
}
