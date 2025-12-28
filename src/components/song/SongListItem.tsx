import { Image } from 'expo-image';
import { Pressable, Text } from 'react-native';

import { useThemeColors } from '@/theme/hooks/useTheme';

export type SongListItemProps = {
  title: string;
  description?: string;
  image?: string;
  onPress?: () => void;
};

export function SongListItem(props: SongListItemProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      onPress={props.onPress}
    >
      <Image source={{ uri: props.image }} style={{ width: 80, height: 80 }} />
      <Text style={{ color: colors.text }}>{props.title}</Text>
    </Pressable>
  );
}
