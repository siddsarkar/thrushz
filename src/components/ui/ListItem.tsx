import { Image } from 'expo-image';
import { decode } from 'html-entities';
import {
  ImageStyle,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';

export type ListItemProps = {
  title: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  description?: string;
  numberOfLinesTitle?: number;
  numberOfLinesDescription?: number;
  image?: string | null;
  imageStyle?: StyleProp<ImageStyle>;
  StartElement?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  EndElement?: React.ReactNode;
  isPlayable?: boolean;
  isPlaying?: boolean;
};

export function ListItem(props: ListItemProps) {
  const {
    title,
    style,
    imageStyle,
    titleStyle,
    description,
    numberOfLinesTitle = 1,
    numberOfLinesDescription = 1,
    image,
    onPress,
    onLongPress,
    EndElement,
    StartElement,
    isPlayable = true,
    isPlaying = false,
  } = props;

  const colors = useThemeColors();
  const typography = useThemeTypography();
  return (
    <Pressable
      style={[
        style,
        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
        !isPlayable && { opacity: 0.5 },
      ]}
      onPress={isPlayable ? onPress : undefined}
      onLongPress={isPlayable ? onLongPress : undefined}
    >
      {StartElement}
      {image !== null && (
        <Image
          source={{ uri: image }}
          transition={500}
          style={[
            {
              width: 50,
              aspectRatio: 1,
            },
            imageStyle,
          ]}
          placeholder={require('@/assets/images/android-icon-foreground.png')}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            typography.body,
            { color: colors.text },
            titleStyle,
            isPlaying && { color: colors.accent },
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
