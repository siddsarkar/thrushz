import { Text, View } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export default function AddToPlaylistScreen({
  playlistId,
}: {
  playlistId?: string;
}) {
  const colors = useThemeColors();
  return (
    <View>
      <Text style={{ color: colors.text }}>AddToPlaylistScreen</Text>
    </View>
  );
}
