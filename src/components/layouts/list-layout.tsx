import Icon from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Fragment, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack } from 'react-native-track-player';

import { ListItem } from '@/components/ui/ListItem';
import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatDuration } from '@/utils/format/duration';

import { SkeletonLoader } from '../ui/Skeleton';

export type ListItemType = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  duration?: number;
  // isPlaying?: boolean;
  isPlayable?: boolean;
  [key: string]: unknown;
};

type MoreIcon = React.ComponentProps<typeof Icon>['name'];
export type ListLayoutProps = {
  title: string;
  description?: string;
  image?: string;
  items: ListItemType[];
  itemCount: number;
  isDownloaded?: boolean;
  onItemPress?: (item: ListItemType) => void;
  onItemLongPress?: (item: ListItemType) => void;
  moreIcon?: MoreIcon;
  onMorePress?: () => void;
  footer?: React.ReactElement | null;
};

const HEADER_HEIGHT = 400;
const MIN_HEADER_HEIGHT = 90;

const HEADER_HEIGHT_DIFF = HEADER_HEIGHT - MIN_HEADER_HEIGHT;

export function ListLayoutSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top + 24 }}>
      {/* Cover Image Skeleton */}
      <View
        style={{ padding: 16, justifyContent: 'center', alignItems: 'center' }}
      >
        <SkeletonLoader height={250} width={250} />
        {/* Title Skeleton */}
        <View style={{ padding: 16, gap: 10, alignItems: 'center' }}>
          <SkeletonLoader height={20} width={150} />
          <SkeletonLoader height={15} width={100} />
        </View>
      </View>

      {/* List Items Skeleton */}
      {Array.from({ length: 10 }).map((_, index) => (
        <View
          key={index}
          style={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <SkeletonLoader height={50} width={50} />
          <View style={{ gap: 10, flex: 1 }}>
            <SkeletonLoader height={15} width={150} />
            <SkeletonLoader height={15} width={50} />
          </View>
          <SkeletonLoader height={15} width={30} />
        </View>
      ))}
    </View>
  );
}

export function ListLayout(props: ListLayoutProps) {
  const activeSong = useActiveTrack();
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;

  const translateHeader = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT_DIFF],
    outputRange: [0, -HEADER_HEIGHT_DIFF],
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

  // translates the title to the right
  const translateTitle = scrollY.interpolate({
    inputRange: [250, 290],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });

  const scaleTitle = scrollY.interpolate({
    inputRange: [250, 290],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ backgroundColor: colors.background, position: 'relative' }}>
      <Pressable
        style={{
          paddingTop: insets.top,
          position: 'absolute',
          top: 0,
          left: 0,
          height: MIN_HEADER_HEIGHT,
          // width: 80,
          aspectRatio: 1,
          justifyContent: 'center',
          // alignItems: 'center',
          zIndex: 2,
          paddingHorizontal: 24,
          // backgroundColor: 'blue',
        }}
        onPress={() => router.back()}
      >
        <Icon name="arrow-back" size={20} color={colors.text} />
      </Pressable>

      {props.onMorePress && (
        <View
          style={{
            paddingTop: insets.top,
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 2,
            height: MIN_HEADER_HEIGHT,
            aspectRatio: 1,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'flex-start',
            // gap: 10,
            paddingHorizontal: 20,
            paddingLeft: 40,
            // backgroundColor: colors.background,
          }}
        >
          <Pressable
            style={{
              height: MIN_HEADER_HEIGHT - insets.top,
              width: 40,
              // backgroundColor: 'blue',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={props.onMorePress}
          >
            <Icon
              name={props.moreIcon || 'ellipsis-vertical'}
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>
      )}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.background },
          { transform: [{ translateY: translateHeader }] },
        ]}
      >
        <Animated.Image
          source={
            props.image
              ? { uri: props.image }
              : require('@/assets/images/android-icon-foreground.png')
          }
          style={[
            styles.headerImage,
            { backgroundColor: colors.card },
            { opacity: opacityImage },
            { transform: [{ translateY: translateImage }] },
          ]}
        />

        <Animated.Text
          style={[
            typography.h3,
            styles.headerLeftAlignedTitle,
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

        <View style={{ paddingTop: 10 }}>
          <Animated.Text
            style={[
              typography.h3,
              styles.headerTitle,
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
            isPlayable={item.isPlayable}
            isPlaying={activeSong?.id === item.id}
            description={item.description}
            numberOfLinesDescription={1}
            image={item.image}
            onPress={() => props.onItemPress?.(item)}
            onLongPress={() => props.onItemLongPress?.(item)}
            EndElement={
              <Fragment>
                {item.isDownloaded ? (
                  <Icon
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                  />
                ) : null}
                {item.duration ? (
                  <Text
                    style={[typography.caption, { color: colors.textMuted }]}
                  >
                    {formatDuration(item.duration)}
                  </Text>
                ) : null}
              </Fragment>
            }
          />
        )}
        ListFooterComponent={props.footer ?? <View style={{ height: 150 }} />}
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
  headerImage: {
    flex: 1,
    marginTop: 70,
    aspectRatio: 1,
    marginHorizontal: 'auto',
  },
  headerTitle: {
    marginHorizontal: 'auto',
    textAlign: 'center',
  },
  headerLeftAlignedTitle: {
    marginRight: 'auto',
    transformOrigin: 'left',
    position: 'absolute',
    bottom: 12,
    left: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
});
