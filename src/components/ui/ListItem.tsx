import { Image } from 'expo-image';
import { decode } from 'html-entities';
import { Pressable, Text, View } from 'react-native';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export type ListItemProps = {
  title: string;
  description?: string;
  numberOfLinesTitle?: number;
  numberOfLinesDescription?: number;
  image?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  EndElement?: React.ReactNode;
  isPlayable?: boolean;
  isPlaying?: boolean;
};

export function ListItem(props: ListItemProps) {
  const {
    title,
    description,
    numberOfLinesTitle = 1,
    numberOfLinesDescription = 1,
    image,
    onPress,
    onLongPress,
    EndElement,
    isPlayable = true,
    isPlaying = false,
  } = props;

  const colors = useThemeColors();
  const typography = useThemeTypography();
  return (
    <Pressable
      style={[
        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
        !isPlayable && { opacity: 0.5 },
      ]}
      onPress={isPlayable ? onPress : undefined}
      onLongPress={isPlayable ? onLongPress : undefined}
    >
      <Image
        source={{ uri: image }}
        style={{
          width: 50,
          aspectRatio: 1,
          backgroundColor: colors.card,
        }}
        placeholder={require('@/assets/images/android-icon-foreground.png')}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            typography.body,
            { color: isPlaying ? colors.accent : colors.text },
          ]}
          numberOfLines={numberOfLinesTitle}
        >
          {decode(title)}
        </Text>
        {description && (
          <Text
            style={[typography.caption, { color: colors.textMuted }]}
            numberOfLines={numberOfLinesDescription}
          >
            {decode(description)}
          </Text>
        )}
      </View>
      {EndElement}
    </Pressable>
  );
}
