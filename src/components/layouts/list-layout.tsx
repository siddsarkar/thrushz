import FontAwesome5 from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatDuration } from '@/utils/format/duration';

export type ListItemType = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  duration?: number;
  [key: string]: unknown;
};

export type ListLayoutProps = {
  title: string;
  description?: string;
  image?: string;
  items: ListItemType[];
  itemCount: number;
  onItemPress?: (item: ListItemType) => void;
};

const HEADER_HEIGHT = 350;

export function ListLayout(props: ListLayoutProps) {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const scrollY = useRef(new Animated.Value(0)).current;

  const translateHeader = scrollY.interpolate({
    inputRange: [0, 260],
    outputRange: [0, -260],
    extrapolate: 'clamp',
  });
  const opacityImage = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const translateImage = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });

  const opacityTitle = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [200, 240],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });

  const scaleTitle = scrollY.interpolate({
    inputRange: [200, 240],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ backgroundColor: colors.background, position: 'relative' }}>
      <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-back" size={26} color={colors.text} />
      </Pressable>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.card },
          { transform: [{ translateY: translateHeader }] },
        ]}
      >
        <Animated.Image
          source={{ uri: props.image }}
          style={[
            styles.headerImage,
            { backgroundColor: colors.card },
            { opacity: opacityImage },
            { transform: [{ translateY: translateImage }] },
          ]}
        />

        <Animated.Text
          style={[
            typography.h1,
            styles.headerTitle,
            { color: colors.text },
            { opacity: opacityTitle },
            {
              transform: [
                { translateX: translateTitle },
                { scale: scaleTitle },
              ],
            },
          ]}
          numberOfLines={1}
        >
          {props.title}
        </Animated.Text>

        <View>
          <Animated.Text
            style={[
              typography.h1,
              styles.headerLeftAlignedTitle,
              { color: colors.text },
              { opacity: opacityImage },
            ]}
            numberOfLines={1}
          >
            {props.title}
          </Animated.Text>
          <Animated.Text
            style={[
              typography.body,
              styles.subtitle,
              { color: colors.textMuted },
              { opacity: opacityImage },
            ]}
          >
            {props.itemCount} songs
          </Animated.Text>
        </View>
      </Animated.View>
      <Animated.FlatList
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        data={props.items}
        scrollEventThrottle={1}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: ListItemType }) => (
          <ListItem
            title={item.title}
            numberOfLinesTitle={2}
            description={item.description}
            numberOfLinesDescription={1}
            image={item.image}
            onPress={() => props.onItemPress?.(item)}
            EndElement={
              item.duration ? (
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {formatDuration(item.duration)}
                </Text>
              ) : null
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    padding: 16,
    paddingTop: HEADER_HEIGHT + 12,
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    height: HEADER_HEIGHT,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  headerBackButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 120,
    width: 80,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  headerImage: {
    flex: 1,
    marginTop: 70,
    aspectRatio: 1,
    marginHorizontal: 'auto',
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'bold',
    marginRight: 'auto',
    transformOrigin: 'left',
    position: 'absolute',
    bottom: 12,
    left: 20,
  },
  headerLeftAlignedTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 'bold',
    marginHorizontal: 'auto',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
});
