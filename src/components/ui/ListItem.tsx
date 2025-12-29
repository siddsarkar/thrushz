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
  EndElement?: React.ReactNode;
};

export function ListItem(props: ListItemProps) {
  const {
    title,
    description,
    numberOfLinesTitle = 1,
    numberOfLinesDescription = 1,
    image,
    onPress,
    EndElement,
  } = props;

  const colors = useThemeColors();
  const typography = useThemeTypography();
  return (
    <Pressable
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      onPress={onPress}
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
          style={[typography.body, { color: colors.text }]}
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
